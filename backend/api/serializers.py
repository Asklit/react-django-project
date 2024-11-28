# from django.contrib.auth.models import User
from rest_framework import serializers
from .models import Users
from django.contrib.auth.hashers import make_password

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
            'password_hash': {'write_only': True},  # Ensure password_hash is write-only
            'email': {'validators': []},  # Remove default validators if needed
            'username': {'validators': []}  # Remove default validators if needed
        }

    def validate_email(self, value):
        if Users.objects.filter(email=value).exists():
            raise serializers.ValidationError("This email is already registered.")
        return value

    def validate_username(self, value):
        if Users.objects.filter(username=value).exists():
            raise serializers.ValidationError("This username is already taken.")
        return value

    def create(self, validated_data):
        user = Users.objects.create(
            username=validated_data['username'],
            email=validated_data['email'],
            english_level=validated_data['english_level'],
            is_email_verificated=False,
            days_in_berserk=0
        )
        user.password_hash = make_password(validated_data['password_hash'])
        user.save()
        return user