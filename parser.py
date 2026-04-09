import requests
from bs4 import BeautifulSoup
from supabase import create_client, Client
import re
import time

# 1. Твои ключи от базы
URL = "https://wtmysbrocahnlflfqgaz.supabase.co"
KEY = "sb_publishable_aOJn8vKg5pYoN9E9YGe0ew_-yZ-cLn9"
supabase: Client = create_client(URL, KEY)

# 2. Правильные ссылки, которые ты скинул
TARGET_URLS = [
    "https://rozbl.ru/catalogue/vse-tsvety/",
    "https://rozbl.ru/catalogue/rozy/",
    "https://rozbl.ru/catalogue/tsvety-v-korobkakh/",
    "https://rozbl.ru/catalogue/kompozitsii/"
]

def parse_and_upload():
    print("🚀 Запускаем мега-сбор букетов по новым ссылкам...")
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36"
    }
    
    all_products = []
    seen_names = set() # Память от дубликатов
    limit = 50 # Собираем ровно 50 штук

    for url in TARGET_URLS:
        if len(all_products) >= limit:
            break
            
        try:
            print(f"\n🔎 Штурмуем раздел: {url}")
            response = requests.get(url, headers=headers)
            
            if response.status_code != 200:
                print(f"❌ Ошибка доступа к странице. Код: {response.status_code}")
                continue
                
            soup = BeautifulSoup(response.text, 'html.parser')
            
            # Умный поиск названия категории (берем главный заголовок H1)
            category_name = "Каталог"
            h1 = soup.find('h1')
            if h1:
                category_name = h1.text.strip()
            print(f"📁 Нашли категорию: {category_name}")

            # Ищем все карточки товаров
            cards = soup.find_all(['div', 'li'], class_=lambda c: c and ('item' in c.lower() or 'product' in c.lower() or 'card' in c.lower()))
            
            for card in cards:
                if len(all_products) >= limit:
                    break
                    
                try:
                    # 1. Название
                    name_elem = card.find(['h3', 'div', 'a', 'span'], class_=lambda c: c and ('name' in c.lower() or 'title' in c.lower()))
                    if not name_elem: continue
                    name = name_elem.text.strip()
                    
                    if not name or name in seen_names: 
                        continue # Пропускаем пустые и дубликаты

                    # 2. Цена (берем ПОСЛЕДНЕЕ число, чтобы игнорировать старую зачеркнутую цену)
                    price_elem = card.find(['span', 'div', 'p'], class_=lambda c: c and 'price' in c.lower())
                    if not price_elem: continue
                    
                    price_text = price_elem.text.replace(' ', '').replace('\xa0', '')
                    numbers = re.findall(r'\d+', price_text)
                    if not numbers: continue
                    # Берем последнее число из блока цены
                    price = int(numbers[-1]) 
                    
                    # 3. Картинка
                    img_elem = card.find('img')
                    if not img_elem: continue
                    img_url = img_elem.get('src') or img_elem.get('data-src')
                    if not img_url: continue
                    if not img_url.startswith('http'):
                        img_url = "https://rozbl.ru" + img_url
                        
                    # Если всё нашли - добавляем в корзину
                    all_products.append({
                        "name": name,
                        "price": price,
                        "category": category_name,
                        "image": img_url
                    })
                    seen_names.add(name)
                    print(f"  ✅ Спарсили: {name} | {price} руб.")
                    
                except Exception as e:
                    continue
            
            time.sleep(1) # Задержка, чтобы нас не заблокировали
            
        except Exception as e:
            print(f"❌ Ошибка в разделе {url}: {e}")

    # Отправляем всё добро в базу данных
    if all_products:
        print(f"\n📦 Всего собрано: {len(all_products)} уникальных букетов.")
        print("📤 Отправляем данные в базу Supabase...")
        try:
            data, count = supabase.table('products').insert(all_products).execute()
            print("💎 УСПЕХ! 50 букетов загружены и разбиты по категориям!")
        except Exception as e:
            print(f"❌ Ошибка при загрузке в базу: {e}")
    else:
        print("⚠ Ничего не нашли. Возможно, сайт поменял дизайн.")

if __name__ == "__main__":
    parse_and_upload()