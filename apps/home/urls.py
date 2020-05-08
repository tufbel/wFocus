# -*- encoding: utf-8 -*-
"""
@File    : urls.py
@Date    : 2019/11/1
@Author  : Regulus
@Contact : yusheng831143@gmail.com
@Desc    : home模块相关的url映射配置。
"""

from django.urls import path

from apps.home import views

app_name = 'app_home'

urlpatterns = [
    path('', views.index, name='index'),
]
