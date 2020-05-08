# -*- encoding: utf-8 -*-
"""
@File    : urls
@Date    : 2019/11/15
@Author  : Regulus
@Contact : yusheng831143@gmail.com
@Desc    : 所有首页相关url映射。
"""

from django.urls import path

from apps.index import views

app_name = 'app_index'

urlpatterns = [
    path('', views.index, name='index'),
    path('home', views.home, name='home'),
    path('alerts', views.alerts, name='alerts'),
    path('warframes', views.warframes, name='warframes'),
    path('weapons', views.weapons, name='weapons'),
]


