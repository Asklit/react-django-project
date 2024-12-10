from django.db import connection
from rest_framework import generics
from rest_framework.response import Response
from rest_framework import status
from .models import Users
from .serializers import UserSerializer, UserDetailsSerializer
from django.contrib.auth.hashers import make_password

# Create your views here.

class UsersCreateView(generics.ListCreateAPIView):
    serializer_class = UserSerializer

    def create(self, request, *args, **kwargs):
        username = request.data.get('username')
        email = request.data.get('email')
        password_hash = make_password(request.data.get('password_hash'))
        english_level = request.data.get('english_level')

        try:
            with connection.cursor() as cursor:
                cursor.execute("""
                    INSERT INTO Users (username, email, password_hash, english_level, is_email_verificated, days_in_berserk)
                    VALUES (%s, %s, %s, %s, %s, %s)
                    RETURNING id_user;
                """, [username, email, password_hash, english_level, False, 0])
                user_id = cursor.fetchone()[0]

            return Response({"id_user": user_id, "username": username, "email": email}, status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

class UserDetailView(generics.RetrieveUpdateDestroyAPIView):
    def get_object(self):
        user_id = self.kwargs['pk']
        with connection.cursor() as cursor:
            cursor.execute("SELECT * FROM Users WHERE id_user = %s", [user_id])
            row = cursor.fetchone()
            if row:
                return {
                    "id_user": row[0],
                    "username": row[1],
                    "email": row[2],
                    "password_hash": row[3],
                    "english_level": row[4],
                    "is_email_verificated": row[5],
                    "days_in_berserk": row[6],
                }
            return None

    def retrieve(self, request, *args, **kwargs):
        user = self.get_object()
        if user is None:
            return Response({"error": "Пользователь не найден"}, status=status.HTTP_404_NOT_FOUND)
        return Response(user)

    def put(self, request, *args, **kwargs):
        user_id = self.kwargs['pk']
        user = self.get_object()
        if user is None:
            return Response({"error": "Пользователь не найден"}, status=status.HTTP_404_NOT_FOUND)

        username = request.data.get('username', user['username'])
        email = request.data.get('email', user['email'])
        password_hash = make_password(request.data.get('password_hash', user['password_hash']))
        english_level = request.data.get('english_level', user['english_level'])

        try:
            with connection.cursor() as cursor:
                cursor.execute("""
                    UPDATE Users
                    SET username = %s, email = %s, password_hash = %s, english_level = %s
                    WHERE id_user = %s;
                """, [username, email, password_hash, english_level, user_id])
            return Response({"message": "Пользователь успешно обновлён"}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, *args, **kwargs):
        user_id = self.kwargs['pk']
        try:
            with connection.cursor() as cursor:
                cursor.execute("DELETE FROM Users WHERE id_user = %s", [user_id])
            return Response(status=status.HTTP_204_NO_CONTENT)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class UsersListView(generics.ListCreateAPIView):
    serializer_class = UserDetailsSerializer

    def list(self, request, *args, **kwargs):
        try:
            with connection.cursor() as cursor:
                cursor.execute("SELECT * FROM Users;")
                rows = cursor.fetchall()
                
                columns = [col[0] for col in cursor.description]
                
                users = [
                    dict(zip(columns, row))
                    for row in rows
                ]
                
            return Response(users, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"error": "Ошибка при получении списка пользователей: " + str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
