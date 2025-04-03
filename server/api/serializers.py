from rest_framework import serializers
from core.models import Users, Admins
from vocabulary.models import Words
from django.contrib.auth.hashers import make_password

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = Users
        fields = ['username', 'email', 'password_hash', 'english_level']
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

class WordSerializer(serializers.ModelSerializer):
    class Meta:
        model = Words
        fields = ['id_word', 'word', 'translate_word', 'word_level']

    def validate_word(self, value):
        if not value:
            raise serializers.ValidationError("Слово не может быть пустым")
        if Words.objects.filter(word=value).exists():
            raise serializers.ValidationError("Это слово уже существует")
        return value

    def validate_translate_word(self, value):
        if not value:
            raise serializers.ValidationError("Перевод не может быть пустым")
        return value

    def validate_word_level(self, value):
        valid_levels = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2']
        if value not in valid_levels:
            raise serializers.ValidationError("Неверный уровень слова. Должен быть A1, A2, B1, B2, C1 или C2")
        return value

class AdminSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='id_admin.username', read_only=True)
    email = serializers.CharField(source='id_admin.email', read_only=True)

    class Meta:
        model = Admins
        fields = ['id_admin', 'username', 'email', 'first_name', 'surname', 'established_post']

class AdminCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Admins
        fields = ['id_admin', 'first_name', 'surname', 'established_post']