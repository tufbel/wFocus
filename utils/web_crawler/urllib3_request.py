# -*- encoding: utf-8 -*-
"""
@File    : request.py
@Date    : 2019/11/15
@Author  : Regulus
@Contact : yusheng831143@gmail.com
@Desc    : 使用request爬虫获取Warframe数据。
"""
import json
import re
from typing import List, Dict
from bs4 import BeautifulSoup
import requests
import urllib3
from lxml import etree
from utils import paths
from utils.warframe_data import warframe_api as API


def get_data():
    """获取战甲信息"""
    http = urllib3.PoolManager()
    r = http.request('GET', API.WARFRAME_WARFRAMES)
    with open(paths.get_path(idir='json/Warframes.json'), 'wb') as fp:
        fp.write(r.data)

    # r = http.request('GET', API.WARFRAME_MODS)
    # with open(paths.get_path(idir='json/Mods.json'), 'wb') as fp:
    #     fp.write(r.data)


def bulid_img(name, url, referer):
    http = urllib3.PoolManager()
    header = {
        'Referer': f'{referer}',
        'Sec-Fetch-Mode': 'no-cors',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/77.0.3865.90 Safari/537.36'
    }

    r = http.request('GET', url=url, headers=header)

    with open(paths.get_path(idir=f'media/warframes/{name}'), 'wb') as fp:
        fp.write(r.data)

    # print(r.headers['Content-Type'])


def build_url():
    urls: Dict[str, str] = {}
    with open(paths.get_path(idir='json/imgs.json'), 'r', encoding='utf-8') as fp:
        imgs = json.load(fp)

    for name in imgs.keys():
        urls[name] = API.WIKI.format(url=name)

    return urls


def get_img():
    urls = build_url()
    http = urllib3.PoolManager()
    for name, url in urls.items():
        rp = http.request('GET', url)
        soup = BeautifulSoup(rp.data, 'lxml')
        imgs = soup.find_all('table', class_='infobox')
        for img in imgs:
            img_name = re.sub('NewLook', '', img.img['alt'])
            img_url = img.img['src']
            bulid_img(img_name, img_url, referer=url)


