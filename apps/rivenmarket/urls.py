# -*- encoding: utf-8 -*-
"""
@File    : urls.py
@Date    : 2019/11/11
@Author  : Semon
@Contact : 331526244@qq.com
@Desc    : 。
"""

from django.urls import path
from . import views

app_name = 'rivenmarket'

urlpatterns = [
    path('', views.index, name='index'),
    path('search/', views.search_riven, name='search'),
    path('newList/', views.riven_new_list, name='newList'),
    path('riven_collection/', views.riven_collection, name='riven_collection'),
    path('not_riven_collection/', views.not_riven_collection, name='not_riven_collection'),
    path('query_msg/', views.query_msg, name='query_msg'),
    path('write_msg/', views.write_msg, name='write_msg'),
    path('write_self_msg/', views.write_self_msg, name='write_self_msg'),
]