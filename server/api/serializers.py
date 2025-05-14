from rest_framework import serializers
from core.models import Users, Admins
from vocabulary.models import Words, PartOfSpeech, WordLevel, Stage
from django.contrib.auth.hashers import check_password
import logging

logger = logging.getLogger(__name__)

class UserSerializer(serializers.ModelSerializer):
    avatar = serializers.SerializerMethodField()
    english_level = serializers.CharField()
    password = serializers.CharField(write_only=True, required=False)

    class Meta:
        model = Users
        fields = ['id_user', 'username', 'email', 'english_level', 'avatar', 'is_email_verificated', 'account_created_at', 'password']
        extra_kwargs = {
            'password': {'write_only': True}
        }

    def get_avatar(self, obj):
        if obj.avatar and hasattr(obj.avatar, 'url'):
            return self.context['request'].build_absolute_uri(obj.avatar.url)
        return None

    def validate_email(self, value):
        if not value:
            raise serializers.ValidationError("Электронная почта обязательна.")
        if len(value) > 20:
            raise serializers.ValidationError("Электронная почта не должна превышать 20 символов.")
        if not '@' in value or not '.' in value:
            raise serializers.ValidationError("Введите действительный адрес электронной почты.")
        if self.instance:
            if Users.objects.filter(email=value.lower()).exclude(id_user=self.instance.id_user).exists():
                raise serializers.ValidationError("Этот адрес электронной почты уже используется.")
        else:
            if Users.objects.filter(email=value.lower()).exists():
                raise serializers.ValidationError("Этот адрес электронной почты уже используется.")
        return value.lower()

    def validate_username(self, value):
        if not value:
            raise serializers.ValidationError("Имя пользователя обязательно.")
        if len(value) > 20:
            raise serializers.ValidationError("Имя пользователя не должно превышать 20 символов.")
        if len(value) < 3:
            raise serializers.ValidationError("Имя пользователя должно содержать не менее 3 символов.")
        if not value.isalnum():
            raise serializers.ValidationError("Имя пользователя должно содержать только буквы и цифры.")
        if self.instance:
            if Users.objects.filter(username=value).exclude(id_user=self.instance.id_user).exists():
                raise serializers.ValidationError("Это имя пользователя уже занято.")
        else:
            if Users.objects.filter(username=value).exists():
                raise serializers.ValidationError("Это имя пользователя уже занято.")
        return value

    def validate_password(self, value):
        if value: 
            if len(value) < 8:
                raise serializers.ValidationError("Пароль должен содержать не менее 8 символов.")
            if not any(char.isdigit() for char in value):
                raise serializers.ValidationError("Пароль должен содержать хотя бы одну цифру.")
            if not any(char.isupper() for char in value):
                raise serializers.ValidationError("Пароль должен содержать хотя бы одну заглавную букву.")
        return value

    def validate_english_level(self, value):
        valid_levels = WordLevel.objects.values_list('level', flat=True)
        if not value:
            raise serializers.ValidationError("Уровень английского обязателен.")
        if value.upper() not in valid_levels:
            raise serializers.ValidationError(
                f"Недопустимый уровень английского. Выберите: {', '.join(valid_levels)}."
            )
        return value.upper()

    def create(self, validated_data):
        logger.info(f"Creating user with data: {validated_data}")
        english_level_str = validated_data.pop('english_level')
        password = validated_data.pop('password', None)
        word_level, _ = WordLevel.objects.get_or_create(level=english_level_str)
        user = Users.objects.create_user(
            email=validated_data['email'],
            username=validated_data['username'],
            password=password,
            english_level=word_level,
            is_email_verificated=validated_data.get('is_email_verificated', False),
            avatar=validated_data.get('avatar', None)
        )
        logger.info(f"User created: {user.username}, ID: {user.id_user}")
        return user

