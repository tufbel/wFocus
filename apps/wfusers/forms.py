# -*- encoding: utf-8 -*-
"""
@File    : forms.py
@Date    : 2019/11/2
@Author  : Regulus
@Contact : yusheng831143@gmail.com
@Desc    : 表单验证。
"""
from pprint import pprint

from django import forms
from django.core.cache import cache

from apps.wfusers.models import WfUser
from utils.forms import FormMixin


class SigninForm(forms.Form, FormMixin):
    """登录表单验证"""
    email = forms.EmailField()
    password = forms.CharField(max_length=16, min_length=6)
    remember = forms.BooleanField(required=False)


class SignupForm(forms.Form, FormMixin):
    """注册表单验证"""
    username = forms.CharField(min_length=2, max_length=28, error_messages={
        'required': '用户名必须输入',
        'min_length': '用户名不能少于两位',
        'max_length': '用户名最大不能超过28位'
    })
    email = forms.EmailField(error_messages={
        'required': '邮箱必须输入'
    })
    password = forms.CharField(max_length=16, min_length=6, error_messages={
        'required': '密码必须输入',
        'min_length': '密码不能少于6位',
        'max_length': '密码不能超过16位'
    })
    password_again = forms.CharField(max_length=16, min_length=6, error_messages={
        'required': '重复确认密码不能为空',
        'min_length': '密码不能少于6位',
        'max_length': '密码不能超过16位'
    })
    email_captcha = forms.CharField(max_length=4, min_length=4, error_messages={
        'required': '邮箱验证码不可为空',
        'min_length': '邮箱验证码只能输入4位',
        'max_length': '邮箱验证码只能输入4位'
    })
    img_captcha = forms.CharField(max_length=4, min_length=4, error_messages={
        'required': '图片验证码不可为空',
        'min_length': '图片验证码只能输入4位',
        'max_length': '图片验证码只能输入4位'
    })

    def clean(self):
        clean_data = super(SignupForm, self).clean()

        password = clean_data.get('password')
        password_again = clean_data.get('password_again')
        if password != password_again:
            raise forms.ValidationError('两次输入的密码不一致！')

        email = clean_data.get('email')
        exists = WfUser.objects.filter(email=email).exists()
        if exists:
            raise forms.ValidationError('邮箱已被注册！')

        email_captcha = clean_data.get('email_captcha')
        cache_email_captcha = cache.get(email, None)
        if cache_email_captcha is None:
            raise forms.ValidationError('请先发送邮箱验证码！')
        else:
            if email_captcha.lower() != cache_email_captcha.lower():
                raise forms.ValidationError('邮箱验证码错误！')

        img_captcha = clean_data.get('img_captcha')
        if img_captcha is None:
            raise forms.ValidationError('图形验证码不可为空！')
