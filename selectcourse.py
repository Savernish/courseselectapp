import random
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.common.keys import Keys
import time
import argparse
import sys

def startCRN(username, password, *crns):
    print("Selenium otomasyonu başlatılıyor. Kullanıcı adı:", username, "ve CRN'ler:", crns)
    web = webdriver.Chrome()
    web.maximize_window()
    web.get('https://obs.itu.edu.tr/ogrenci/DersKayitIslemleri/DersKayit')
    
    # --- Giriş Bölümü ---
    name_field = web.find_element(By.XPATH, '//*[@id="ContentPlaceHolder1_tbUserName"]')
    name_field.send_keys(username)
    print("Kullanıcı adı girildi:", username)
    
    pwd_field = web.find_element(By.XPATH, '//*[@id="ContentPlaceHolder1_tbPassword"]')
    pwd_field.send_keys(password)
    print("Şifre girildi.")
    
    sbutton = web.find_element(By.XPATH, '//*[@id="ContentPlaceHolder1_btnLogin"]')
    sbutton.click()
    print("Giriş butonuna tıklandı.")
    
    # --- Ders Seçim Sayfasına Navigasyon ---
    wait = WebDriverWait(web, 10)
    element = wait.until(EC.visibility_of_element_located(
        (By.XPATH, '//*[@id="page-wrapper"]/div[1]/div[2]/div[1]/ul/li[5]/a')
    ))
    print("Ders seçim elementi bulundu.")
    link1 = web.find_element(By.XPATH, '//*[@id="page-wrapper"]/div[1]/div[2]/div[1]/ul/li[5]/a')
    link1.click()
    time.sleep(0.5)

    link2 = web.find_element(By.XPATH, '//*[@id="page-wrapper"]/div[1]/div[2]/div[4]/ul/li/div/ul/li[4]/a')
    link2.click()
    print("Ders seçim formuna gidildi.")

    # --- Form Doldurma (sürekli çalışır) ---
    while True:
        base_xpath = '/html/body/div[1]/main/div[2]/div/div/div[3]/div[4]/div/form/div/div[{}]/div/input'
        for index, crn in enumerate(crns, start=1):
            print(f"CRN {crn}, alan {index} işleniyor")
            input_field = WebDriverWait(web, 10).until(
                EC.element_to_be_clickable((By.XPATH, base_xpath.format(index)))
            )
            web.execute_script("arguments[0].value = '';", input_field)
            input_field.send_keys(Keys.CONTROL + "a")
            input_field.send_keys(Keys.BACKSPACE)
            web.execute_script("arguments[0].setAttribute('value', '')", input_field)
            input_field.send_keys(str(crn))

        submit_button = web.find_element(By.XPATH, '/html/body/div[1]/main/div[2]/div/div/div[3]/div[4]/div/form/button')
        submit_button.click()
        print("Form gönderildi.")
        time.sleep(random.uniform(1, 3))

if __name__ == '__main__':
    try:
        parser = argparse.ArgumentParser(description='Selenium ile ders seçim otomasyonu.')
        parser.add_argument('username', type=str, help='Giriş kullanıcı adı')
        parser.add_argument('password', type=str, help='Giriş şifresi')
        parser.add_argument('crns', nargs='+', type=int, help='CRN listesi (boşlukla ayrılmış)')
        args = parser.parse_args()
        print("Python scripti başlatıldı, argümanlar:", sys.argv)
        startCRN(args.username, args.password, *args.crns)
    except Exception as e:
        print("Bir hata oluştu:", e)
