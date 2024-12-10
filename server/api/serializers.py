from rest_framework import serializers
from .models import LearnedWords, Users, Words, WordsInProgress, Admins
from django.contrib.auth.hashers import make_password
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status

# api/serializers.py

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = Users
        fields = [
            'username', 
            'email', 
            'password_hash', 
            'english_level'
        ]
        extra_kwargs = {
            'password_hash': {'write_only': True},
            'email': {'validators': []}, 
            'username': {'validators': []}
        }

    def validate_email(self, value):
        if not value:
            raise serializers.ValidationError("Это поле не может быть пустым")
        if Users.objects.filter(email=value).exists():
            raise serializers.ValidationError("Этот email уже используется.")
        return value

    def validate_username(self, value):
        if not value:
            raise serializers.ValidationError("Это поле не может быть пустым")
        if Users.objects.filter(username=value).exists():
            raise serializers.ValidationError("Этот username уже существует.")
        return value
    
    def validate_password(self, value):
        if not value:
            raise serializers.ValidationError("Это поле не может быть пустым")
        return value
    
    def validate_english_level(self, value):
        if not value:
            raise serializers.ValidationError("Это поле не может быть пустым")
        if len(value) != 2:
            raise serializers.ValidationError("Формат уровня должен быть XX.")

        if value not in ['A1', 'A2', 'B1', 'B2', 'C1', 'C2', 'a1', 'a2', 'b1', 'b2', 'c1', 'c2']:
            raise serializers.ValidationError("Неправильный уровень анйглийского.")
        return value
    
class UserDetailsSerializer(serializers.ModelSerializer):
    class Meta:
        model = Users
        fields = '__all__'