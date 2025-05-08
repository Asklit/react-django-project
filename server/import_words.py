import pandas as pd

def get_parts_of_speech_from_excel(file_path):
    # Читаем Excel-файл
    df = pd.read_excel(file_path)
    
    # Извлекаем уникальные части речи
    parts_of_speech = df['Part of Speech'].unique()
    
    # Очищаем данные (удаляем лишние пробелы и приводим к нижнему регистру)
    cleaned_parts = set()
    for pos in parts_of_speech:
        if pd.notna(pos):  # Проверяем, что значение не NaN
            # Удаляем лишние пробелы и скобки с содержимым
            cleaned_pos = pos.split('(')[0].strip().lower()
            cleaned_parts.add(cleaned_pos)
    
    return sorted(cleaned_parts)

# Пример использования
file_path = 'expanded_words.xlsx'  # Укажите путь к вашему файлу
parts_of_speech = get_parts_of_speech_from_excel(file_path)

print("Уникальные части речи в таблице:")
for i, pos in enumerate(parts_of_speech, 1):
    print(f"{i}. {pos}")