from rest_framework import views, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken
from api.serializers import (
    UserRegisterSerializer, UserLoginSerializer, 
    ChangePasswordSerializer, ChangeUsernameSerializer, 
    ChangeAvatarSerializer, AdminSerializer
)
from core.models import Users, Admins
from rest_framework import generics
from django.http import HttpResponse

class RegisterView(views.APIView):
    def post(self, request):
        serializer = UserRegisterSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
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