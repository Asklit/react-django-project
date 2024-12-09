from django.shortcuts import render
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import generics
from rest_framework import status
from .models import Users
from .serializers import UserSerializer, UserDetailsSerializer
from django.contrib.auth.hashers import make_password

# Create your views here.

class UsersCreateView(generics.ListCreateAPIView):
    serializer_class = UserSerializer
    queryset = Users.objects.all()

    def create(self, request, *args, **kwargs):
        # Создание нового пользователя
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save(
                password_hash=make_password(request.data['password_hash']),
                is_email_verificated=False,
                days_in_berserk=0,
            )
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class UserDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Users.objects.all()
    serializer_class = UserDetailsSerializer

    def put(self, request, *args, **kwargs):
        user = self.get_object()
        serializer = self.get_serializer(user, data=request.data, partial=True)
        if serializer.is_valid():
            if 'password_hash' in request.data:
                user.password_hash = make_password(request.data['password_hash'])
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, *args, **kwargs):
        try:
            user = self.get_object()
            user.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class UsersListView(generics.ListCreateAPIView):
    serializer_class = UserDetailsSerializer
    queryset = Users.objects.all()