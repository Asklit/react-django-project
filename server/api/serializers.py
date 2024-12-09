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
        if Users.objects.filter(email=value).exists():
            raise serializers.ValidationError("This email is already registered.")
        return value

    def validate_username(self, value):
        if Users.objects.filter(username=value).exists():
            raise serializers.ValidationError("This username is already taken.")
        return value
    
class UserDetailsSerializer(serializers.ModelSerializer):
    class Meta:
        model = Users
        fields = '__all__'