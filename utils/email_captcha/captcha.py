# -*- encoding: utf-8 -*-
"""
@File    : captcha.py
@Date    : 2019/11/13
@Author  : Regulus
@Contact : yusheng831143@gmail.com
@Desc    : 发送邮箱验证码。
"""
import smtplib
import random
import string
import time
from email.header import Header
from email.mime.text import MIMEText
from utils.wf_pools import EmailPool


class Captcha(object):
    """发送邮箱验证码"""
    CAPTCHA_NUM = 4
    SOURCE = list(string.ascii_letters)
    for index in range(0, 10):
        SOURCE.append(str(index))

    SUBJECT = 'WF注册验证码'
    CONTENT_TEMPLATE = '您收到的WF注册验证码为：{}，此验证码5分钟内有效。'

    @classmethod
    def __get_text(cls):
        return ''.join(random.sample(cls.SOURCE, cls.CAPTCHA_NUM))

    @classmethod
    def gene_captcha(cls, receiver):
        text = ''
        try:
            text = cls.__get_text()
            content = cls.CONTENT_TEMPLATE.format(text)
            if EmailPool.send_email(receiver, content=content, subject=cls.SUBJECT):
                result = True
            else:
                result = False
        except:
            result = False

        return (text, result)
