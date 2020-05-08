# -*- encoding: utf-8 -*-
"""
@File    : middleware
@Date    : 2019/11/23
@Author  : Regulus
@Contact : yusheng831143@gmail.com
@Desc    : 。
"""

import json
from pprint import pprint

from apps.wfusers.models import WfUserGame


def request_permissions_middleware(get_response):
    """判断是否有登录用户，是否以注册游戏id，并提供相关权限"""

    def middleware(request):
        response = get_response(request)
        if request.user.is_authenticated:
            wfuser = request.user
            wg = WfUserGame.objects.filter(wfuser_id=wfuser.uid).first()
            if wg and wg.game_status == WfUserGame.HAVE_GAMENAME:
                str = f'is_user=true&is_game=true&name={wfuser.username}'
                response.set_cookie('wfper', str)
            else:
                str = 'is_user=true&is_game=false'
                response.set_cookie('wfper', str)
        else:
            str = 'is_user=false&is_game=false'
            response.set_cookie('wfper', str)
        return response

    return middleware
