from django.db import models

class Users(models.Model):
    id_user = models.AutoField(primary_key=True)
    username = models.CharField(max_length=20, unique=True, error_messages={
        'max_length': 'Неверный формат имени пользователя.'})
    email = models.CharField(max_length=20, unique=True, error_messages={
        'max_length': 'Неверный формат электронной почты.'})
    password_hash = models.CharField()
    english_level = models.CharField(max_length=2, error_messages={
        'max_length': 'Убедитесь, что это поле не содержит более 2 символов.'})
    is_email_verificated = models.BooleanField(default=False)
    account_created_at = models.DateTimeField(auto_now_add=True)
    password_changed_at = models.DateTimeField(auto_now=True)
    last_day_online = models.DateTimeField(auto_now_add=True)
    days_in_berserk = models.IntegerField(default=0)

    class Meta:
        db_table = "Users"

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