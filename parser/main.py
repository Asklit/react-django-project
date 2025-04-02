from bs4 import BeautifulSoup
import requests
import string
import time


def by_word():
    url = 'https://dictionary.cambridge.org/dictionary/english/bear'
    user_agent = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/102.0.5005.63 Safari/537.36"
    headers = {'User-Agent': user_agent}
    web_request = requests.get(url, headers=headers)
    soup = BeautifulSoup(web_request.text, "html.parser")
    print(soup.find(attrs={"class": "di-title"}).text)
    print(soup.find(attrs={"class": "ddef_h"}).span.span.text)


def by_letter():
    alphabet = string.ascii_lowercase
    words = []
    for letter in alphabet:
        lst = []
        url = f'https://dictionary.cambridge.org/browse/english-russian/{letter}/'
        user_agent = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/102.0.5005.63 Safari/537.36"
        headers = {'User-Agent': user_agent}
        web_request = requests.get(url, headers=headers)
        soup = BeautifulSoup(web_request.text, "html.parser")
        for item in soup.find(attrs={"class": "lc lpr-2"}):
            item = item.text.strip()
            if item:
                text = (item.split("...")[0].strip().replace(" ", "-")
                        .replace("/", "-")
                        .replace(".", "")
                        .replace(",", "")
                        .replace("-idiom", "")
                        .replace("'", "-").lower())
                if text[-1] == "-":
                    text = text[:-1]
                if text == "p&p":
                    text = "p-p_2"
                lst.append(text)
        for item in soup.find(attrs={"class": "lpl-2"}):
            item = item.text.strip()
            if item:
                text = item.split("...")[0].strip().replace(" ", "-").replace("/", "-").replace(".", "").replace(",", "").replace("-idiom", "").replace("'", "-").lower()
                if text[-1] == "-":
                    text = text[:-1]
                if text == "p&p":
                    text = "p-p_2"
                lst.append(text)
        print(lst)
        for word in lst:
            url = f'https://dictionary.cambridge.org/browse/english-russian/{letter.lower()}/{word}/'
            user_agent = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/102.0.5005.63 Safari/537.36"
            headers = {'User-Agent': user_agent}
            web_request = requests.get(url, headers=headers)
            soup = BeautifulSoup(web_request.text, "html.parser")
            print(f"logs: {url}")
            for item in soup.find(attrs={"class": "lc lc6-12 lpr-2"}):
                item = item.text.strip()
                if item:
                    words.append(item)
            for item in soup.find(attrs={"class": "lpl-2"}):
                item = item.text.strip()
                if item:
                    words.append(item)
        print(f"words: {words}")
        print(f"total count: {len(words)}")


if __name__ == '__main__':
    start_time = time.time()
    by_letter()
    print(f"Request time: {time.time()-start_time} seconds")