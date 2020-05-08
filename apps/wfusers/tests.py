import smtplib
from email.header import Header
from email.mime.text import MIMEText

from django.core.cache import cache
from django.http import HttpResponse
from django.test import TestCase

# Create your tests here.
from apps.wfusers.models import WfUser


def create_test(request):
    try:
        wfuser = WfUser.objects.create_user(email='yusheng831143@163.com', username='coral', password='123456')
        print(wfuser)
    except:
        print("邮箱重复")

    return HttpResponse('ok')


def send_email():
    subject = "WF邮箱验证右键"  # 邮件标题
    sender = '962889645@qq.com'  # 发送方
    password = "ahrykbqnhsprbfef"
    CONTENT_TEMPLATE = "您收到的WF注册验证码为：{}，此验证码5分钟内有效。"
    recver = 'yusheng831143@163.com'  # 接收方

    message = MIMEText(content, "plain", "utf-8")
    message['Subject'] = subject  # 邮件标题
    message['To'] = recver  # 收件人
    message['From'] = sender  # 发件人

    try:
        smtp = smtplib.SMTP_SSL("smtp.qq.com", 465)
        print('实例化服务器成功')
        smtp.login(sender, password)
        print('登录验证成功')
        smtp.sendmail(sender, recver, message.as_string())  # as_string 对 message 的消息进行了封装
        print('发送成功')
    except smtplib.SMTPException:
        print('发送失败')
    finally:
        smtp.close()


def cache_test(request):
    cache.set('username', 'lumoon', 60)
    result = cache.get('username')
    print(result)
    return HttpResponse('ok')