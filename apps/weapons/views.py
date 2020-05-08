import copy
import json
import re
from pprint import pprint

from django.shortcuts import render, redirect

from django.urls import reverse
from django.views import View
from django.views.decorators.http import require_POST

from apps.mods.models import ModBox
from apps.mods.views import QueryMods, QueryHotModBoxs
from apps.translation.views import EnToZh
from apps.weapons.models import Weapon
from apps.weapons.serializers import WeaponsSerializer
from utils import restful, dict_keys


def index(request):
    return redirect(reverse('app_index:weapons'))


class WeaponInfo(View):
    """处理武器配置界面武器信息的获取请求"""

    def get(self, request, weapon_name):
        return render(request, 'weapons/wf_weapon.html')

    def post(self, request, weapon_name):
        en_to_zh = EnToZh()
        if re.search(r'(?i)original', request.POST.get('methond', '')):
            w_name = re.sub(r'_', r' ', weapon_name.strip())
            weapon = Weapon.objects.filter(name__iexact=w_name).first()
            serializer = WeaponsSerializer(weapon)
            original = serializer.data

            # TODO 对属性值进行转换或翻译
            original['noise_level'] = en_to_zh.query_zh(original['noise_level'])
            original['type'] = en_to_zh.query_zh(original['type'])
            original['name'] = en_to_zh.query_zh(original['name'])
            original['fire_rate'] = float(original['fire_rate'])
            original['reload_time'] = float(original['reload_time'])
            original['magazine_size'] = int(original['magazine_size'])
            try:
                original['max_ammo'] = int(original['max_ammo'])
            except:
                original['max_ammo'] = 'N/A'

            return restful.ok(data={
                'methond': 'original',
                'original': original
            })
        elif re.search(r'(?i)up', request.POST.get('methond', '')):
            weapon = request.POST.get('weapon', None)
            if weapon:
                weapon = json.loads(weapon)

            mods = request.POST.get('mods', None)
            if mods:
                mods = json.loads(mods)

            return_up = {
                'fire_rate': weapon.get('fire_rate'),
                'magazine_size': weapon.get('magazine_size'),
                'max_ammo': weapon.get('max_ammo'),
                'reload_time': weapon.get('reload_time'),
                'pattern': weapon.get('pattern'),
            }

            if mods and weapon:
                up_dict = {}
                for num_key, mod in mods.items():
                    # 提取所有属性
                    if mod and mod.get('property', None):
                        for key, value in mod.get('property', None).items():
                            (attr_up, num_up, type_up) = get_up_property(key, value)
                            if type_up and attr_up:
                                if attr_up in up_dict:
                                    old_num, old_type = up_dict[attr_up]
                                    if old_type == type_up:
                                        up_dict[attr_up] = (old_num + num_up, type_up)
                                    else:
                                        if old_num > num_up:
                                            up_dict[attr_up] = (old_num - num_up, old_num)
                                        elif old_num < num_up:
                                            up_dict[attr_up] = (num_up - old_num, old_num)
                                        else:
                                            del up_dict[attr_up]
                                else:
                                    up_dict[attr_up] = (num_up, type_up)

                pattern_up_dict = {}
                for key, (num_up, type_up) in up_dict.items():
                    # 计算固定属性的提升
                    if key in BASE_PROPERTY:
                        if type(return_up[key]) != str:
                            if type_up in [UP_TYPE.get('PERCENTAGE_INCREASE')]:
                                return_up[key] = return_up[key] * (1 + num_up)
                            elif type_up in [UP_TYPE.get('PERCENTAGE_REDUCE')]:
                                return_up[key] = return_up[key] * (1 - num_up)
                    elif key in ['reload_time']:
                        if type(return_up[key]) != str:
                            if type_up in [UP_TYPE.get('PERCENTAGE_INCREASE')]:
                                return_up[key] = return_up[key] * (1 - num_up)
                            elif type_up in [UP_TYPE.get('PERCENTAGE_REDUCE')]:
                                return_up[key] = return_up[key] * (1 + num_up)
                    else:
                        pattern_up_dict[key] = (num_up, type_up)

                for p_key, pattern in return_up['pattern'].items():
                    # TODO 计算不同模式的提升
                    new_pattern = copy.deepcopy(pattern)
                    new_pattern_up_dict = copy.deepcopy(pattern_up_dict)
                    # 1.提取原始元素属性
                    element_list = []
                    dict_keys.get_keys(element_list, new_pattern['total_damage'], ELEMENT_PROPERTY)
                    for e_key in element_list:
                        if e_key in new_pattern_up_dict:
                            value = new_pattern['total_damage'][1].pop(e_key)
                            value = value / new_pattern['total_damage'][0]
                            if new_pattern_up_dict[e_key][1] in [UP_TYPE.get('PERCENTAGE_INCREASE')]:
                                new_pattern_up_dict[e_key] = (
                                    new_pattern_up_dict[e_key][0] + value, UP_TYPE.get('PERCENTAGE_INCREASE'))
                            else:
                                if value > new_pattern_up_dict[e_key][0]:
                                    new_pattern_up_dict[e_key] = (
                                        value - new_pattern_up_dict[e_key][0], UP_TYPE.get('PERCENTAGE_INCREASE'))
                                else:
                                    new_pattern_up_dict[e_key][0] = (
                                        new_pattern_up_dict[e_key][0] - value, UP_TYPE.get('PERCENTAGE_REDUCE'))
                        else:
                            value = new_pattern['total_damage'][1].pop(e_key)
                            value = value / new_pattern['total_damage'][0]
                            new_pattern_up_dict[e_key] = (value, UP_TYPE.get('PERCENTAGE_INCREASE'))

                    # 2.组合元素属性
                    element_list = []
                    dict_keys.get_keys(element_list, new_pattern_up_dict, ELEMENT_PROPERTY)
                    for e_key_list in [element_list[0:2], element_list[2:4], element_list[4:6]]:
                        if (len(e_key_list) == 2):
                            new_e_key = combined_element(e_key_list)
                            value_one, type_one = new_pattern_up_dict.pop(e_key_list[0])
                            value_two, type_two = new_pattern_up_dict.pop(e_key_list[1])
                            if type_one == type_two:
                                new_pattern_up_dict[new_e_key] = (value_one + value_two, type_one)
                            else:
                                if value_one > value_two:
                                    new_pattern_up_dict[new_e_key] = (value_one - value_two, type_one)
                                elif value_one < value_two:
                                    new_pattern_up_dict[new_e_key] = (value_two - value_one, type_two)

                    # 3.计算模式提升
                    for up_key, (num_up, type_up) in new_pattern_up_dict.items():
                        if up_key in PHYSICAL_PROPERTY + ELEMENT_PROPERTY + COMBINED_PROPERTY:
                            if type_up is UP_TYPE.get('PERCENTAGE_INCREASE'):
                                value = new_pattern['total_damage'][1].get(up_key, 0)
                                value = value + new_pattern['total_damage'][0] * num_up
                                if value > 0:
                                    new_pattern['total_damage'][1][up_key] = value
                            elif type_up is UP_TYPE.get('PERCENTAGE_REDUCE'):
                                value = new_pattern['total_damage'][1].get(up_key, 0)
                                value = value + new_pattern['total_damage'][0] * num_up
                                if value > 0:
                                    new_pattern['total_damage'][1][up_key] = value
                        elif up_key in new_pattern:
                            if up_key is not 'total_damage':
                                if type_up is UP_TYPE.get('PERCENTAGE_INCREASE'):
                                    new_pattern[up_key] = new_pattern[up_key] * (1 + num_up)
                                elif type_up is UP_TYPE.get('PERCENTAGE_REDUCE'):
                                    new_pattern[up_key] = new_pattern[up_key] * (1 - num_up)
                    # 4.计算基础提升
                    if 'total_damage' in new_pattern_up_dict:
                        num_up, type_up = new_pattern_up_dict.get('total_damage')
                        total_template = copy.deepcopy(new_pattern['total_damage'][1])
                        if type_up is UP_TYPE.get('PERCENTAGE_INCREASE'):
                            for up_key in total_template.keys():
                                value = new_pattern['total_damage'][1].get(up_key, 0)
                                value = value + new_pattern['total_damage'][0] * num_up
                                if value > 0:
                                    new_pattern['total_damage'][1][up_key] = value
                                else:
                                    del new_pattern['total_damage'][1][up_key]

                        elif type_up is UP_TYPE.get('PERCENTAGE_REDUCE'):
                            for up_key in total_template.keys():
                                value = new_pattern['total_damage'][1].get(up_key, 0)
                                value = value - new_pattern['total_damage'][0] * num_up
                                if value > 0:
                                    new_pattern['total_damage'][1][up_key] = value
                                else:
                                    del new_pattern['total_damage'][1][up_key]

                    return_up['pattern'][p_key] = new_pattern

                return restful.ok(data={
                    'methond': 'up',
                    'up': return_up
                })

            return restful.parameters_error(message='请传递正确的请求类型参数！')

        return restful.parameters_error(message='请传递正确的请求类型参数！')


