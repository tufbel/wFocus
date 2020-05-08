# -*- encoding: utf-8 -*-
"""
@File    : serializers
@Date    : 2019/11/25
@Author  : Regulus
@Contact : yusheng831143@gmail.com
@Desc    : 用户信息序列化。
"""
from rest_framework import serializers

from apps.wfusers.models import WfUser


class WfUsersInHotModBoxsSerializer(serializers.HyperlinkedModelSerializer):
    """热门配卡界面展示的个人信息"""
    class Meta:
        model = WfUser
        fields = [
            'username',
            'email',
            'game_name'
        ]
