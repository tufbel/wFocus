# -*- encoding: utf-8 -*-
"""
@File    : urls.py
@Date    : 2019/11/14
@Author  : Regulus
@Contact : yusheng831143@gmail.com
@Desc    : 战术模拟界面相关url映射。
"""
from django.urls import path

from apps.warframes import views

app_name = 'app_warframes'

urlpatterns = [
    path('', views.index, name='index'),
    path('tag', views.search_tag, name='tag'),
    path('<warframe_name>', views.WarframeInfo.as_view(), name='info'),
    path('<warframe_name>/mods', views.filter_mods, name='filter_mods'),
    path('<warframe_name>/share', views.share_modboxs, name='share_modboxs'),
    path('<warframe_name>/hotmodboxs/', views.filter_hotmodboxs, name='filter_hotmodboxs'),
]
