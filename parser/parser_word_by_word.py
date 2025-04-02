import time

from bs4 import BeautifulSoup
import requests


def word_by_word():
    levels = ["a1", "a2", "b1", "b2", "c1", "c2"]
    response = {}
    ans = []
    count = 0
    for level in levels:
        url = f'https://word-by-word.ru/ratings/cefr-{level}'
        headers = requests.utils.default_headers()
        headers.update({
            'User-Agent': 'Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:52.0) Gecko/20100101 Firefox/52.0',
        })
        web_request = requests.get(url, headers=headers)
        soup = BeautifulSoup(web_request.text, "html.parser")
        print(soup.find(attrs={"class": "article-rating-header"}))
        print(soup.find(attrs={"class": "word-list"}))
        time.sleep(1)
        words = []
        for item in soup.find(attrs={"class": "word-list"}):
            time.sleep(1)
            print(item)
            # word = item.find(attrs={"class": "spelling"})
            # print(word)
        response[level] = words
        count += len(words)
    ans = None
    print("total count:", count)
    print(response)


def words():
    levels = ["a1", "a2", "b1", "b2", "c1", "c2"]
    response = []
    count = 0

    headers = requests.utils.default_headers()
    headers.update({
        'User-Agent': 'Mozilla/5.0 (Linux; Android 10; ONEPLUS A6010) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/89.0.4389.105 Mobile Safari/537.36',
    })

    proxies = {
        'http': 'socks5h://127.0.0.1:9050',
        'https': 'socks5h://127.0.0.1:9050'
    }

    for level in levels:
        url = f'https://word-by-word.ru/ratings/cefr-{level}'

        web_request = requests.get(url, headers=headers, proxies=proxies)
        soup = BeautifulSoup(web_request.text, "html.parser")
        pages = int(soup.find(attrs={"class": "article-header"}).h1.span.text.split()[0]) // 100 + 1

        words = []
        for item in soup.find_all(attrs={"class": "word-card"}):
            word = item.find(attrs={"class": "spelling"}).text
            type_word = item.find(attrs={"class": "part-of-speech"}).text
            translate = item.find(attrs={"class": "trs"}).span.text
            marks = item.find_all(attrs={"class": "mark"})
            if len(marks) == 3:
                level_word = marks[1]["data-cefr"]
                usage = marks[2]["data-rating"]
            else:
                level_word = marks[0]["data-cefr"]
                usage = marks[1]["data-rating"]
            words.append((word, type_word, translate, level_word, usage))
        for index in range(2, pages + 1):
            time.sleep(5)
            url = f'https://word-by-word.ru/ratings/cefr-{level}?page={index}'
            web_request = requests.get(url, headers=headers, proxies=proxies)
            soup = BeautifulSoup(web_request.text, "html.parser")
            for item in soup.find_all(attrs={"class": "word-card"}):
                print(item)
                word = item.find(attrs={"class": "spelling"}).text
                type_word = item.find(attrs={"class": "part-of-speech"}).text
                translate = item.find(attrs={"class": "trs"}).span.text
                marks = item.find_all(attrs={"class": "mark"})
                if len(marks) == 3:
                    level_word = marks[1]["data-cefr"]
                    usage = marks[2]["data-rating"]
                else:
                    level_word = marks[0]["data-cefr"]
                    usage = marks[1]["data-rating"]
                    print((word, type_word, translate, level_word, usage))
                words.append((word, type_word, translate, level_word, usage))
        save(words, level)
        print(len(words))
        response.append(words)
        count += len(words)
        time.sleep(10)

    print("total count:", count)
    print(response)
    return response


def save(response, level):
    with open(f"words-{level}.txt", 'w') as f:
        for item in response:
            f.write(" ".join(list(item)) + "\n")



def lewisforemanschool():
    levels = ["a1", "a2", "b1", "b2", "c1", "c2"]
    response = {}
    ans = []
    count = 0
    for level in levels:
        words = []
        url = f'https://lewisforemanschool.ru/words/{level}'
        user_agent = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/102.0.5005.63 Safari/537.36"
        headers = {'User-Agent': user_agent}
        web_request = requests.get(url, headers=headers)
        soup = BeautifulSoup(web_request.text, "html.parser")
        for item in soup.find(attrs={"class": "textable css105"}):
            if item.text and len(item.split()) > 3:
                item = (item.text.split()[1], item.text.split()[3])
                if item not in ans:
                    words.append(item)
                    ans.append(item)
        response[level] = words
        count += len(words)
        with open(f"lewisforemanschool/{level}.txt") as f:
            for i in words:
                f.write(i)
    ans = None
    print("total count:", count)
    print(response)


if __name__ == '__main__':
    start_time = time.time()
    save(words())

    # try:
    #     words()
    # except Exception:
    #     print("error word_by_word request")
    print(f"Request time: {time.time()-start_time} seconds\n")

    start_time = time.time()
    try:
        lewisforemanschool()
    except Exception:
        print("error lewisforemanschool request")
    print(f"Request time: {time.time()-start_time} seconds\n")