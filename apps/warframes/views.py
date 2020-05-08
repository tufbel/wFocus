import json
import re
import time
from ast import literal_eval
from pprint import pprint

from django.shortcuts import render, redirect
from django.urls import reverse
from django.views import View
from django.views.decorators.http import require_POST

from apps.mods.models import ModBox
from apps.mods.views import QueryMods, QueryHotModBoxs
from apps.warframes.models import Warframe
from apps.warframes.serializers import WarframesSerializer
from utils import restful


def index(request):
    return redirect(reverse('app_index:warframes'))


class WarframeInfo(View):
    """处理战术模拟界面战甲信息的获取请求"""

    def get(self, request, warframe_name):
        return render(request, 'warframes/wf_warframe.html')

    def post(self, request, warframe_name):
        """获取战甲信息"""
        if request.POST.get('methond', None) == 'original':
            w_name = re.sub(r'(Prime|prime)', r' Prime', warframe_name)
            ws_query = Warframe.objects.filter(name=w_name.strip())
            warframe = ws_query[0]
            warframe.health *= 3
            warframe.shield *= 3
            warframe.power = round(warframe.power * 1.5)
            warframe.sprint_speed = round(warframe.sprint_speed, 2)
            warframe.power_strength = round(warframe.power_strength, 2)
            warframe.power_duration = round(warframe.power_duration, 2)
            warframe.power_range = round(warframe.power_range, 2)
            warframe.power_efficiency = round(warframe.power_efficiency, 2)
            #  返回原始信息
            serializer = WarframesSerializer(warframe)
            original = serializer.data
            return restful.ok(data={
                'methond': 'original',
                'original': original
            })
        elif request.POST.get('methond', None) == 'up':
            # 计算增强信息并返回
            # 1.获取数据
            warframe = request.POST.get('warframe', None)
            if warframe:
                warframe = json.loads(warframe)
            mods = request.POST.get('mods', None)
            if mods:
                mods = json.loads(mods)
            #  2.选取需要的属性
            up = {
                'health': round(warframe.get('health')),
                'shield': round(warframe.get('shield')),
                'armor': round(warframe.get('armor')),
                'power': round(warframe.get('power')),
                'sprint_speed': round(warframe.get('sprint_speed'), 2),
                'power_strength': round(warframe.get('power_strength'), 2),
                'power_duration': round(warframe.get('power_duration'), 2),
                'power_range': round(warframe.get('power_range'), 2),
                'power_efficiency': round(warframe.get('power_efficiency'), 2),
            }

            # 3.遍历数据进行计算
            for key, mod in mods.items():
                if mod and mod.get('property', None) and warframe:
                    for key, value in mod.get('property', None).items():
                        (attr_up, num_up, type_up) = get_up_property(key, value)
                        if attr_up and type_up:
                            if type_up == UP_TYPE.get('PERCENTAGE_INCREASE'):
                                up[attr_up] += warframe[attr_up] * num_up
                            elif type_up == UP_TYPE.get('PERCENTAGE_REDUCE'):
                                up[attr_up] -= warframe[attr_up] * num_up
                            elif type_up == UP_TYPE.get('NUMERICAL_INCREASE'):
                                up[attr_up] = up[attr_up] + num_up if up[attr_up] + num_up >= 0 else 0
                            elif type_up == UP_TYPE.get('NUMERICAL_REDUCE'):
                                up[attr_up] = up[attr_up] - num_up if up[attr_up] - num_up >= 0 else 0
                            else:
                                pass

            response_up = {
                'health': round(up.get('health')),
                'shield': round(up.get('shield')),
                'armor': round(up.get('armor')),
                'power': round(up.get('power')),
                'sprint_speed': round(up.get('sprint_speed'), 2),
                'power_strength': round(up.get('power_strength'), 2),
                'power_duration': round(up.get('power_duration'), 2),
                'power_range': round(up.get('power_range'), 2),
                'power_efficiency': round(up.get('power_efficiency'), 2),
            }

            return restful.ok(data={
                'methond': 'up',
                'up': response_up
            })

        return restful.parameters_error(message='请传递正确的请求类型参数！')


@require_POST
def filter_mods(request, warframe_name):
    types = ['Warframe', 'Aura']
    mods = QueryMods.filter_mods(types)
    return restful.ok(data=mods)


@require_POST
def share_modboxs(request, warframe_name):
    warframe = request.POST.get('warframe', None)
    if warframe:
        warframe = json.loads(warframe)
    modboxs = request.POST.get('modboxs', None)
    if modboxs:
        modboxs = json.loads(modboxs)

    try:
        ModBox.objects.create(
            modboxs=modboxs,
            wfuser=request.user,
            warframe_id=warframe.get('name', None),
            type='Warframe'
        )
        return restful.ok(data=modboxs)
    except:
        return restful.parameters_error('参数传递错误！')


@require_POST
def filter_hotmodboxs(request, warframe_name):
    try:
        count = int(HOTMODBOXS_PAGE_COUNT)
        page = int(request.GET.get('page', 1)) if int(request.GET.get('page', 1)) > 0 else 1

        start = (page - 1) * count
        end = start + count

        name = re.sub(r'(Prime|prime)', r' Prime', warframe_name.strip())

        modboxs = QueryHotModBoxs.filter_hot_modboxs_list(
            'Warframe',
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



def search_tag(request):
    try:
        ws = Warframe.objects.all()
        warframes: list = []
        for warfarme in ws:
            url = re.sub(r' ', r'', warfarme.name).strip()
            w_dict: dict = {
                'name': warfarme.name,
                'url': f'/warframes/{url}',
                'type': '战甲'
            }
            warframes.append(w_dict)

        return restful.ok(data=warframes)
    except:
        return restful.server_error('查询失败，请稍后再试。')


def get_up_property(name: str, num: str) -> (str, float, str):
    """计算MOD属性对战甲的能力的改变（非视图函数）"""
    name_return: str = MOD_TO_WARFRAME.get(name, None)
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
        re_str = re.search(r'[0-9.]+', num).group()
        num_return = float(re_str)
        if re.search(r'\+', num):
            type_return = UP_TYPE.get('NUMERICAL_INCREASE')
        elif re.search(r'-', num):
            type_return = UP_TYPE.get('NUMERICAL_REDUCE')
        else:
            type_return = None

    return (name_return, num_return, type_return)


MOD_TO_WARFRAME = {
    '生命值': 'health',
    '护盾容量': 'shield',
    '护甲': 'armor',
    '能量': 'power',
    '冲刺速度': 'sprint_speed',
    '技能强度': 'power_strength',
    '技能持续时间': 'power_duration',
    '技能范围': 'power_range',
    '技能效率': 'power_efficiency',
}

UP_TYPE = {
    'PERCENTAGE_INCREASE': '百分比增加',
    'PERCENTAGE_REDUCE': '百分比减少',
    'NUMERICAL_INCREASE': '数值增加',
    'NUMERICAL_REDUCE': '数值减少',
}

HOTMODBOXS_PAGE_COUNT = 5
