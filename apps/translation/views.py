import json
import re
from pprint import pprint

from django.shortcuts import render

from apps.translation.models import Thesaurus
from utils import paths


class EnToZh(object):
    """英文转中文"""

    def __init__(self):
        self.en_to_zh = None

    def run(self):
        pass

    def migrate_dict(self):
        with open(paths.get_path('json/translation/en_to_zh.json'), 'r', encoding='utf-8') as f:
            data = json.load(f)
        thesaurus_list: list = []
        for en, zh in data.items():
            new_en = en.lower().strip()
            thesaurus = Thesaurus(en_key=new_en, zh_value=zh)
            thesaurus_list.append(thesaurus)

        thesaurus_list.reverse()
        Thesaurus.objects.bulk_create(thesaurus_list)

    def query_zh_db(self, en_str: str) -> str:
        item = Thesaurus.objects.filter(en_key__istartswith=en_str).first()
        return item.zh_value if item is not None else None

    def query_zh(self, en_str: str) -> (str, str):
        re_str = re.compile(en_str, flags=re.IGNORECASE)
        if self.en_to_zh is None:
            item = Thesaurus.objects.all().values_list()
            item = list(zip(*item))
            self.en_to_zh = list(zip(item[1], item[2]))
        result = []
        for en, zh in self.en_to_zh:
            if re_str.match(en):
                result.append((zh, en))

        return_result = []
        for zh, en in result:
            if re_str.fullmatch(en):
                return_result.append((zh, en))

        if return_result:
            return return_result[0]
        elif result:
            return result[0]
        else:
            return (en_str, en_str)

    def faction_translation(self, name_str: str) -> str:
        for faction, names in FACTIONS.items():
            if name_str.lower() in names:
                return faction

        zh, en = self.query_zh(name_str)
        return zh

    def missiontype_translation(self, name_str: str) -> str:
        for missiontype, names in MISSION_TYPE.items():
            if name_str.lower() in names:
                return missiontype

        zh, en = self.query_zh(name_str)
        return zh

    def mission_limiters_translation(self, name_str: str) -> str:
        name_re = re.compile(name_str, flags=re.IGNORECASE)

        for type, name in MISSION_LIMITERS.items():
            if name_re.search(name):
                return type

        zh, en = self.query_zh(name_str)
        return zh

    def node_translation(self, name_str: str) -> str:
        node = re.split(r'\(|\)', name_str)
        star, en = self.query_zh(node[1])
        node = f'{star.strip()} | {node[0].strip()}'
        return node

    def reward_transition(self, name_str: str) -> str:
        prepend_num = None
        start = None
        content = name_str.strip()
        append_word = None
        end = None

        prepend_re = re.compile(r'[0-9]+')
        append_re = re.compile('|'.join(PART_LIST.keys()), flags=re.IGNORECASE)

        prepend_str = prepend_re.search(name_str)
        if prepend_str:
            prepend_num = prepend_str.group()
            start = prepend_str.end()

        append_str = append_re.search(name_str)
        if append_str:
            append_word = append_str.group().lower()
            end = append_str.start()
            append_word = PART_LIST.get(append_word, '')

        content = content[start:end].strip()
        content, en = self.query_zh(content)
        new_reward = f'{prepend_num if prepend_num else ""} {content} {append_word if append_word else ""}'.strip()

        return new_reward


FACTIONS = {
    'Tenno': ['tenno'],
    'Grineer': ['grineer'],
    'Corpus': ['corpus'],
    'Infested': ['infested'],
    'Orokin': ['orokin', 'corrupted'],
    'Sentient': ['sentient'],
    'Sentient': ['Sentient'],
}

MISSION_TYPE = {
    '中断': ['disruption'],
    '强袭': ['assault'],
    '刺杀': ['assassination'],
    '捕获': ['capture'],
    '防御': ['defense'],
    '叛逃': ['defection'],
    '挖掘': ['excavation'],
    '歼灭': ['extermination'],
    '清巢': ['hive'],
    '间谍': ['spy'],
    '自由漫游': ['free roam'],
    '移动防御': ['mobile defense'],
    '救援': ['rescue'],
    '劫持': ['hijack'],
    '破坏': ['sabotage'],
    '黑暗地带': ['dark sector'],
    '生存': ['survival'],
    '拦截': ['interception'],
}

MISSION_LIMITERS = {
    '武器限定：突击步枪': 'Weapon Restriction: Assault Rifle Only',
    '武器限定：手枪': 'Weapon Restriction: Pistol Only',
    '武器限定：近战': 'Weapon Restriction: Melee Only',
    '武器限定：弓箭': 'Weapon Restriction: Bow Only',
    '武器限定：霰弹枪': 'Weapon Restriction: Shotgun Only',
    '武器限定：狙击枪': 'Weapon Restriction: Sniper Only',
    '敌人元素强化：腐蚀': 'Enemy Elemental Enhancement: Corrosive',
    '敌人元素强化：电击': 'Enemy Elemental Enhancement: Electricity',
    '敌人元素强化：爆炸': 'Enemy Elemental Enhancement: Blast',
    '敌人元素强化：火焰': 'Enemy Elemental Enhancement: Heat',
    '敌人元素强化：冰冻': 'Enemy Elemental Enhancement: Cold',
    '敌人元素强化：毒气': 'Enemy Elemental Enhancement: Gas',
    '敌人元素强化：磁力': 'Enemy Elemental Enhancement: Magnetic',
    '敌人元素强化：毒素': 'Enemy Elemental Enhancement: Toxin',
    '敌人元素强化：辐射': 'Enemy Elemental Enhancement: Radiation',
    '敌人元素强化：病毒': 'Enemy Elemental Enhancement: Viral',
    '敌人物理强化：冲击': 'Enemy Physical Enhancement: Impact',
    '敌人物理强化：穿刺': 'Enemy Physical Enhancement: Puncture',
    '敌人物理强化：切割': 'Enemy Physical Enhancement: Slash',
    '环境改变：极寒': 'Environmental Effect: Extreme Cold',
    '环境改变：冷却液泄露': 'Environmental Effect: Cryogenic Leakage',
    '环境改变：火灾': 'Environmental Hazard: Fire',
    '环境改变：浓雾': 'Environmental Hazard: Dense Fog',
    '环境改变：电磁异常': 'Environmental Hazard: Electromagnetic Anomalies',
    '环境改变：辐射灾害': 'Environmental Hazard: Radiation Pockets',
    '敌人护甲强化': 'Augmented Enemy Armor',
    '卓越者大本营': 'Eximus Stronghold',
    '能量上限减少': 'Energy Reduction',
    '敌人护盾强化': 'Enhanced Enemy Shields',
}

PART_LIST = {
    'receiver': '枪机',
    'stock': '枪托',
    'barrel': '枪管',
    'blade': '刀刃',
    'handle': '握柄',
    'hilt': '握柄',
    'heatsink': '散热器',
    'blueprint': '蓝图',
    'blueprint': '蓝图',
    'link': '连接器',
}
