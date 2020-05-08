# -*- encoding: utf-8 -*-
"""
@File    : serializers
@Date    : 2019/11/17
@Author  : Regulus
@Contact : yusheng831143@gmail.com
@Desc    : Mods模块相关的序列化处理。
"""
from rest_framework import serializers

from apps.mods.models import Mod, ModBox
from apps.wfusers.serializers import WfUsersInHotModBoxsSerializer


class ModsSerializer(serializers.HyperlinkedModelSerializer):
    """序列化Mod类"""

    class Meta:
        model = Mod
        fields = [
            'id',
            'name',
            'polarity',
            'rarity',
            'base_drain',
            'fusion_limit',
            'type',
            'property'
        ]


class WarframeModBoxsSerializer(serializers.HyperlinkedModelSerializer):
    """序列化热门配卡类"""
    wfuser = WfUsersInHotModBoxsSerializer()
    class Meta:
        model = ModBox
        fields = [
            'id',
            'type',
            'modboxs',
            'wfuser',
            'warframe',
            'share_time'
        ]

class WeaponModBoxsSerializer(serializers.HyperlinkedModelSerializer):
    """序列化热门配卡类"""
    wfuser = WfUsersInHotModBoxsSerializer()
    class Meta:
        model = ModBox
        fields = [
            'id',
            'type',
            'modboxs',
            'wfuser',
            'weapon',
            'share_time'
        ]
