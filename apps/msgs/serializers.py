# -*- encoding: utf-8 -*-
"""
@File    : serializers.py
@Date    : 2019/12/20
@Author  : Semon
@Contact : 331526244@qq.com
@Desc    : 。
"""

from rest_framework import serializers
from apps.msgs.models import RivenMsg
from apps.rivenmygoods.serializers import MsgRivenSerializer
from apps.wfusers.serializers import WfUsersInHotModBoxsSerializer


class ChildrenMsgSerializer(serializers.ModelSerializer):
    riven = MsgRivenSerializer()
    writer = WfUsersInHotModBoxsSerializer()

    class Meta:
        model = RivenMsg
        fields = [
            'id',
            'view_state',
            'content',
            'riven',
            'writer',
            'comment_time',
        ]


class ParentMsgSerializer(serializers.ModelSerializer):
    riven = MsgRivenSerializer()
    writer = WfUsersInHotModBoxsSerializer()
    children = ChildrenMsgSerializer(many=True)
    children_count = serializers.IntegerField()

    class Meta:
        model = RivenMsg
        fields = [
            'id',
            'view_state',
            'content',
            'riven',
            'writer',
            'comment_time',
            'children_count',
            'children'
        ]


class AllMsgSerializer(serializers.ModelSerializer):
    riven = MsgRivenSerializer()
    writer = WfUsersInHotModBoxsSerializer()
    children = ChildrenMsgSerializer(many=True)

    class Meta:
        model = RivenMsg
        fields = [
            'id',
            'view_state',
            'content',
            'riven',
            'writer',
            'comment_time',
            'children'
        ]
