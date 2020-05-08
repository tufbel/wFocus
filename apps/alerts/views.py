import datetime
import re
from pprint import pprint

from django.shortcuts import render, redirect
from django.urls import reverse
from django.views.decorators.http import require_POST, require_GET

from apps.crawlers.views import WfaCrawler
from apps.translation.views import EnToZh
from utils import restful


@require_GET
def index(request):
    return redirect(reverse('app_index:alerts'))


@require_POST
def get_data(request, data_name):
    crawlers = WfaCrawler()
    try:
        data = crawlers.run_get(data_name)
        if re.match(r'sortie', data_name, flags=re.IGNORECASE):
            data = sortie_translation(data)
        elif re.match(r'invasion', data_name, flags=re.IGNORECASE):
            data = invasion_translaton(data)
        elif re.match(r'fissure', data_name, flags=re.IGNORECASE):
            data = fissure_translation(data)

        return restful.ok(data=data)
    except:
        return restful.server_error('数据抓取失败！')


def sortie_translation(data):
    """突击信息翻译（非视图函数）"""
    en_to_zh = EnToZh()
    data['boss'] = en_to_zh.query_zh(data['boss'])
    data['faction'] = en_to_zh.faction_translation(data['faction'])
    new_variants = []
    for item in data['variants']:
        new_item = {
            'missionType': en_to_zh.missiontype_translation(item['missionType']),
            'modifier': en_to_zh.mission_limiters_translation(item['modifier']),
            'node': en_to_zh.node_translation(item['node'])
        }
        new_variants.append(new_item)

    data['variants'] = new_variants
    return data


def invasion_translaton(data):
    """入侵任务信息翻译,非视图函数"""
    en_to_zh = EnToZh()
    return_list = []
    for item in data:
        if 0 < item.get('completion', 0) < 100:
            new_item = {
                'completion': round(item['completion']),
                'node': en_to_zh.node_translation(item['node']),
                'defender': {
                    'reward': en_to_zh.reward_transition(item['defenderReward']['itemString']),
                    'faction': item['defendingFaction']
                },
                'vsInfestation': item['vsInfestation'],
            }
            if not item['vsInfestation']:
                new_item['attacker'] = {
                    'reward': en_to_zh.reward_transition(item['attackerReward']['itemString']),
                    'faction': item['attackingFaction']
                }
            else:
                new_item['attacker'] = {
                    'reward': '无奖励',
                    'faction': 'Infested'
                }
            return_list.append(new_item)

    return return_list


def fissure_translation(data):
    en_to_zh = EnToZh()

    for item in data:
        item['missionType'] = en_to_zh.missiontype_translation(item['missionType'])
        item['node'] = en_to_zh.node_translation(item['node'])
        if item['tierNum'] == 1:
            item['tier'] = '古纪'
        elif item['tierNum'] == 2:
            item['tier'] = '前纪'
        elif item['tierNum'] == 3:
            item['tier'] = '中纪'
        elif item['tierNum'] == 4:
            item['tier'] = '后纪'
    return data
