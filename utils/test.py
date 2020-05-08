# -*- encoding: utf-8 -*-
"""
@File    : test.py
@Date    : 2019/11/9
@Author  : Regulus
@Contact : yusheng831143@gmail.com
@Desc    : 字典与Json转换测试。
"""

import json
from apps.warframes.models import Warframe

j = {
    'name': "Django",
    'passwords': "123456"
}
print(type(json))
w = Warframe(name='mesa')
print(w)
