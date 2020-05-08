# -*- encoding: utf-8 -*-
"""
@File    : email_poll
@Date    : 2019/12/11
@Author  : Regulus
@Contact : yusheng831143@gmail.com
@Desc    : 。
"""
import smtplib
from email.mime.text import MIMEText
from queue import Queue

import redis


class EmailPool(object):
    """邮件连接池"""
    MAX_ACTIVE = 10
    MAX_WAIT = 3

    SENDER = '962889645@qq.com'
    PASSWORD = 'ahrykbqnhsprbfef'
    SUBJECT = 'wFocus邮件'

    __email_conns = Queue(MAX_ACTIVE)

    def __init__(cls):
        pass

    @classmethod
    def __create_conn(cls):
        """创建连接 """
        smtp = smtplib.SMTP_SSL("smtp.qq.com", 465)
        smtp.login(cls.SENDER, cls.PASSWORD)
        return smtp

    @classmethod
    def get(cls, timeout=None):
        """从连接池中取出一个连接"""
        if timeout is None:
            timeout = cls.MAX_WAIT

        if cls.__email_conns.empty():  # 如果容器是空的，直接创建一个连接
            conn = cls.__create_conn()
        else:
            conn = cls.__email_conns.get(timeout=timeout)
            cls.__email_conns.task_done()

        return conn

    @classmethod
    def free(cls, conn):
        """将连接放回连接池"""
        if cls.__email_conns.full():
            conn.close()
            return
        cls.__email_conns.put_nowait(conn)

    @classmethod
    def send_email(cls, receiver, content, subject=None, timeout=None):
        try:
            message = MIMEText(content, "plain", "utf-8")
            message['Subject'] = cls.SUBJECT if subject is None else subject
            message['From'] = cls.SENDER
            message['To'] = receiver  # 收件人

            timeout = cls.MAX_WAIT if timeout is None else timeout
            email_conn = cls.get(timeout)
            email_conn.sendmail(cls.SENDER, receiver, message.as_string())
            cls.free(email_conn)

            return True
        except:
            return False


class RedisPool(object):
    """redis连接池"""
    HOST = '127.0.0.1'
    PORT = 6379

    __redis_connection = None

    @classmethod
    def get(cls, host=None, port=None, password=None):
        if host is None and port is None:
            if cls.__redis_connection is None:
                cls.__redis_connection = redis.ConnectionPool(host=cls.HOST, port=cls.PORT)
            return redis.Redis(connection_pool=cls.__redis_connection, password='lumoon')
        else:
            host = cls.HOST if host is None else host
            port = cls.PORT if port is None else port

            pool = redis.ConnectionPool(host=cls.HOST, port=cls.PORT)
            return redis.Redis(connection_pool=pool, password=password)
