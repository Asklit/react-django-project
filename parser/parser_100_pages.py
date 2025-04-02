import time
import random
from bs4 import BeautifulSoup
import requests
import pandas as pd
from tqdm import tqdm

def get_words_from_page(page_num, headers):
    url = f'https://word-by-word.ru/ratings/top-10000-words?page={page_num}'
    try:
        web_request = requests.get(url, headers=headers, timeout=10)
        web_request.raise_for_status()
    except requests.RequestException as e:
        print(f"Ошибка при запросе страницы {page_num}: {e}")
        return None

    soup = BeautifulSoup(web_request.text, "html.parser")
    word_cards = soup.find_all(attrs={"class": "word-card"})

    if not word_cards:
        print(f"На странице {page_num} не найдено карточек слов")
        return []

    words_data = []
    for card in word_cards:
        try:
            spelling_elem = card.find(attrs={"class": "spelling"})
            spelling = spelling_elem.text if spelling_elem else "N/A"

            part_of_speech_elem = card.find(attrs={"class": "part-of-speech"})
            part_of_speech = part_of_speech_elem.text if part_of_speech_elem else "N/A"

            translations_elem = card.find(attrs={"class": "trs"})
            translation = translations_elem.find("span").text if translations_elem and translations_elem.find("span") else "N/A"

            marks = card.find_all(attrs={"class": "mark"})
            cefr_level = next((mark["data-cefr"] for mark in marks if "data-cefr" in mark.attrs), "N/A")
            rating = next((mark["data-rating"] for mark in marks if "data-rating" in mark.attrs), "N/A")

            words_data.append({
                "Word (English)": spelling,
                "Part of Speech": part_of_speech,
                "Translation (Russian)": translation,
                "CEFR Level": cefr_level,
                "Rating": rating
            })
        except AttributeError as e:
            print(f"Ошибка при обработке карточки на странице {page_num}: {e}")
            continue

    return words_data

def save_last_page(page_num):
    with open("last_page.txt", "w") as f:
        f.write(str(page_num))

def load_last_page():
    try:
        with open("last_page.txt", "r") as f:
            return int(f.read().strip())
    except (FileNotFoundError, ValueError):
        return 0

def scrape_all_words():
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
    }

    output_file = "top_10000_words.xlsx"
    total_pages = 100

    all_words = []
    try:
        existing_df = pd.read_excel(output_file)
        all_words = existing_df.to_dict('records')
        print(f"Загружено {len(all_words)} слов из существующего файла")
    except FileNotFoundError:
        pass

    last_processed_page = load_last_page()
    start_page = last_processed_page + 1
    print(f"Начинаем с страницы {start_page}")

    for page in tqdm(range(start_page, total_pages + 1), desc="Scraping pages"):
        page_words = get_words_from_page(page, headers)

        if page_words is None:
            if all_words:
                df = pd.DataFrame(all_words)
                df.to_excel(output_file, index=False)
                print(f"Сохранено {len(all_words)} слов в файл '{output_file}' до страницы {page - 1}")
                save_last_page(page - 1)
            print("Программа остановлена из-за ошибки. Смените IP и перезапустите.")
            return

        all_words.extend(page_words)
        print(f"Обработана страница {page}, получено слов: {len(page_words)}")

        if page_words:
            df = pd.DataFrame(all_words)
            df.to_excel(output_file, index=False)
            save_last_page(page)

        time.sleep(random.uniform(5, 10))

    if all_words:
        df = pd.DataFrame(all_words)
        df.to_excel(output_file, index=False)
        print(f"Сохранено {len(all_words)} слов в файл '{output_file}'")
        save_last_page(total_pages)
    else:
        print("Не удалось собрать данные для сохранения")

if __name__ == '__main__':
    start_time = time.time()
    try:
        scrape_all_words()
    except Exception as e:
        print(f"Произошла ошибка: {e}")
    print(f"Время выполнения: {time.time() - start_time:.2f} секунд")