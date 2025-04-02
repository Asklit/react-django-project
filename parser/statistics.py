import pandas as pd


def analyze_words_file(file_path="expanded_words.xlsx"):
    try:
        df = pd.read_excel(file_path)
    except FileNotFoundError:
        print(f"Файл '{file_path}' не найден. Убедитесь, что он существует.")
        return
    except Exception as e:
        print(f"Ошибка при загрузке файла: {e}")
        return

    total_words = len(df)
    print(f"Общее количество слов: {total_words}")

    cefr_counts = df["CEFR Level"].value_counts(dropna=False)
    print("\nКоличество слов по уровням CEFR:")
    for level, count in cefr_counts.items():
        print(f"{level}: {count}")

    print("\nКоличество пропусков ('N/A') в каждом столбце:")
    for column in df.columns:
        na_count = df[column].isin(["N/A"]).sum()
        print(f"{column}: {na_count}")

    duplicates = df.duplicated(subset=["Word (English)"], keep=False)
    duplicate_count = duplicates.sum()
    unique_duplicates = df[df.duplicated(subset=["Word (English)"], keep='first')]["Word (English)"].nunique()
    print(f"\nКоличество слов, которые повторяются: {unique_duplicates}")
    print(f"Общее количество записей-дубликатов: {duplicate_count}")
    if unique_duplicates > 0:
        print("Примеры повторяющихся слов:")
        print(df[df.duplicated(subset=["Word (English)"], keep=False)][["Word (English)", "CEFR Level"]].head())

    no_cefr_count = df["CEFR Level"].isin(["N/A"]).sum()
    print(f"\nКоличество слов без уровня CEFR: {no_cefr_count}")

    part_of_speech_counts = df["Part of Speech"].value_counts(dropna=False)
    print("\nКоличество слов по частям речи:")
    for pos, count in part_of_speech_counts.items():
        print(f"{pos}: {count}")

    # Количество уникальных переводов
    unique_translations = df["Translation (Russian)"].nunique()
    print(f"\nКоличество уникальных переводов: {unique_translations}")

if __name__ == "__main__":
    analyze_words_file()