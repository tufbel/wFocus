# -*- encoding: utf-8 -*-
"""
@File    : urls.py
@Date    : 2019/11/9
@Author  : Regulus
@Contact : yusheng831143@gmail.com
@Desc    : 。
"""

from django.urls import path

from apps.alerts import views

app_name = 'app_alerts'

urlpatterns = [
    path('', views.index, name='index'),
    path('data/<data_name>', views.get_data, name='get_data'),
]
