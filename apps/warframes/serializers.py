# -*- encoding: utf-8 -*-
"""
@File    : serializers
@Date    : 2019/11/16
@Author  : Regulus
@Contact : yusheng831143@gmail.com
@Desc    : Warframes模块Model的序列化处理。
"""
from django.forms import URLField
from rest_framework import serializers

from apps.warframes.models import Warframe


class WarframesSerializer(serializers.HyperlinkedModelSerializer):
    class Meta:
        """指定model与需要序列化的字段"""
        model = Warframe
        fields = [
            'id',
            'name',
            'health',
            'shield',
            'armor',
            'power',
            'sprint_speed',
            'power_strength',
            'power_duration',
            'power_range',
            'power_efficiency',
            'img'
        ]
