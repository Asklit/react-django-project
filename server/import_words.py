import os
import django
from django.conf import settings

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'server.settings') 
django.setup()

from vocabulary.models import Words

import pandas as pd
df = pd.read_excel('expanded_words.xlsx')
excel_data = [tuple(row) for row in df.values[1:]] 

def import_words():
    Words.objects.all().delete()

    for word, part_of_speech, translate_word, word_level, rating in excel_data:
        try:
            Words.objects.create(
                word=word,
                part_of_speech=part_of_speech,
                translate_word=translate_word,
                word_level=word_level,
                rating=rating
            )
            print(f"Добавлено: {word}")
        except Exception as e:
            print(f"Error {word}: {e}")

if __name__ == "__main__":
    import_words()