@require_POST
def filter_mods(request, weapon_name):
    w_name = re.sub(r'_', r' ', weapon_name.strip())
    weapon = Weapon.objects.filter(name__iexact=w_name).first()
    if re.search('(?i)Rifle', weapon.type):
        types = ['Rifle', weapon.slot]
    elif re.search('(?i)Shotgun', weapon.type):
        types = ['Shotgun', weapon.slot]
    elif re.search('(?i)Bow', weapon.type):
        types = ['Rifle', weapon.slot]
    else:
        types = []
    mods = QueryMods.filter_mods(types)
    return restful.ok(data=mods)


@require_POST
def share_modboxs(request, weapon_name):
    weapon = request.POST.get('weapon', None)
    if weapon:
        weapon = json.loads(weapon)
    modboxs = request.POST.get('modboxs', None)
    if modboxs:
        modboxs = json.loads(modboxs)

    weapon_id = weapon.get('id', None)
    weapon = Weapon.objects.get(id=weapon_id)

    try:
        ModBox.objects.create(
            modboxs=modboxs,
            wfuser=request.user,
            weapon=weapon,
            type='Weapon'
        )
        return restful.ok(data=modboxs)
    except:
        return restful.parameters_error('参数传递错误！')


@require_POST
def filter_hotmodboxs(request, weapon_name):
    try:
        count = int(HOTMODBOXS_PAGE_COUNT)
        page = int(request.GET.get('page', 1)) if int(request.GET.get('page', 1)) > 0 else 1

        start = (page - 1) * count
        end = start + count

        name = re.sub(r'_', r' ', weapon_name.strip())

        modboxs = QueryHotModBoxs.filter_hot_modboxs_list(
            'Weapon',
            name,
            slice={
                'start': start,
                'end': end
            }
        )
        if modboxs:
            return restful.ok(data=modboxs)
        else:
            return restful.parameters_error('已展示所有配卡！')
    except:
        return restful.parameters_error(message='page参数传递错误！')


