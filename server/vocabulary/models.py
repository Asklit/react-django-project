from django.db import models
from core.models import Users

class Stage(models.Model):
    name = models.CharField(max_length=20, unique=True)
    next_stage = models.ForeignKey('self', null=True, blank=True, on_delete=models.SET_NULL)
    interactions_needed = models.IntegerField()

    class Meta:
        db_table = "Stages"

    def __str__(self):
        return self.name

class WordLevel(models.Model):
    level = models.CharField(max_length=2, unique=True)

    class Meta:
        db_table = "WordLevels"

    def __str__(self):
        return self.level

class PartOfSpeech(models.Model):
    name = models.CharField(max_length=50, unique=True)

    class Meta:
        db_table = "PartsOfSpeech"

    def __str__(self):
        return self.name

class Words(models.Model):
    id_word = models.AutoField(primary_key=True)
    word = models.CharField(max_length=30)
    part_of_speech = models.ForeignKey(PartOfSpeech, on_delete=models.CASCADE)
    translate_word = models.CharField(max_length=30)
    word_level = models.ForeignKey(WordLevel, on_delete=models.CASCADE)
    rating = models.IntegerField(default=1)

    class Meta:
        db_table = "Words"
        unique_together = ('word', 'translate_word')

    def __str__(self):
        return f"{self.word} ({self.word_level.level})"

class UserWordProgress(models.Model):
    id_progress = models.AutoField(primary_key=True)
    word = models.ForeignKey(Words, on_delete=models.CASCADE, related_name='user_progress')
    user = models.ForeignKey(Users, on_delete=models.CASCADE)
    stage = models.ForeignKey(Stage, on_delete=models.CASCADE, default=1)
    interaction_count = models.IntegerField(default=0)
    last_interaction = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "UserWordProgress"
        unique_together = ('word', 'user')

    def __str__(self):
        return f"{self.word.word} ({self.stage.name}) by User: {self.user.email}"