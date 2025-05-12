from rest_framework import views, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken
from core.models import EmailVerificationToken, Users
from api.serializers import (
    UserRegisterSerializer, UserLoginSerializer, 
    ChangePasswordSerializer, ChangeUsernameSerializer, 
    ChangeAvatarSerializer, AdminSerializer
)
from .serializers import (
    EmailVerificationRequestSerializer, EmailVerificationSerializer
)
from core.models import Users, Admins
from rest_framework import generics
from django.http import HttpResponse
from django.utils import timezone
import uuid
from datetime import timedelta
from django.core.mail import send_mail
from django.conf import settings

import logging

logger = logging.getLogger(__name__)

class RegisterView(views.APIView):
    def post(self, request):
        serializer = UserRegisterSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            user.last_day_online = timezone.now()
            user.save()
            refresh = RefreshToken.for_user(user)
            return Response({
                'refresh': str(refresh),
                'access': str(refresh.access_token),
                'user_id': user.id_user,
                'username': user.username,
            }, status=status.HTTP_201_CREATED)
        return Response({"errors": serializer.errors}, status=status.HTTP_400_BAD_REQUEST)

class LoginView(views.APIView):
    def post(self, request):
        serializer = UserLoginSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.validated_data['user']
            user.last_day_online = timezone.now()
            user.save()
            refresh = RefreshToken.for_user(user)
            return Response({
                'refresh': str(refresh),
                'access': str(refresh.access_token),
                'user_id': user.id_user,
                'username': user.username,
            }, status=status.HTTP_200_OK)
        return Response({"errors": serializer.errors}, status=status.HTTP_400_BAD_REQUEST)

class ChangePasswordView(views.APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = ChangePasswordSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            user = request.user
            user.set_password(serializer.validated_data['new_password'])
            user.password_changed_at = timezone.now()
            user.save()
            return Response({"status": "Пароль успешно изменен"}, status=status.HTTP_200_OK)
        return Response({"errors": serializer.errors}, status=status.HTTP_400_BAD_REQUEST)

class ChangeUsernameView(views.APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = ChangeUsernameSerializer(data=request.data)
        if serializer.is_valid():
            user = request.user
            user.username = serializer.validated_data['new_username']
            user.save()
            return Response({
                "status": "Имя пользователя успешно изменено",
                "username": user.username
            }, status=status.HTTP_200_OK)
        return Response({"errors": serializer.errors}, status=status.HTTP_400_BAD_REQUEST)

class ChangeAvatarView(views.APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = ChangeAvatarSerializer(data=request.data)
        if serializer.is_valid():
            user = request.user
            avatar_file = serializer.validated_data['avatar']
            avatar_binary = avatar_file.read()
            user.avatar = avatar_binary
            user.save()
            return Response({
                "status": "Аватар успешно обновлен",
            }, status=status.HTTP_200_OK)
        return Response({"errors": serializer.errors}, status=status.HTTP_400_BAD_REQUEST)

class AdminMeView(generics.RetrieveAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = AdminSerializer

    def get_object(self):
        try:
            return Admins.objects.get(id_admin=self.request.user)
        except Admins.DoesNotExist:
            return None

    def get(self, request, *args, **kwargs):
        instance = self.get_object()
        if not instance:
            return Response(
                {"detail": "Вы не являетесь администратором"},
                status=status.HTTP_404_NOT_FOUND
            )
        serializer = self.get_serializer(instance)
        return Response(serializer.data)
    
class GetAvatarView(APIView):
    def get(self, request, user_id):
        try:
            user = Users.objects.get(id_user=user_id)
            if user.avatar:
                return HttpResponse(user.avatar, content_type="image/jpeg")
            return Response({"error": "Аватар не найден"}, status=status.HTTP_404_NOT_FOUND)
        except Users.DoesNotExist:
            return Response({"error": "Пользователь не найден"}, status=status.HTTP_404_NOT_FOUND)
        
class RequestVerificationView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = EmailVerificationRequestSerializer(data={}, context={'request': request})
        if serializer.is_valid():
            user = request.user
            # Check for recent tokens to prevent spamming
            recent_tokens = EmailVerificationToken.objects.filter(
                user=user,
                created_at__gte=timezone.now() - timedelta(minutes=1)
            )
            if recent_tokens.exists():
                return Response(
                    {"error": "Пожалуйста, подождите минуту перед повторной отправкой."},
                    status=status.HTTP_429_TOO_MANY_REQUESTS
                )

            token = str(uuid.uuid4())
            expires_at = timezone.now() + timedelta(hours=24)
            verification_token = EmailVerificationToken.objects.create(
                user=user,
                token=token,
                expires_at=expires_at
            )

            # Send email
            verification_url = f"{settings.FRONTEND_URL}/verify-email/{token}"
            subject = "Подтверждение электронной почты"
            message = (
                f"Здравствуйте, {user.username}!\n\n"
                f"Пожалуйста, подтвердите ваш адрес электронной почты, перейдя по следующей ссылке:\n"
                f"{verification_url}\n\n"
                f"Ссылка действительна до {expires_at.strftime('%Y-%m-%d %H:%M:%S')}.\n"
                f"Если вы не запрашивали это письмо, проигнорируйте его.\n\n"
                f"С уважением,\nВаша команда"
            )
            try:
                send_mail(
                    subject,
                    message,
                    settings.EMAIL_HOST_USER,
                    [user.email],
                    fail_silently=False,
                )
                logger.info(f"Verification email sent to {user.email}")
                return Response(
                    {"message": "Письмо с ссылкой для подтверждения отправлено на вашу почту."},
                    status=status.HTTP_200_OK
                )
            except Exception as e:
                logger.error(f"Failed to send email to {user.email}: {str(e)}")
                verification_token.delete()
                return Response(
                    {"error": "Не удалось отправить письмо. Пожалуйста, попробуйте позже."},
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR
                )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class VerifyEmailView(APIView):
    permission_classes = []

    def get(self, request, token):
        serializer = EmailVerificationSerializer(data={'token': token})
        if serializer.is_valid():
            try:
                verification_token = EmailVerificationToken.objects.get(token=token)
                user = verification_token.user
                user.is_email_verificated = True
                user.save()
                verification_token.delete()
                logger.info(f"Email verified for user {user.email}")
                return Response(
                    {"message": "Ваша почта успешно подтверждена!"},
                    status=status.HTTP_200_OK
                )
            except EmailVerificationToken.DoesNotExist:
                return Response(
                    {"error": "Недействительный токен."},
                    status=status.HTTP_400_BAD_REQUEST
                )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)