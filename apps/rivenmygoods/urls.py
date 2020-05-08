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

app_name = 'rivenmygoods'

urlpatterns = [
    path('', views.index, name='index'),
    path('upload_file/', views.upload_file, name='upload_file'),
    path('pub_riven/', views.write_riven, name='pub_riven'),
    path('audit_riven/', views.audit_riven, name='audit_riven'),
    path('change_price/', views.change_price, name='change_price'),
    path('new_msg/', views.new_msg, name='new_msg'),
    path('not_sell_riven/', views.not_sell_riven, name='not_sell_riven'),
    path('not_audit_riven/', views.not_audit_riven, name='not_audit_riven'),

    path('rivencollection/', views.rivencollection, name='rivencollection'),
]