# This is an auto-generated Django model module.
# You'll have to do the following manually to clean this up:
#   * Rearrange models' order
#   * Make sure each model has one field with primary_key=True
#   * Make sure each ForeignKey and OneToOneField has `on_delete` set to the desired behavior
#   * Remove `managed = False` lines if you wish to allow Django to create, modify, and delete the table
# Feel free to rename the models, but don't rename db_table values or field names.
from django.db import models
# api/models.py

class Users(models.Model):
    id_user = models.AutoField(primary_key=True)
    username = models.CharField(max_length=20, unique=True)
    email = models.CharField(max_length=20, unique=True)
    password_hash = models.CharField(max_length=50)
    english_level = models.CharField(max_length=2)
    is_email_verificated = models.BooleanField(default=False)
    account_created_at = models.DateTimeField(auto_now_add=True)
    password_changed_at = models.DateTimeField(auto_now=True)
    last_day_online = models.DateTimeField(auto_now_add=True)
    days_in_berserk = models.IntegerField(default=0)

    def __str__(self):
        return self.email

class Admins(models.Model):
    id_admin = models.OneToOneField(Users, on_delete=models.CASCADE, primary_key=True)
    first_name = models.CharField(max_length=20)
    surname = models.CharField(max_length=20)
    established_post = models.CharField(max_length=20)

    def __str__(self):
        return f"{self.first_name} {self.surname}"

class Words(models.Model):
    id_word = models.AutoField(primary_key=True)
    word = models.CharField(max_length=30, unique=True)
    translate_word = models.CharField(max_length=30)
    word_level = models.CharField(max_length=2)


class LearnedWords(models.Model):
    id_learned_word = models.AutoField(primary_key=True)
    word = models.ForeignKey(Words, on_delete=models.CASCADE)
    user = models.ForeignKey(Users, on_delete=models.CASCADE)

    class Meta:
        unique_together = ('word', 'user')

    def __str__(self):
        return f"LearnedWord: {self.word.word} by User: {self.user.email}"

class WordsInProgress(models.Model):
    id_word_in_progress = models.AutoField(primary_key=True)
    word = models.ForeignKey(Words, on_delete=models.CASCADE)
    user = models.ForeignKey(Users, on_delete=models.CASCADE)
    number_views = models.IntegerField(default=0)

    class Meta:
        unique_together = ('word', 'user')

    def __str__(self):
        return f"WordInProgress: {self.word.word} by User: {self.user.email}"

