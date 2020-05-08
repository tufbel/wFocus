# -*- encoding: utf-8 -*-
"""
@File    : urls
@Date    : 2019/11/26
@Author  : Regulus
@Contact : yusheng831143@gmail.com
@Desc    : 武器配置功能相关url映射。
"""

from django.urls import path

from apps.weapons import views

app_name = 'app_weapons'

urlpatterns = [
    path('', views.index, name='index'),
    path('tag', views.search_tag, name='tag'),
    path('<weapon_name>', views.WeaponInfo.as_view(), name='info'),
    path('<weapon_name>/mods', views.filter_mods, name='filter_mods'),
    path('<weapon_name>/share', views.share_modboxs, name='share_modboxs'),
    path('<weapon_name>/hotmodboxs/', views.filter_hotmodboxs, name='filter_hotmodboxs'),
]

