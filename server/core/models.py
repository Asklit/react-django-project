from django.db import models
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.utils.translation import gettext_lazy as _
from django.utils import timezone
import uuid


class UserManager(BaseUserManager):
    def create_user(self, email, username, password=None, **extra_fields):
        if not email:
            raise ValueError(_('The Email field must be set'))
        if not username:
            raise ValueError(_('The Username field must be set'))
        email = self.normalize_email(email)
        user = self.model(email=email, username=username, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, username, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('is_email_verificated', True)

        if extra_fields.get('is_staff') is not True:
            raise ValueError(_('Superuser must have is_staff=True.'))
        if extra_fields.get('is_superuser') is not True:
            raise ValueError(_('Superuser must have is_superuser=True.'))

        return self.create_user(email, username, password, **extra_fields)

class Users(AbstractBaseUser, PermissionsMixin):
    id_user = models.AutoField(primary_key=True)
    username = models.CharField(
        max_length=20,
        unique=True,
        error_messages={'max_length': 'Неверный формат имени пользователя.'}
    )
    email = models.CharField(
        max_length=20,
        unique=True,
        error_messages={'max_length': 'Неверный формат электронной почты.'}
    )
    english_level = models.ForeignKey(
        'vocabulary.WordLevel',
        on_delete=models.CASCADE,
        error_messages={'null': 'Уровень английского обязателен.'}
    )
    avatar = models.BinaryField(null=True, blank=True)
    is_email_verificated = models.BooleanField(default=False)
    account_created_at = models.DateTimeField(auto_now_add=True)
    password_changed_at = models.DateTimeField(null=True, blank=True)
    last_day_online = models.DateTimeField(auto_now_add=True)
    
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)

    objects = UserManager()

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username', 'english_level']

    class Meta:
        db_table = "Users"
        indexes = [
            models.Index(fields=['last_day_online']),
        ]

    def __str__(self):
        return f"{self.email} {self.username}"

class Admins(models.Model):
    id_admin = models.OneToOneField(Users, on_delete=models.CASCADE, primary_key=True)
    first_name = models.CharField(max_length=20)
    surname = models.CharField(max_length=20)
    established_post = models.CharField(max_length=20)

    class Meta: 
        db_table = "Admins"

    def __str__(self):
        return f"{self.id_admin.username} {self.first_name} {self.surname}"

class UserActivity(models.Model):
    user = models.ForeignKey(Users, on_delete=models.CASCADE, related_name='activities')
    date = models.DateField()
    word_count = models.PositiveIntegerField(default=0)

    class Meta:
        db_table = "UserActivity"
        unique_together = ('user', 'date')

    def __str__(self):
        return f"{self.user.username} - {self.date}: {self.word_count} words"

class EmailVerificationToken(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(Users, on_delete=models.CASCADE, related_name="verification_tokens")
    token = models.CharField(max_length=100, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField()

    class Meta:
        db_table = "EmailVerificationTokens"

    def is_expired(self):
        return timezone.now() > self.expires_at

    def __str__(self):
        return f"Token for {self.user.email}"