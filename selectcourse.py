import random
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.common.keys import Keys
from selenium.common.exceptions import NoSuchElementException
import datetime
import time
import argparse
import sys

# Create global variable for target time
global_target_time = None

# Custom expected condition that returns True when the current time reaches or exceeds the target
def time_reached(driver):
    return datetime.datetime.now() >= global_target_time

def startCRN(username, password, time_settings, *crns):
    print("Selenium otomasyonu baslatiliyor...")
    try:
        # Create datetime object from the time_settings
        # Make target_time globally accessible for the time_reached function
        global global_target_time
        global_target_time = datetime.datetime(
            year=int(time_settings['year']),
            month=int(time_settings['month']),
            day=int(time_settings['day']),
            hour=int(time_settings['hour']),
            minute=int(time_settings['minute']),
            second=int(time_settings['second'])
        )
        
        print(f"Hedef zaman ayarlandi: {global_target_time}")
        
        web = webdriver.Chrome()
        web.maximize_window()
        web.get('https://obs.itu.edu.tr/ogrenci/DersKayitIslemleri/DersKayit')
        
        # --- Giris Bolumu ---
        name_field = web.find_element(By.XPATH, '//*[@id="ContentPlaceHolder1_tbUserName"]')
        name_field.send_keys(username)
        print("Kullanici adi girildi:", username)
        
        pwd_field = web.find_element(By.XPATH, '//*[@id="ContentPlaceHolder1_tbPassword"]')
        pwd_field.send_keys(password)
        print("Sifre girildi.")
        
        sbutton = web.find_element(By.XPATH, '//*[@id="ContentPlaceHolder1_btnLogin"]')
        sbutton.click()
        print("Giris butonuna tiklandi.")
        
        # --- Ders Secim Sayfasina Navigasyon ---
        wait = WebDriverWait(web, 10)
        element = wait.until(EC.visibility_of_element_located(
            (By.XPATH, '//*[@id="page-wrapper"]/div[1]/div[2]/div[1]/ul/li[5]/a')
        ))
        print("Ders secim elementi bulundu.")
        link1 = web.find_element(By.XPATH, '//*[@id="page-wrapper"]/div[1]/div[2]/div[1]/ul/li[5]/a')
        link1.click()
        time.sleep(2)

        link2 = web.find_element(By.XPATH, '//*[@id="page-wrapper"]/div[1]/div[2]/div[4]/ul/li/div/ul/li[2]/a')
        link2.click()
        time.sleep(1)
        print("Ders secim formuna gidildi.")

        # Wait until the target time is reached (set timeout sufficiently high)
        print("Waiting until target time is reached...")
        WebDriverWait(web, timeout=3600, poll_frequency=1).until(time_reached)
        print("Target time reached. Continuing with the script...")
        web.refresh()
        time.sleep(2)
        # --- Form Doldurma (surekli calisir) ---
        first_input_xpath = '/html/body/div/main/div[2]/div/div/div[4]/div/form/div[1]/div/div[1]/div/input'

        # Timing parameters
        timeout = 30         # Total maximum wait time (in seconds)
        refresh_interval = 3 # Refresh the page every 3 seconds if not visible

        start_time = time.time()
        last_refresh = start_time

        while True:
            try:
                element = web.find_element(By.XPATH, first_input_xpath)
                if element.is_displayed():
                    print("Element is visible!")
                    break  # The element is visible; exit the waiting loop.
            except NoSuchElementException:
                # The element is not present yet.
                pass

            # If more than `refresh_interval` seconds have passed, refresh the page.
            if time.time() - last_refresh >= refresh_interval:
                print("Element not visible yet. Refreshing page...")
                web.refresh()
                last_refresh = time.time()

            # If we've waited longer than `timeout` seconds, stop waiting.
            if time.time() - start_time > timeout:
                raise Exception(f"Element not visible after waiting {timeout} seconds.")

            time.sleep(0.5)  # Short sleep to avoid hammering the CPU

        print("Content is visible. Starting the main loop...")
        while True:
            base_xpath = '/html/body/div/main/div[2]/div/div/div[4]/div/form/div[1]/div/div[{}]/div/input'
            for index, crn in enumerate(crns, start=1):
                print(f"CRN {crn}, alan {index} isleniyor")
                input_field = WebDriverWait(web, 10).until(
                    EC.element_to_be_clickable((By.XPATH, base_xpath.format(index)))
                )
                web.execute_script("arguments[0].setAttribute('value', '')", input_field)
                input_field.send_keys(str(crn))

            #submit_button = web.find_element(By.XPATH, '/html/body/div[1]/main/div[2]/div/div/div[3]/div[4]/div/form/button')
            #submit_button.click()
            select_button = web.find_element(By.XPATH, '//*[@id="page-wrapper"]/div[2]/div/div/div[4]/div/form/button[2]')
            select_button.click()
            time.sleep(1)

            confirm_button = web.find_element(By.XPATH, '//*[@id="modals-container"]/div/div[2]/div/div[3]/button[2]')
            confirm_button.click()
            print("Form gonderildi.")
            time.sleep(2.5)
        
    except KeyError as e:
        print(f"Tarih bilgisi hatali: {e}")
        print(f"Alinan tarih verisi: {time_settings}")
        raise
    except ValueError as e:
        print(f"Tarih donusturme hatasi: {e}")
        raise

if __name__ == '__main__':
    try:
        parser = argparse.ArgumentParser(description='Selenium ile ders secim otomasyonu.')
        parser.add_argument('username', type=str, help='Giris kullanici adi')
        parser.add_argument('password', type=str, help='Giris sifresi')
        parser.add_argument('target_time', type=str, help='Hedef zaman (JSON string)')
        parser.add_argument('crns', nargs='+', type=int, help='CRN listesi (boslukla ayrilmis)')
        args = parser.parse_args()
        print("Python scripti baslatildi, argumanlar:", sys.argv)
        import json
        time_settings = json.loads(args.target_time)
        startCRN(args.username, args.password, time_settings, *args.crns)
    except Exception as e:
        print("Bir hata olustu:", e)
