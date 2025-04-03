from django.db import models
from core.models import Users

class Words(models.Model):
    id_word = models.AutoField(primary_key=True)
    word = models.CharField(max_length=30, unique=True)
    translate_word = models.CharField(max_length=30)
    word_level = models.CharField(max_length=2)

    class Meta: 
        db_table = "Words"

class LearnedWords(models.Model):
    id_learned_word = models.AutoField(primary_key=True)
    word = models.ForeignKey(Words, on_delete=models.CASCADE)
    user = models.ForeignKey(Users, on_delete=models.CASCADE)

    class Meta:
        db_table = "LearnedWords"
        unique_together = ('word', 'user')

    def __str__(self):
        return f"LearnedWord: {self.word.word} by User: {self.user.email}"

class WordsInProgress(models.Model):
    id_word_in_progress = models.AutoField(primary_key=True)
    word = models.ForeignKey(Words, on_delete=models.CASCADE)
    user = models.ForeignKey(Users, on_delete=models.CASCADE)
    number_views = models.IntegerField(default=0)

    class Meta:
        db_table = "WordsInProgress"
        unique_together = ('word', 'user')

    def __str__(self):
        return f"WordInProgress: {self.word.word} by User: {self.user.email}"