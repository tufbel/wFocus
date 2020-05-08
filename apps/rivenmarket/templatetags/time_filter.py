# -*- encoding: utf-8 -*-
"""
@File    : time_filter.py
@Date    : 2019/11/23
@Author  : Semon
@Contact : 331526244@qq.com
@Desc    : 。
"""

from django import template
from datetime import datetime

register = template.Library()


@register.filter
def time_since(value):
    """
    time距离现在的时间间隔
    1.如果时间间隔小于1分钟,那么就显示"刚刚"
    2.如果时间间隔大于1分钟小于1小时,那么就显示"**分钟前"
    3.如果时间间隔大于1小时小于24小时,那么就显示"**小时前"
    4.如果时间间隔大于24小时小于30天以内,那么就显示"**天前"
    5.否则就显示具体时间 2019/11/20 12:15
    """

    # 判断value类型是否是datetime类型
    if not isinstance(value, datetime):
        return value
    now = datetime.now()
    # 得到timedelta数据类型,用timedelta.total_seconds获取总秒数
    timestamp =(now-value).total_seconds()
    if timestamp < 60:
        return '刚刚'
    elif timestamp >= 60 and timestamp < 60*60:
        minutes = int(timestamp/60)
        return '%s分钟前' % minutes
    elif timestamp >= 60*60 and timestamp < 60*60*24:
        hours = int(timestamp/60*60)
        return '%s小时前' % hours
    elif timestamp >= 60*60*24 and timestamp < 60*60*24*30:
        days = int(timestamp/60*60*24)
        return '%s天前' % days
    else:
        return value.strftime('%Y/%m/%d %H:%M')

