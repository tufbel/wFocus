# -*- encoding: utf-8 -*-
"""
@File    : paths.py
@Date    : 2019/10/12
@Author  : Regulus
@Contact : yusheng831143@gmail.com
@Desc    : 包含项目在机器的绝对路径，可构造项目文件在及其中的绝对路径。
"""

import os
import re

# 项目基础路径
BASE_PATH = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


def get_path(idir=None, base=None):
    """获取输入路径在机器中的绝对路径。路径分隔符使用“/” """
    re_str = re.compile(r'^[a-zA-Z][a-zA-Z0-9._/]*')
    if idir is not None:
        if base is None:
            # 无base路径则使用idir与项目跟路径拼接
            if re.match(re_str, idir):
                return os.path.join(BASE_PATH, *(idir.split('/')))
            else:
                raise Exception('ValueError:请输入正确路径字符串,路径分隔符为“/”。', idir)
        else:
            # 拼接接触路径与相对路径
            if re.match(re_str, idir):
                return os.path.join(os.path.abspath(base), *(idir.split('/')))
            else:
                raise Exception('ValueError:请输入正确路径字符串,路径分隔符为“/”。', idir)
    else:
        # 返回基础路径
        if base:
            return os.path.abspath(base)
        else:
            return BASE_PATH


def get_now_path(file):
    if isinstance(file, str):
        try:
            return os.path.dirname(os.path.abspath(file))
        except:
            raise Exception('ValueError:请输入一个正确的文件路径。', file)
    else:
        raise Exception('ValueError:请输入一个正确的文件路径。', file)
