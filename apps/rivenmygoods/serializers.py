# -*- encoding: utf-8 -*-
"""
@File    : seriallizers.py
@Date    : 2019/11/15
@Author  : Semon
@Contact : 331526244@qq.com
@Desc    : 。
"""
from rest_framework import serializers

from apps.rivenmygoods.models import Riven
from apps.wfusers.serializers import WfUsersInHotModBoxsSerializer


class RivenSerializer(serializers.ModelSerializer):
    seller = WfUsersInHotModBoxsSerializer()

    class Meta:
        model = Riven
        fields = [
            'id',
            'riven_name',
            'properties',
            'price',
            'is_sell',
            'pub_time',
            'seller'
        ]


class MsgRivenSerializer(serializers.ModelSerializer):
    seller = WfUsersInHotModBoxsSerializer()

    class Meta:
        model = Riven
        fields = [
            'id',
            'seller'
        ]

