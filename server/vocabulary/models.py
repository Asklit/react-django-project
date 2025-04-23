from django.db import models
from core.models import Users

class Words(models.Model):
    id_word = models.AutoField(primary_key=True)
    word = models.CharField(max_length=30, unique=True)
    part_of_speech = models.CharField(max_length=50)
    translate_word = models.CharField(max_length=30)
    word_level = models.CharField(max_length=2)
    rating = models.IntegerField(default=1)

    class Meta:
        db_table = "Words"

    def __str__(self):
        return f"{self.word} ({self.word_level})"

class UserWordProgress(models.Model):
    STAGE_CHOICES = (
        ('introduction', 'Introduction'),
        ('active_recall', 'Active Recall'),
        ('consolidation', 'Consolidation'),
        ('spaced_repetition', 'Spaced Repetition'),
        ('active_usage', 'Active Usage'),
    )

    id_progress = models.AutoField(primary_key=True)
    word = models.ForeignKey(Words, on_delete=models.CASCADE)
    user = models.ForeignKey(Users, on_delete=models.CASCADE)
    stage = models.CharField(max_length=20, choices=STAGE_CHOICES, default='introduction')
    interaction_count = models.IntegerField(default=0)
    last_interaction = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "UserWordProgress"
        unique_together = ('word', 'user')

    def __str__(self):
        return f"{self.word.word} ({self.stage}) by User: {self.user.email}"