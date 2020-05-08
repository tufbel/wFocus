# -*- encoding: utf-8 -*-
"""
@File    : forms.py
@Date    : 2019/11/2
@Author  : Regulus
@Contact : yusheng831143@gmail.com
@Desc    : 表单验证组件。
"""
from pprint import pprint


class FormMixin(object):
    """表单验证信息组件"""

    def get_errors(self):
        """表单验证错误时抽取需要的错误信息"""
        new_errors = []
        if hasattr(self, 'errors'):
            # 提取错误信息
            errors = self.errors.get_json_data()
            # 自定义错误信息样式
            for key, message_dicts in errors.items():
                for message in message_dicts:
                    new_errors.append(message.get('message'))
        # 返回自定义的错误信息
        return new_errors
