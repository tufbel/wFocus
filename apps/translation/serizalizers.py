# -*- encoding: utf-8 -*-
"""
@File    : serizalizers
@Date    : 2019/11/27
@Author  : Regulus
@Contact : yusheng831143@gmail.com
@Desc    : 翻译模块数据序列化。
"""
from rest_framework import serializers

from apps.translation.models import Thesaurus


class ThesaurusSerializer(serializers.HyperlinkedModelSerializer):
    class Meta:
        model = Thesaurus
        fields = ['en_key', 'zh_value']



