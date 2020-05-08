# -*- encoding: utf-8 -*-
"""
@File    : restful.py
@Date    : 2019/11/2
@Author  : Regulus
@Contact : yusheng831143@gmail.com
@Desc    : JsonResponse数据响应的工具类。
"""
from django.http import JsonResponse


class HttpCode(object):
    """
    响应状态码自定义
    此处非HTTP响应状态码,而是HTTP成功响应(200)后,本项目的响应信息提示的状态码
    可使用枚举类型完成,此处为了方便使用类定义
    """
    OK = 200  # 成功
    NO_CONTENT = 204  # 请求成功无内容

    PARAMETERS_ERROR = 400  # 参数错误
    AUTHORITY_ERROR = 401  # 权限错误
    METHOD_ERROR = 405  # 请求方式错误
    NOT_FOUND_ERROR = 404  # 请求资源未找到

    SERVER_ERROR = 500  # 服务器错误


def result(code, message=None, data=None, kwargs=None):
    """JsonResponse响应处理"""
    # 默认必须携带参数的构建
    json_dicts = {'code': code, 'message': message, 'data': data}

    # 自定义参数添加
    if kwargs and isinstance(kwargs, dict) and kwargs.keys():
        json_dicts.update(kwargs)

    return JsonResponse(json_dicts)


def ok(message=None, data=None):
    """请求无误JsonResponse响应"""
    return result(code=HttpCode.OK, message=message, data=data)


def no_content(message=None, data=None):
    """请求空内容sonResponse响应"""
    return result(code=HttpCode.NO_CONTENT, message=message, data=data)


def parameters_error(message=None, data=None):
    """参数错误JsonResponse响应"""
    return result(code=HttpCode.PARAMETERS_ERROR, message=message, data=data)


def authority_error(message=None, data=None):
    """权限错误JsonResponse响应"""
    return result(code=HttpCode.AUTHORITY_ERROR, message=message, data=data)


def method_error(message=None, data=None):
    """请求方式错误JsonResponse响应"""
    return result(code=HttpCode.METHOD_ERROR, message=message, data=data)


def server_error(message=None, data=None):
    """服务器错误JsonResponse响应"""
    return result(code=HttpCode.SERVER_ERROR, message=message, data=data)


def not_found_error(message=None, data=None):
    """请求资源未找到JsonResponse响应"""
    return result(code=HttpCode.NOT_FOUND_ERROR, message=message, data=data)
