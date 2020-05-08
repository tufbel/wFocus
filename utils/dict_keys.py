# -*- encoding: utf-8 -*-
"""
@File    : dict_keys
@Date    : 2019/12/1
@Author  : Regulus
@Contact : yusheng831143@gmail.com
@Desc    : 字典key相关操作。
"""


def find_key(key: str, up: any):
    """根据key提取Value"""
    if dict == type(up):
        if key in up:
            return up[key]
        else:
            for dict_key, dict_value in up.items():
                if dict == type(dict_value) or list == type(dict_value):
                    result = find_key(key, dict_value)
                    if result:
                        return result
            return None
    elif list == type(up):
        for dict_value in up:
            if dict == type(dict_value) or list == type(dict_value):
                result = find_key(key, dict_value)
                if result:
                    return result
        return None
    else:
        return None


def judge_key(key: str, up: any):
    """判断key是否存在"""
    if dict == type(up):
        if key in up:
            return True
        else:
            for dict_key, dict_value in up.items():
                if dict == type(dict_value) or list == type(dict_value):
                    result = judge_key(key, dict_value)
                    if result:
                        return result
            return False
    elif list == type(up):
        for dict_value in up:
            if dict == type(dict_value) or list == type(dict_value):
                result = judge_key(key, dict_value)
                if result:
                    return result
        return False
    else:
        return False


def get_keys(keys: list, up: any, filter: list = None):
    """提取多级字典的key"""
    if dict == type(up):
        for key, value in up.items():
            if filter:
                if key in filter:
                    keys.append(key)
            else:
                keys.append(key)

            if dict == type(value) or list == type(value):
                get_keys(keys, value, filter)

    elif list == type(up):
        for value in up:
            if dict == type(value) or list == type(value):
                get_keys(keys, value, filter)
