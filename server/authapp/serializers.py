from rest_framework import serializers
from core.models import EmailVerificationToken
from django.utils import timezone
from datetime import timedelta
import uuid

class EmailVerificationRequestSerializer(serializers.Serializer):
    def validate(self, data):
        user = self.context['request'].user
        if user.is_email_verificated:
            raise serializers.ValidationError("Ваша почта уже подтверждена.")
        return data

class EmailVerificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = EmailVerificationToken
        fields = ['token']

    def validate_token(self, value):
        try:
            token = EmailVerificationToken.objects.get(token=value)
            if token.is_expired():
                raise serializers.ValidationError("Токен истек. Пожалуйста, запросите новое письмо.")
            if token.user.is_email_verificated:
                raise serializers.ValidationError("Почта этого пользователя уже подтверждена.")
        except EmailVerificationToken.DoesNotExist:
            raise serializers.ValidationError("Недействительный токен.")
        return value