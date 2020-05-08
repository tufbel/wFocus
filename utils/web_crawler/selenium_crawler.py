# -*- encoding: utf-8 -*-
"""
@File    : selenium_crawler.py
@Date    : 2019/10/12
@Author  : Regulus
@Contact : yusheng831143@gmail.com
@Desc    : 使用seleium模块完成数据爬取。
"""
import json
import re
from pprint import pprint

from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

from utils import paths
from utils.warframe_data import warframe_api as API


def sp_str(ele):
    """ 处理爬取到的带双引号的中文字符串 """
    dict = re.split(r'"', ele.text)
    return {dict[0].strip(): dict[1].strip()}


def get_data():
    # 创建驱动
    driver_path = paths.get_path('chromedriver.exe', paths.get_now_path(__file__))
    driver = webdriver.Chrome(executable_path=driver_path)

    # 打开访问页面
    driver.get(url=API.ZH_EN_DICT)

    # 等待数据显示并爬取
    try:
        myd = {}
        # 创建浏览器隐式等待
        wait = WebDriverWait(driver, 10)
        # 等待元素显示
        table = wait.until(
            EC.presence_of_all_elements_located(locator=(
                By.XPATH, '//*[@id="mw-content-text"]/div[3]/table/tbody/tr[1]/td/div/table/tbody/tr'
            ))
        )
        print(len(table))
        trs = list(map(sp_str, table))
        with open(paths.get_path(idir='json/zh.json'), 'w', encoding='utf-8') as fp:
            json.dump(trs, fp)

    finally:
        # 无论是否爬取成功关闭浏览器
        driver.quit()


def get_img():
    """获取warframe图片地址"""
    # 创建驱动
    driver_path = paths.get_path('chromedriver.exe', paths.get_now_path(__file__))
    driver = webdriver.Chrome(executable_path=driver_path)

    # 打开访问页面
    driver.get(url=API.WARFRAME_IMGS)

    # 等待数据显示并爬取
    try:

        # 创建浏览器隐式等待
        wait = WebDriverWait(driver, 10)
        # 等待元素显示
        imgs = wait.until(
            EC.presence_of_all_elements_located(locator=(
                By.XPATH, '//*[@id="mw-content-text"]/div[3]/div[2]/div/a'
            ))
        )
        print(len(imgs))
        w_imgs = {}
        for a in imgs:
            name = a.get_attribute('title')
            img_tag = a.find_element_by_tag_name('IMG')
            img_path = img_tag.get_attribute('src')

            w_imgs[name.strip()] = img_path

        with open(paths.get_path(idir='json/imgs.json'), 'w', encoding='utf-8') as fp:
            json.dump(w_imgs, fp)

    finally:
        # 无论是否爬取成功关闭浏览器
        driver.quit()


def download_img():
    """下载warframe图片"""
    with open(paths.get_path(idir='json/Warframes.json'), 'r', encoding='utf-8') as fp:
        if fp:
            data = json.load(fp)

    names = set()
    for warframe in data:
        name = warframe.get('name', None)
        name = re.sub(r'(Prime|prime)', r'', name).strip()
        names.add(name)


    print(names)
    print(len(names))

download_img()
