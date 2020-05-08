import re
from pprint import pprint
from typing import List, Any

from apps.mods.models import Mod, ModBox
from apps.mods.serializers import ModsSerializer, WarframeModBoxsSerializer, WeaponModBoxsSerializer


class QueryMods(object):
    """查询符合条件的MOD信息"""

    @staticmethod
    def filter_mods(types: List[str], *args: Any, **kwargs: Any) -> list:
        mods = Mod.objects.filter(type__in=types)
        # 处理MOD数据
        for mod in mods:
            multiple = mod.fusion_limit + 1
            for (key, value) in mod.property.items():
                re_str = re.search(r'[0-9.]+', value).group()
                num = float(re_str) * multiple
                new_str = f'{round(num) if num.is_integer() else round(num, 1)}'
                mod.property[key] = re.sub(re_str, new_str, value)

        mods_serializer = ModsSerializer(mods, many=True)
        return mods_serializer.data


class QueryHotModBoxs(object):
    """查询符合条件的热门配卡信息"""

    @staticmethod
    def filter_hot_modboxs_list(type: str, name: str, *args: Any, **kwargs: Any) -> list:
        """查询符合条件的热门配卡信息"""
        slice = kwargs.get('slice', {
            'start': 0,
            'end': 0,
        })

        if type == 'Warframe':
            modboxs = ModBox.objects.filter(warframe_id=name, type=type)[slice["start"]:slice["end"]]
            modboxs_serializer = WarframeModBoxsSerializer(modboxs, many=True)
            return modboxs_serializer.data
        elif type == 'Weapon':
            modboxs = ModBox.objects.filter(weapon_id=name, type=type)[slice["start"]:slice["end"]]
            modboxs_serializer = WeaponModBoxsSerializer(modboxs, many=True)
            return modboxs_serializer.data
        else:
            return []
