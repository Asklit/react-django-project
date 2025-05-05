from rest_framework import serializers
from core.models import Users
from django.contrib.auth.hashers import make_password, check_password

class UserRegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = Users
        fields = ['username', 'email', 'password', 'english_level']

    def validate_email(self, value):
        if not value:
            raise serializers.ValidationError("Электронная почта обязательна.")
        if not '@' in value or not '.' in value:
            raise serializers.ValidationError("Введите действительный адрес электронной почты.")
        if Users.objects.filter(email=value.lower()).exists():
            raise serializers.ValidationError("Этот адрес электронной почты уже используется.")
        return value.lower()

    def validate_username(self, value):
        if not value:
            raise serializers.ValidationError("Имя пользователя обязательно.")
        if len(value) < 3:
            raise serializers.ValidationError("Имя пользователя должно содержать не менее 3 символов.")
        if not value.isalnum():
            raise serializers.ValidationError("Имя пользователя должно содержать только буквы и цифры.")
        if Users.objects.filter(username=value).exists():
            raise serializers.ValidationError("Это имя пользователя уже занято.")
        return value

    def validate_password(self, value):
        if not value:
            raise serializers.ValidationError("Пароль обязателен.")
        if len(value) < 8:
            raise serializers.ValidationError("Пароль должен содержать не менее 8 символов.")
        if not any(char.isdigit() for char in value):
            raise serializers.ValidationError("Пароль должен содержать хотя бы одну цифру.")
        if not any(char.isupper() for char in value):
            raise serializers.ValidationError("Пароль должен содержать хотя бы одну заглавную букву.")
        return value

    def validate_english_level(self, value):
        valid_levels = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2']
        if not value:
            raise serializers.ValidationError("Уровень английского обязателен.")
        if value.upper() not in valid_levels:
            raise serializers.ValidationError("Недопустимый уровень английского. Выберите: A1, A2, B1, B2, C1, C2.")
        return value.upper()

    def create(self, validated_data):
        user = Users.objects.create_user(
            email=validated_data['email'],
            username=validated_data['username'],
            password=validated_data['password'],
            english_level=validated_data['english_level']
        )
        return user

class UserLoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)

    def validate(self, data):
        email = data.get('email', '').lower()
        password = data.get('password', '')

        if not email:
            raise serializers.ValidationError({"email": "Электронная почта обязательна."})
        if not password:
            raise serializers.ValidationError({"password": "Пароль обязателен."})

        try:
            user = Users.objects.get(email=email)
        except Users.DoesNotExist:
            raise serializers.ValidationError({"email": "Пользователь с этим адресом электронной почты не найден."})

        if not check_password(password, user.password):
            raise serializers.ValidationError({"password": "Неверный пароль."})

        data['user'] = user
        return data
    

class ChangePasswordSerializer(serializers.Serializer):
    old_password = serializers.CharField(write_only=True)
    new_password = serializers.CharField(write_only=True, min_length=8)
    confirm_password = serializers.CharField(write_only=True)

    def validate(self, data):
        if data['new_password'] != data['confirm_password']:
            raise serializers.ValidationError({"confirm_password": "Пароли не совпадают"})
        user = self.context['request'].user
        if not user.check_password(data['old_password']):
            raise serializers.ValidationError({"old_password": "Неверный текущий пароль"})
        return data
    
class ChangeUsernameSerializer(serializers.Serializer):
    new_username = serializers.CharField(max_length=150)

    def validate_new_username(self, value):
        if not value:
            raise serializers.ValidationError("Имя пользователя обязательно.")
        if len(value) < 3:
            raise serializers.ValidationError("Имя пользователя должно содержать не менее 3 символов.")
        if not value.isalnum():
            raise serializers.ValidationError("Имя пользователя должно содержать только буквы и цифры.")
        if Users.objects.filter(username=value).exists():
            raise serializers.ValidationError("Это имя пользователя уже занято.")
        return value