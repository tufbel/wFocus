import json
import re
import threading
from ast import literal_eval
from copy import deepcopy
from pprint import pprint
from queue import Queue

from django.shortcuts import render

import requests
from bs4 import BeautifulSoup

from apps.weapons.models import Weapon
from utils import paths


class WeaponsCrawler(object):
    """ TODO 武器信息网络爬虫
    1.获取 /wiki/Weapons 页源码，取得每个武器的url
    2.通过url获取响应
    3.提取数据
    4.处理保存
    """

    def __init__(self):
        self.en_wiki = 'https://warframe.fandom.com{url}'
        self.weapons: list = []
        self.urls_queue = Queue()
        self.htmls_queue = Queue()
        self.weapons_queue = Queue()

    def get_weapons_urls(self):
        response = requests.get(url=self.en_wiki.format(url='/wiki/Weapons'))
        soup = BeautifulSoup(response.text, 'lxml')
        div = soup.find('div', class_='tabbertab', title='Primary')
        spans = div.find_all('span', class_='weapon-tooltip')
        weapons_set: set = set()
        urls: dict = {}
        for span in spans:
            href = span.next.get('href')
            name = span.get('data-param')
            if name not in weapons_set:
                url_dict = {}
                weapons_set.add(name)
                url_dict[name] = href
                self.urls_queue.put(url_dict)
                urls[name] = href

        with open(paths.get_path('json/weapons/Weapons_urls.json'), 'w', encoding='utf-8') as fp:
            json.dump(urls, fp)

    def parse_url(self):
        """发送请求获取源码"""
        while True:
            url_dict = self.urls_queue.get()
            try:
                for name, url in url_dict.items():
                    response = requests.get(self.en_wiki.format(url=url))
                    content = response.content.decode()
                    self.htmls_queue.put(content)
            finally:
                self.urls_queue.task_done()

    def get_weapons_info(self):
        """解析源码获取数据"""
        while True:
            html = self.htmls_queue.get()
            try:
                # TODO 解析源码获取数据
                soup = BeautifulSoup(html, 'lxml')
                weapon: dict = {}
                div_info = soup.find('aside', class_='portable-infobox')
                weapon['name'] = div_info.find('h2').text.strip()
                weapon['slot'] = div_info.find('div', attrs={'data-source': 'slot'}).find('div',
                                                                                          class_='pi-data-value').text.strip()
                weapon['type'] = div_info.find('div', attrs={'data-source': 'type'}).find('div',
                                                                                          class_='pi-data-value').text.strip()
                weapon['noise_level'] = div_info.find('div', attrs={'data-source': 'noise level'}).find('div',
                                                                                                        class_='pi-data-value').text.strip()
                weapon['fire_rate'] = div_info.find('div', attrs={'data-source': 'fire rate'}).find('div',
                                                                                                    class_='pi-data-value').text.strip()
                accuracy = div_info.find('div', attrs={'data-source': 'accuracy'})
                if accuracy:
                    weapon['accuracy'] = accuracy.find('div', class_='pi-data-value').text.strip()
                else:
                    weapon['accuracy'] = 'N/A'

                magazine_size = div_info.find('div', attrs={'data-source': 'magazine'})
                if magazine_size:
                    weapon['magazine_size'] = magazine_size.find('div', class_='pi-data-value').text.strip()
                else:
                    weapon['magazine_size'] = 'N/A'

                max_ammo = div_info.find('div', attrs={'data-source': 'max ammo'})
                if max_ammo:
                    weapon['max_ammo'] = max_ammo.find('div', class_='pi-data-value').text.strip()
                else:
                    weapon['max_ammo'] = 'N/A'

                weapon['reload_time'] = div_info.find('div', attrs={'data-source': 'reload'}).find('div',
                                                                                                   class_='pi-data-value').text.strip()
                disposition = div_info.find('div', attrs={'data-source': 'disposition'})
                if disposition:
                    weapon['disposition'] = disposition.find('div', class_='pi-data-value').text.strip()
                else:
                    weapon['disposition'] = 'N/A'

                weapon['trigger_type'] = div_info.find('div', attrs={'data-source': 'trigger'}).find('div',
                                                                                                     class_='pi-data-value').text.strip()

                section_list = div_info.find_all('section', class_='pi-item')
                section_list = list(filter(lambda x: x.find('h2') != None, section_list))[1:-1]
                weapon['pattern'] = {}
                for pi_item_se in section_list:
                    se_data: dict = {}
                    for div in pi_item_se.find_all('div', class_='pi-item'):
                        name = div.find('h3').text.lower().strip()
                        name = re.sub(r'\s', '_', name)
                        se_data[name] = div.find('div', class_='pi-data-value').text.strip()
                    if pi_item_se.find('section', class_='pi-item'):
                        damage: dict = {}
                        for i in pi_item_se.find('section', class_='pi-item').find_all('td'):
                            damage_type = i.find('span').get('data-param').lower()
                            damage[damage_type] = i.text.strip()

                        se_data['total_damage'] = [se_data.get('total_damage', '0'), damage]
                    else:
                        damage: dict = {}
                        div_damage = pi_item_se.find('div', class_='pi-item').find('div', class_='pi-data-value')
                        damage_type = div_damage.find('span').get('data-param').lower()
                        damage[damage_type] = div_damage.text.strip()

                        se_data['total_damage'] = [se_data.get('total_damage', '0'), damage]

                    type_name = pi_item_se.find('h2', class_='pi-item').text.strip().lower()
                    weapon['pattern'][type_name] = se_data
                self.weapons.append(weapon)
            finally:
                self.htmls_queue.task_done()

    def save_weapons(self):
        """保存"""
        with open(paths.get_path('json/weapons/Weapons.json'), 'w', encoding='utf-8') as f:
            json.dump(self.weapons, f)

    def get_weapons_data(self):
        with open(paths.get_path('json/weapons/Weapons.json'), 'r', encoding='utf-8') as f:
            weapons = json.load(f)
        for weapon in weapons:
            self.weapons_queue.put(weapon)

    def save_weapons_to_database(self):
        """ 保存至数据库"""
        re_family = re.compile(
            r'Prime|Telos|MK1-|Vandal|Prisma|Wraith|Secura|Secura|Carmine|Synoid|Vaykor|Sancti|Dex|Kuva',
            flags=re.IGNORECASE)
        re_type = re.compile(r'Rifle|Shotgun', flags=re.IGNORECASE)
        re_space = re.compile(r' ')
        re_number = re.compile(r'[0-9.]+')

        while True:
            weapon = self.weapons_queue.get()
            try:
                if re_type.search(weapon['type']):
                    weapon_db, created = Weapon.objects.get_or_create(name=weapon['name'])
                    # weapon_db.name = weapon['name']
                    weapon_db.family = re_family.sub('', weapon['name']).strip()
                    weapon_db.type = weapon['type']
                    weapon_db.slot = weapon['slot']
                    weapon_db.noise_level = weapon['noise_level']
                    weapon_db.fire_rate = re_number.search(weapon['fire_rate']).group() if re_number.search(
                        weapon['fire_rate']) else 'N/A'
                    weapon_db.accuracy = re_number.search(weapon['accuracy']).group() if re_number.search(
                        weapon['accuracy']) else 'N/A'
                    weapon_db.magazine_size = re_number.search(weapon['magazine_size']).group() if re_number.search(
                        weapon['magazine_size']) else 'N/A'
                    weapon_db.max_ammo = re_number.search(weapon['max_ammo']).group() if re_number.search(
                        weapon['max_ammo']) else 'N/A'
                    weapon_db.reload_time = re_number.search(weapon['reload_time']).group() if re_number.search(
                        weapon['reload_time']) else 'N/A'
                    weapon_db.disposition = weapon['disposition']
                    weapon_db.trigger_type = weapon['trigger_type']

                    old_pattern = deepcopy(weapon['pattern'])
                    pattern: dict = {}
                    for key, value in old_pattern.items():
                        new_key = re_space.sub('_', key)
                        new_value: dict = {}
                        old_value = deepcopy(value)
                        for k, v in old_value.items():
                            if re.search('total_damage', k):
                                n_v: list = []
                                n_v.append(literal_eval(re_number.search(v[0]).group()))  # 总伤害转数值

                                n_d: dict = {}  # 伤害组成转数值
                                for dk, dv in v[1].items():
                                    n_d[dk] = literal_eval(re_number.search(dv).group())
                                n_v.append(n_d)

                                new_value[k] = n_v
                            elif re.search('crit_chance', k):
                                new_value[k] = literal_eval(re_number.search(v).group()) / 100
                            elif re.search('crit_multiplier', k):
                                new_value[k] = literal_eval(re_number.search(v).group())
                            elif re.search('status_chance', k):
                                new_value[k] = literal_eval(re_number.search(v).group()) / 100
                            else:
                                del value[k]

                        pattern[new_key] = new_value

                    weapon_db.pattern = pattern
                    weapon_db.save()
            finally:
                self.weapons_queue.task_done()

    def run(self):
        threading_list = []

        self.get_weapons_urls()

        for i in range(10):
            t_parse = threading.Thread(target=self.parse_url)
            threading_list.append(t_parse)

        for i in range(30):
            t_ex = threading.Thread(target=self.get_weapons_info)
            threading_list.append(t_ex)

        for t in threading_list:
            t.setDaemon(True)  # 子线程设置为守护线程
            t.start()

        for q in [self.urls_queue, self.htmls_queue]:
            q.join()

        self.save_weapons()

    def run_to_db(self):
        threading_list = []

        self.get_weapons_data()

        for i in range(20):
            t_transform = threading.Thread(target=self.save_weapons_to_database)
            threading_list.append(t_transform)

        for t in threading_list:
            t.setDaemon(True)  # 子线程设置为守护线程
            t.start()
        self.weapons_queue.join()

    def change_family(self):
        re_family = re.compile(
            r'Prime|Telos|MK1-|Vandal|Prisma|Wraith|Secura|Secura|Carmine|Synoid|Vaykor|Sancti|Dex|Kuva',
            flags=re.IGNORECASE)

        weapons = Weapon.objects.all()
        for weapon in weapons:
            family = re_family.sub('', weapon.family).strip()
            weapon.family = family

        Weapon.objects.bulk_update(weapons, ['family'])

    def update_pattern_item():
        weapons = Weapon.objects.all()
        for weapon in weapons:
            new_pattern = {}
            for key, value in weapon.pattern.items():
                new_key = re.sub('[^a-z]', key.lower())
                new_pattern[new_key] = value
            weapon.pattern = new_pattern
        Weapon.objects.bulk_update(weapons, ['pattern'])


