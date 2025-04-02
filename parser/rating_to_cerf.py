import pandas as pd
import random

try:
    data = pd.read_excel("top_10000_words.xlsx")  # Используем read_excel для .xlsx
except FileNotFoundError:
    print("Ошибка: Файл 'top_10000_words.xlsx' не найден. Убедитесь, что он находится в текущей директории.")
    exit()
except Exception as e:
    print(f"Ошибка при загрузке файла: {e}")
    exit()

required_columns = ["Word (English)", "CEFR Level", "Rating"]
missing_columns = [col for col in required_columns if col not in data.columns]
if missing_columns:
    print(f"Ошибка: В файле отсутствуют столбцы: {missing_columns}")
    exit()

def assign_cefr_level(row):
    if pd.isna(row["CEFR Level"]) or row["CEFR Level"] == "":
        word = row["Word (English)"]
        rating = row["Rating"]
        if pd.isna(rating):  # Если рейтинг отсутствует, присваиваем A1 по умолчанию
            return "A1"
        if len(word) <= 4 and rating <= 3:  # Короткие и частые слова
            return "A1"
        elif len(word) <= 6 and rating <= 5:  # Средней сложности
            return "A2"
        elif rating <= 7:  # Более сложные
            return "B1"
        elif rating <= 9:  # Редкие слова
            return "B2"
        else:
            return "C1"
    return row["CEFR Level"]

data["CEFR Level"] = data.apply(assign_cefr_level, axis=1)

output_file = "expanded_words.xlsx"
try:
    data.to_excel(output_file, index=False)
    print(f"Сохранено {len(data)} слов в файл '{output_file}'")
except Exception as e:
    print(f"Ошибка при сохранении файла: {e}")
    exit()