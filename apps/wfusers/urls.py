# -*- encoding: utf-8 -*-
"""
@File    : urls.py
@Date    : 2019/11/1
@Author  : Regulus
@Contact : yusheng831143@gmail.com
@Desc    : wfuser模块相关url映射。
"""
from django.urls import path

from apps.wfusers import views

app_name = 'app_wfusers'

urlpatterns = [
    path('', views.index, name='index'),
    path('sign', views.sign, name='sign'),
    path('signup', views.SignupView.as_view(), name='signup'),
    path('signin', views.SigninView.as_view(), name='signin'),
    path('signout/', views.SignoutView.as_view(), name='signout'),
    path('imgcaptcha/', views.img_captcha, name='img_captcha'),
    path('emailcaptcha', views.email_captcha, name='email_captcha'),
    path('change_name', views.change_name, name='change_name'),

    path('personal', views.personal_detail, name='personal_detail'),
    path('upload_file/', views.upload_file, name='upload_file'),
]