class WfaCrawler(object):
    """Wfa实时信息网络爬虫"""

    def __init__(self):
        self.url_template = 'https://data.richasy.cn/wfa/basic/total?platform=pc'
        self.url_reword = 'https://data.richasy.cn/wfa/basic/bounty?platform=pc&region={}&language=zh'

    def run_get(self, url):
        complete_url = self.url_template
        response = requests.get(url=complete_url, headers=GET_DATA_HEADERS)
        if response.status_code != 200:
            raise Exception('数据获取失败')
        json_data = response.json()
        re_data = json_data.get(url, None)
        return re_data

    def run_get_reword(self, url):
        complete_url = self.url_reword.format(url)
        response = requests.get(url=complete_url, headers=GET_DATA_HEADERS)
        if response.status_code != 200:
            raise Exception('数据获取失败')
        return response.json()


GET_DATA_HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/77.0.3865.90 Safari/537.36 ',
    'Accept': 'application/json, text/plain, */*',
    'Authorization': 'Bearer eyJhbGciOiJSUzI1NiIsImtpZCI6IkMwQkU5QUI4OUYyQTBFOTMxQUFGMjBEOEVDREY4Nzc2OTFFRDcyRjgiLCJ0eXAiOiJhdCtqd3QiLCJ4NXQiOiJ3TDZhdUo4cURwTWFyeURZN04tSGRwSHRjdmcifQ.eyJuYmYiOjE1ODkwODUwODEsImV4cCI6MTU5MDI5NDY4MSwiaXNzIjoiaHR0cDovL2lkZW50aXR5LnJpY2hhc3kuY24iLCJhdWQiOiJ3ZmEiLCJjbGllbnRfaWQiOiI1NjdhNDEyODBhMzA0MTgzODMzZmU1ZTZjMDYzYTg3ZCIsImNsaWVudF91c3JpZCI6Iml3QzE0NTFpdzEiLCJzY29wZSI6WyJ3ZmEuYmFzaWMiXX0.lhzyeOvS6_fumhhzwR1Oj6S2lc1L0Viv5rxyj44q6vEkZXNnNdj0rDWw9Ng6WLnb2GSugo85-oDIuZUgAuMC_Bwm_uC2FzIPEN7hLJImSg-ry_UY_EJgUe2sJSFO_8D0yBAfeV3sne-GkfVseoWQSLkj0CnPL9cdnvYvZpUy4v5Z3Fgzlnj_L18BNMeOcmrIZGtCpq5tVZ7_7B2X6GVBBNwYz9RZGtVrs8ajkscX_6ETVfh__1nzNnDoMoUjPQ4THJXFFr90NOQqNEs-t5FP03E4Rg8q5bq8cosbKvcwM0KVQzL3bmC5rvbizGRlRv3JVqfWKRpz9JigRfxU1BRDAA'
}

