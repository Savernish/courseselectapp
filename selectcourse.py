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
    print("Starting Selenium automation with username:", username, "and CRNs:", crns)
    web = webdriver.Chrome()
    web.maximize_window()
    web.get('https://obs.itu.edu.tr/ogrenci/DersKayitIslemleri/DersKayit')
    
    # --- Login Section using provided credentials ---
    name_field = web.find_element(By.XPATH, '//*[@id="ContentPlaceHolder1_tbUserName"]')
    name_field.send_keys(username)
    print("Entered username:", username)
    
    pwd_field = web.find_element(By.XPATH, '//*[@id="ContentPlaceHolder1_tbPassword"]')
    pwd_field.send_keys(password)
    print("Entered password.")
    
    sbutton = web.find_element(By.XPATH, '//*[@id="ContentPlaceHolder1_btnLogin"]')
    sbutton.click()
    print("Clicked login button.")
    
    # --- Navigation to Course Selection ---
    wait = WebDriverWait(web, 10)
    element = wait.until(EC.visibility_of_element_located(
        (By.XPATH, '//*[@id="page-wrapper"]/div[1]/div[2]/div[1]/ul/li[5]/a')
    ))
    print("Found course selection navigation element.")
    link1 = web.find_element(By.XPATH, '//*[@id="page-wrapper"]/div[1]/div[2]/div[1]/ul/li[5]/a')
    link1.click()
    time.sleep(0.5)

    link2 = web.find_element(By.XPATH, '//*[@id="page-wrapper"]/div[1]/div[2]/div[4]/ul/li/div/ul/li[4]/a')
    link2.click()
    print("Navigated to course selection form.")

    # --- Filling The Form (runs continuously) ---
    while True:
        base_xpath = '/html/body/div[1]/main/div[2]/div/div/div[3]/div[4]/div/form/div/div[{}]/div/input'
        for index, crn in enumerate(crns, start=1):
            print(f"Processing CRN {crn} in field {index}")
            input_field = WebDriverWait(web, 10).until(
                EC.element_to_be_clickable((By.XPATH, base_xpath.format(index)))
            )
            # Clear the field before sending keys.
            web.execute_script("arguments[0].value = '';", input_field)
            input_field.send_keys(Keys.CONTROL + "a")
            input_field.send_keys(Keys.BACKSPACE)
            web.execute_script("arguments[0].setAttribute('value', '')", input_field)
            input_field.send_keys(str(crn))

        submit_button = web.find_element(By.XPATH, '/html/body/div[1]/main/div[2]/div/div/div[3]/div[4]/div/form/button')
        submit_button.click()
        print("Submitted the form.")
        time.sleep(random.uniform(1, 3))

if __name__ == '__main__':
    try:
        parser = argparse.ArgumentParser(description='Automate course selection using Selenium.')
        parser.add_argument('username', type=str, help='Login username')
        parser.add_argument('password', type=str, help='Login password')
        parser.add_argument('crns', nargs='+', type=int, help='List of CRNs (separated by space)')
        args = parser.parse_args()
        print("Python script started with arguments:", sys.argv)
        startCRN(args.username, args.password, *args.crns)
    except Exception as e:
        print("An error occurred:", e)
