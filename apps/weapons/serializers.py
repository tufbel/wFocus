# -*- encoding: utf-8 -*-
"""
@File    : serializers
@Date    : 2019/11/29
@Author  : Regulus
@Contact : yusheng831143@gmail.com
@Desc    : Weapon模块相关Model序列化。
"""
from rest_framework import serializers

from apps.weapons.models import Weapon


class WeaponsSerializer(serializers.HyperlinkedModelSerializer):
    class Meta:
        """指定model与需要序列化的字段"""
        model = Weapon
        fields = [
            'id',
            'name',
            'family',
            'type',
            'noise_level',
            'fire_rate',
            'accuracy',
            'magazine_size',
            'max_ammo',
            'reload_time',
            'disposition',
            'trigger_type',
            'pattern'
        ]