# class WfaCrawler(object):
#     """Wfa实时信息网络爬虫"""
#
#     def __init__(self):
#         self.url_template = 'https://api.richasy.cn/wfa/basic/pc/{url}'
#
#     def run_get(self, url):
#         complete_url = self.url_template.format(url=url)
#         response = requests.options(url=complete_url, headers=OPTIONS_HEADERS)
#         if response.status_code != 204:
#             raise Exception('授权获取失败')
#         response = requests.get(url=complete_url, headers=GET_DATA_HEADERS)
#         if response.status_code != 200:
#             raise Exception('数据获取失败')
#         return response.json()
#
#
# class TranslationDictCrawler(object):
#
#     def __init__(self):
#         pass
#
#
# OPTIONS_HEADERS = {
#     'Access-Control-Request-Headers': 'authorization',
#     'Access-Control-Request-Method': 'GET',
#     'Origin': 'https://wfa.richasy.cn',
#     'Referer': 'https://wfa.richasy.cn/',
#     'Sec-Fetch-Mode': 'cors',
#     'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/77.0.3865.90 Safari/537.36 '
# }
#
# GET_DATA_HEADERS = {
#     'Origin': 'https://wfa.richasy.cn',
#     'Referer': 'https://wfa.richasy.cn/',
#     'Sec-Fetch-Mode': 'cors',
#     'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/77.0.3865.90 Safari/537.36 ',
#     'Accept': 'application/json, text/plain, */*',
#     'Authorization': 'Bearer eyJhbGciOiJodHRwOi8vd3d3LnczLm9yZy8yMDAxLzA0L3htbGRzaWctbW9yZSNyc2Etc2hhMjU2Iiwia2lkIjoiNjRBM0E0OTlGMkRBOUZGMkM3QzY0MzY0MEUxOTc0NzUxMkQzMjBDNSIsInR5cCI6IkpXVCIsIng1dCI6IlpLT2ttZkxhbl9MSHhrTmtEaGwwZFJMVElNVSJ9.eyJuYmYiOjE1NzI5Mzc0ODQsImV4cCI6MTYwNDQ3MzQ4NCwiaXNzIjoiaHR0cDovL2FwaS5yaWNoYXN5LmNuIiwiYXVkIjpbImh0dHA6Ly9hcGkucmljaGFzeS5jbi9yZXNvdXJjZXMiLCJiYXNpY1Byb2ZpbGUiXSwiY2xpZW50X2lkIjoiZWFkZmE2NzBlZDExNGM3ZGJjYWVjYjFhM2ExZjVmYWMiLCJzY29wZSI6WyJiYXNpY1Byb2ZpbGUiXX0.gY4kP2fc51-bLzXcRVt6yV-UfITdwUyPHi37fZ1LiDt4wsJ8__UT45GBEgfQdfffMACklCxnZS6_ahMmrb8WrCyNOLpK426QZZzPn4VC0uRVBb4UdK8C4X53DL3zljH1z8nEji55078NSG6IZ_n4frYEEsPj2pi4x666lvEel3qc2uLpguNEYs-KklcBYqtzW5HGMXAduHmHkAhD6CcRTAgOzU6ypgGZI0fEvLEmRYi8te9s_z2J707bCuoN_vRMrMDaY1S3Fl9aef7aPncs7-cnF8UHmFVGiD_OqYP5qkVsQi_4Z7i44AmVdad6T2Yu_LGjQmXHRKtcuJR5R_iEVw'
# }
