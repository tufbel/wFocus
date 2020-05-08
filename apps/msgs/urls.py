# -*- encoding: utf-8 -*-
"""
@File    : urls.py
@Date    : 2019/12/19
@Author  : Semon
@Contact : 331526244@qq.com
@Desc    : 。
"""


from django.urls import path
from . import views

app_name = 'msgs'

urlpatterns = [
    path('query_parent_msg/', views.query_parent_msg, name='query_parent_msg'),
    path('query_children_msg/', views.query_children_msg, name='query_children_msg'),
    path('query_new_children_msg/', views.query_new_children_msg, name='query_new_children_msg'),
    path('write_parent_msg/',views.write_parent_msg, name='write_parent_msg'),
    path('write_self_parent_msg/', views.write_self_parent_msg, name='write_self_psaent_msg'),
    path('add_self_children_msg/', views.add_self_children_msg, name='add_self_children_msg'),
]