class UserDetailsSerializer(serializers.ModelSerializer):
    english_level = serializers.CharField()

    class Meta:
        model = Users
        fields = [
            'id_user',
            'username',
            'email',
            'english_level',
            'avatar',
            'is_email_verificated',
            'account_created_at',
            'password_changed_at',
            'last_day_online'
        ]

    def validate_english_level(self, value):
        valid_levels = WordLevel.objects.values_list('level', flat=True)
        if not value:
            raise serializers.ValidationError("Уровень английского обязателен.")
        if value.upper() not in valid_levels:
            raise serializers.ValidationError(
                f"Недопустимый уровень английского. Выберите: {', '.join(valid_levels)}."
            )
        return value.upper()

    def validate_email(self, value):
        if not value:
            raise serializers.ValidationError("Электронная почта обязательна.")
        if len(value) > 20:
            raise serializers.ValidationError("Электронная почта не должна превышать 20 символов.")
        if not '@' in value or not '.' in value:
            raise serializers.ValidationError("Введите действительный адрес электронной почты.")
        if Users.objects.filter(email=value.lower()).exclude(id_user=self.instance.id_user).exists():
            raise serializers.ValidationError("Этот адрес электронной почты уже используется.")
        return value.lower()

    def validate_username(self, value):
        if not value:
            raise serializers.ValidationError("Имя пользователя обязательно.")
        if len(value) > 20:
            raise serializers.ValidationError("Имя пользователя не должно превышать 20 символов.")
        if len(value) < 3:
            raise serializers.ValidationError("Имя пользователя должно содержать не менее 3 символов.")
        if not value.isalnum():
            raise serializers.ValidationError("Имя пользователя должно содержать только буквы и цифры.")
        if Users.objects.filter(username=value).exclude(id_user=self.instance.id_user).exists():
            raise serializers.ValidationError("Это имя пользователя уже занято.")
        return value

    def update(self, instance, validated_data):
        logger.info(f"Updating user {instance.id_user} with data: {validated_data}")
        english_level_str = validated_data.pop('english_level', None)
        if english_level_str:
            word_level, _ = WordLevel.objects.get_or_create(level=english_level_str.upper())
            instance.english_level = word_level
        for field, value in validated_data.items():
            setattr(instance, field, value)
        instance.save()
        logger.info(f"User {instance.id_user} updated successfully")
        return instance

class UserRegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    english_level = serializers.CharField()

    class Meta:
        model = Users
        fields = ['username', 'email', 'password', 'english_level']

    def validate_email(self, value):
        if not value:
            raise serializers.ValidationError("Электронная почта обязательна.")
        if len(value) > 20:
            raise serializers.ValidationError("Электронная почта не должна превышать 20 символов.")
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
        valid_levels = WordLevel.objects.values_list('level', flat=True)
        if not value:
            raise serializers.ValidationError("Уровень английского обязателен.")
        if value.upper() not in valid_levels:
            raise serializers.ValidationError(
                f"Недопустимый уровень английского. Выберите: {', '.join(valid_levels)}."
            )
        return value.upper()

    def create(self, validated_data):
        logger.info(f"Creating user with data: {validated_data}")
        english_level_str = validated_data.pop('english_level')
        word_level, _ = WordLevel.objects.get_or_create(level=english_level_str)
        user = Users.objects.create_user(
            email=validated_data['email'],
            username=validated_data['username'],
            password=validated_data['password'],
            english_level=word_level
        )
        logger.info(f"User created: {user.username}, ID: {user.id_user}")
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
    new_username = serializers.CharField(max_length=20)

    def validate_new_username(self, value):
        if not value:
            raise serializers.ValidationError("Имя пользователя обязательно.")
        if len(value) > 20:
            raise serializers.ValidationError("Имя пользователя не должно превышать 20 символов.")
        if len(value) < 3:
            raise serializers.ValidationError("Имя пользователя должно содержать не менее 3 символов.")
        if not value.isalnum():
            raise serializers.ValidationError("Имя пользователя должно содержать только буквы и цифры.")
        if Users.objects.filter(username=value).exists():
            raise serializers.ValidationError("Это имя пользователя уже занято.")
        return value


class ChangeAvatarSerializer(serializers.ModelSerializer):
    avatar = serializers.ImageField()

    class Meta:
        model = Users
        fields = ['avatar']

    def validate_avatar(self, value):
        if value.size > 5 * 1024 * 1024: 
            raise serializers.ValidationError("Файл слишком большой. Максимальный размер: 5 МБ.")
        if not value.content_type.startswith('image/'):
            raise serializers.ValidationError("Файл должен быть изображением (JPEG, PNG и т.д.).")
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

class AdminUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Admins
        fields = ['first_name', 'surname', 'established_post']

class PartOfSpeechSerializer(serializers.ModelSerializer):
    class Meta:
        model = PartOfSpeech
        fields = ['id', 'name']

class WordSerializer(serializers.ModelSerializer):
    part_of_speech = serializers.SlugRelatedField(slug_field='name', queryset=PartOfSpeech.objects.all())
    word_level = serializers.SlugRelatedField(slug_field='level', queryset=WordLevel.objects.all())

    class Meta:
        model = Words
        fields = ['id_word', 'word', 'part_of_speech', 'translate_word', 'word_level', 'rating']

    def validate_word(self, value):
        if not value:
            raise serializers.ValidationError("Слово не может быть пустым")
        return value

    def validate_translate_word(self, value):
        if not value:
            raise serializers.ValidationError("Перевод не может быть пустым")
        return value

    def validate_word_level(self, value):
        valid_levels = WordLevel.objects.values_list('level', flat=True)
        if not value:
            raise serializers.ValidationError("Уровень слова обязателен.")
        if value not in valid_levels:
            raise serializers.ValidationError(
                f"Неверный уровень слова. Должен быть: {', '.join(valid_levels)}"
            )
        return value

    def validate_part_of_speech(self, value):
        if not value:
            raise serializers.ValidationError("Часть речи не может быть пустой")
        return value

    def validate(self, data):
        word = data.get('word')
        word_level = data.get('word_level')
        if word and word_level:
            if Words.objects.filter(word=word, word_level__level=word_level).exists():
                raise serializers.ValidationError({"word": f"Слово '{word}' уже существует для уровня {word_level}"})
        return data

    def create(self, validated_data):
        word = Words.objects.create(**validated_data)
        return word

class BulkWordUploadSerializer(serializers.Serializer):
    words = WordSerializer(many=True)

    def create(self, validated_data):
        created_words = []
        for word_data in validated_data['words']:
            part_of_speech = PartOfSpeech.objects.get(name=word_data['part_of_speech'])
            word_level = WordLevel.objects.get(level=word_data['word_level'])
            word, created = Words.objects.get_or_create(
                word=word_data['word'],
                word_level=word_level,
                defaults={
                    'part_of_speech': part_of_speech,
                    'translate_word': word_data['translate_word'],
                    'rating': word_data['rating']
                }
            )
            if created:
                created_words.append(word)
        return created_words
    
class StageSerializer(serializers.ModelSerializer):
    next_stage = serializers.PrimaryKeyRelatedField(queryset=Stage.objects.all(), allow_null=True)

    class Meta:
        model = Stage
        fields = ['id', 'name', 'next_stage', 'interactions_needed']

    def validate_name(self, value):
        if not value:
            raise serializers.ValidationError("Название этапа обязательно.")
        if len(value) > 20:
            raise serializers.ValidationError("Название этапа не должно превышать 20 символов.")
        if self.instance is None and Stage.objects.filter(name=value).exists():
            raise serializers.ValidationError("Этап с таким названием уже существует.")
        return value

    def validate_interactions_needed(self, value):
        if value < 0:
            raise serializers.ValidationError("Количество взаимодействий не может быть отрицательным.")
        return value
    
class WordLevelSerializer(serializers.ModelSerializer):
    class Meta:
        model = WordLevel
        fields = ['id', 'level']

    def validate_level(self, value):
        if not value:
            raise serializers.ValidationError("Уровень обязателен.")
        if len(value) > 2:
            raise serializers.ValidationError("Уровень не должен превышать 2 символа.")
        if self.instance is None and WordLevel.objects.filter(level=value).exists():
            raise serializers.ValidationError("Уровень с таким значением уже существует.")
        return value
    
class PartOfSpeechSerializer(serializers.ModelSerializer):
    class Meta:
        model = PartOfSpeech
        fields = ['id', 'name']

    def validate_name(self, value):
        if not value:
            raise serializers.ValidationError("Название части речи обязательно.")
        if len(value) > 50:
            raise serializers.ValidationError("Название не должно превышать 50 символов.")
        if self.instance is None and PartOfSpeech.objects.filter(name=value).exists():
            raise serializers.ValidationError("Часть речи с таким названием уже существует.")
        return value