@require_POST
def search_tag(request):
    try:
        ws = Weapon.objects.all()
        weapons: list = []
        en_to_zh = EnToZh()
        for weapon in ws:
            zh_name, en = en_to_zh.query_zh(weapon.name)
            url = re.sub(r' ', r'_', weapon.name)
            w_dict: dict = {
                'name': zh_name,
                'url': f'/weapons/{url}',
                'type': '武器'
            }
            weapons.append(w_dict)

        return restful.ok(data=weapons)
    except:
        return restful.server_error('查询失败，请稍后再试。')


def get_up_property(name: str, num: str) -> (str, float, str):
    """计算MOD属性对武器的改变（非视图函数）"""

    name_return: str = PROPERTY_TYPE.get(name, None)
    if re.search(r'%', num):
        re_str = re.search(r'[0-9.]+', num).group()
        num_return = float(re_str) / 100
        if re.search(r'\+', num):
            type_return = UP_TYPE.get('PERCENTAGE_INCREASE')
        elif re.search(r'-', num):
            type_return = UP_TYPE.get('PERCENTAGE_REDUCE')
        else:
            type_return = None
    else:
        type_return = None

    return (name_return, num_return, type_return)


def combined_element(element_list: list) -> str:
    for combined, combined_list in COMBINED_ELEMENT.items():
        if all_combined(element_list, combined_list):
            return combined
    return None


def all_combined(element_list: list, combined_list: list) -> bool:
    for element in element_list:
        if element not in combined_list:
            return False
    return True


PROPERTY_TYPE = {
    '射速': 'fire_rate',
    '弹夹容量': 'magazine_size',
    '弹药上限': 'max_ammo',
    '弹药最大值': 'max_ammo',
    '装填时间': 'reload_time',
    '装填速度': 'reload_time',
    '噪音降低': 'noise_level',
    '暴击几率': 'crit_chance',
    '暴击倍率': 'crit_multiplier',
    '触发几率': 'status_chance',
    '异常触发几率': 'status_chance',
    '基础伤害': 'total_damage',
    '伤害': 'total_damage',
    '多重射击': 'multishot',
    '冲击伤害': 'impact',
    '穿刺伤害': 'puncture',
    '切割伤害': 'slash',
    '冰冻伤害': 'cold',
    '火焰伤害': 'heat',
    '电击伤害': 'electricity',
    '毒素伤害': 'toxin',
    '病毒伤害': 'viral',
    '爆炸伤害': 'blast',
    '腐蚀伤害': 'corrosive',
    '毒气伤害': 'gas',
    '磁力伤害': 'magnetic',
    '辐射伤害': 'radiation',
}

UP_TYPE = {
    'PERCENTAGE_INCREASE': '百分比增加',
    'PERCENTAGE_REDUCE': '百分比减少',
}

BASE_PROPERTY = ['fire_rate', 'magazine_size', 'max_ammo']
PATTERN_PROPERTY = ['crit_chance', 'crit_multiplier', 'status_chance']
PHYSICAL_PROPERTY = ['impact', 'puncture', 'slash']
ELEMENT_PROPERTY = ['cold', 'heat', 'electricity', 'toxin']
COMBINED_PROPERTY = ['viral', 'blast', 'corrosive', 'gas', 'magnetic', 'radiation']
COMBINED_ELEMENT = {
    'viral': ['cold', 'toxin'],
    'blast': ['heat', 'cold'],
    'corrosive': ['toxin', 'electricity'],
    'gas': ['heat', 'toxin'],
    'magnetic': ['cold', 'electricity'],
    'radiation': ['heat', 'electricity'],
}

HOTMODBOXS_PAGE_COUNT = 5
