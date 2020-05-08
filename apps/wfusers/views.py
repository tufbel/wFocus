import os
import re
import threading
from io import BytesIO
from pprint import pprint

from django.contrib.auth import authenticate, login, logout
from django.core.cache import cache
from django.http import HttpResponse, QueryDict, JsonResponse
from django.shortcuts import render, redirect
from django.urls import reverse
from django.views import View
from django.views.decorators.http import require_POST, require_GET, require_http_methods

from apps.cms.views import add_wfuser_gamename
from apps.wfusers.forms import SigninForm, SignupForm
from apps.wfusers.models import WfUser, WfUserGame
from utils import restful, paths
from utils.email_captcha.captcha import Captcha as EmailCaptcha
from utils.img_captcha.captcha import Captcha as ImgCaptcha


@require_GET
def sign(request):
    return render(request, 'wfusers/sign.html')


class SignupView(View):
    """处理用户注册的视图类"""

    def get(self, request):
        """接收get请求返回注册页面"""
        return redirect(reverse('app_wfusers:sign'))

    def post(self, request):
        """接受Post注册请求"""
        pprint(request.POST)
        form = SignupForm(request.POST)
        if form.is_valid():
            email = form.cleaned_data.get('email')
            password = form.cleaned_data.get('password')
            username = form.cleaned_data.get('username')
            img_captcha = form.cleaned_data.get('img_captcha')

            ip = request.META.get('REMOTE_ADDR')
            cache_img_captcha = cache.get(ip)

            if cache_img_captcha.lower() != img_captcha.lower():
                return restful.parameters_error('图形验证码不正确')
            else:
                try:
                    user = WfUser.objects.create_user(email=email, username=username, password=password)
                    login(request, user)
                    request.session.set_expiry(0)
                    http_next = request.GET.get('next', '/')
                    return restful.ok(data={
                        'next': http_next
                    })
                except:
                    return restful.authority_error('该邮箱已被注册')
        else:
            errors = form.get_errors()
            return restful.parameters_error(errors)


class SigninView(View):
    """处理用户登录的视图类"""

    def get(self, request):
        """接收get请求返回登录页面"""
        return redirect(reverse('app_wfusers:sign'))

    def post(self, request):
        """接收post登录请求"""
        form = SigninForm(request.POST)
        if form.is_valid():
            # 表单验证成功,提取数据
            email = form.cleaned_data.get('email')
            password = form.cleaned_data.get('password')
            remember = form.cleaned_data.get('remember')

            # 用户登录验证
            user = authenticate(request, username=email, password=password)
            if user:
                # 用户账号密码正确
                if user.is_active:
                    # 用户可登录
                    login(request, user)
                    if remember:
                        # 设置登录保存时间为默认两周
                        request.session.set_expiry(None)
                    else:
                        # 设置登录保存至浏览器关闭
                        request.session.set_expiry(0)
                    pprint(request.GET)
                    http_next = request.GET.get('next', '/')
                    print(http_next)
                    return restful.ok(data={
                        'next': http_next
                    })
                else:
                    return restful.authority_error('用户被冻结')
            else:
                return restful.parameters_error('账号或密码错误！')
        else:
            errors = form.get_errors()
            return restful.parameters_error(errors)


class SignoutView(View):
    """处理用户注销登录请求，只接受GET请求"""

    def get(self, request):
        logout(request)
        http_next = request.GET.get('next', '/')
        return redirect(http_next)

    def post(self, request):
        try:
            logout(request)
            return restful.ok(message='注销成功。')
        except:
            return restful.server_error('注销失败，请稍后再试。')


@require_GET
def img_captcha(request):
    captcha, image = ImgCaptcha.gene_captcha()
    ip = request.META.get('REMOTE_ADDR')
    cache.set(ip, captcha, 5 * 60)
    print('ip:{}\n图片验证码:{}'.format(ip, captcha))

    out = BytesIO()
    image.save(out, 'png')
    out.seek(0)

    response = HttpResponse(content_type='image/png')
    response.write(out.read())
    response['Content-length'] = out.tell()

    return response


@require_POST
def email_captcha(request):
    email = request.POST.get('email')
    print(email)
    if email:
        captcha, result = EmailCaptcha.gene_captcha(email)
        print('邮箱验证码：{}'.format(captcha))
        if result:
            cache.set(email, captcha, 5 * 60)
            return restful.ok('验证码发送成功，请注意查收邮件')
        else:
            return restful.server_error('服务器发生问题，验证码发送失败！')
    else:
        return restful.parameters_error('邮箱不存在！')


def index(request):
    return redirect(reverse('app_wfusers:signin'))


@require_POST
def change_name(request):
    user = request.user
    name_re = re.compile(r'^[a-zA-Z][_a-zA-Z0-9]{2,19}$')
    new_name = request.POST.get('username', None)
    if user.is_authenticated:
        try:
            if new_name and name_re.search(new_name):
                user.username = new_name
                print(user)
                user.save()
                return restful.ok()
            else:
                return restful.parameters_error('请传递正确的用户名。')
        except:
            return restful.parameters_error('请传递正确的用户名。')
    else:
        return restful.authority_error('请登录后再修改用户名。')


# 初始化个人信息界面
@require_http_methods(["GET", "POST"])
def personal_detail(request):
    if request.method == 'GET':
        if request.user.is_authenticated:
            return render(request, 'wfusers/personal.html')
        else:
            return redirect(reverse('app_wfusers:signin'))

    elif request.method == 'POST':
        wfuser = request.user
        if wfuser.is_authenticated:
            data = {
                'username': request.user.username,
                'email': request.user.email,
                'game_id': request.user.game_name,
            }
            return restful.ok(data=data)
        else:
            return restful.parameters_error(
                message='请登陆后再查看个人信息。'
            )


# 保存上传图片并识别
@require_POST
def upload_file(request):
    try:
        file = request.FILES.get('file')
        name = file.name
        name_re = re.compile('(.png|.jpg)$', flags=re.IGNORECASE)
        if name_re.search(name):
            wfuser = request.user
            user_game, judge = WfUserGame.objects.get_or_create(wfuser=wfuser)
            if judge:
                img_name = f'{wfuser.username}+{wfuser.uid}{name_re.search(name).group()}'

                if os.path.exists(paths.get_path(f'media/wfusers/{wfuser.uid}')) is False:
                    os.makedirs(paths.get_path(f'media/wfusers/{wfuser.uid}'))

                with open(paths.get_path(f'media/wfusers/{wfuser.uid}/{img_name}'), 'wb') as imgfp:
                    for chunk in file.chunks():
                        imgfp.write(chunk)

                user_game.first_img = f'/media/wfusers/{wfuser.uid}/{img_name}'
                user_game.game_status = WfUserGame.AUDIT_STATUS
                user_game.save()

                add_img_thread = threading.Thread(target=add_wfuser_gamename, args=(wfuser, user_game))
                add_img_thread.start()

                return restful.ok('后台以开始审核，请注意查看状态。')
            else:
                img_dict = user_game.other_imgs
                if img_dict:
                    num = len(img_dict) + 1
                    img_name = f'{wfuser.username}+{wfuser.uid}_{num}{name_re.search(name).group()}'

                    if os.path.exists(paths.get_path(f'media/wfusers/{wfuser.uid}')) is False:
                        os.makedirs(paths.get_path(f'media/wfusers/{wfuser.uid}'))

                    with open(paths.get_path(f'media/wfusers/{wfuser.uid}/{img_name}'), 'wb') as imgfp:
                        for chunk in file.chunks():
                            imgfp.write(chunk)
                    img_dict[f'{num}'] = f'/media/wfusers/{wfuser.uid}/{img_name}'
                    user_game.game_status = WfUserGame.MANUAL_STATUS
                    user_game.save()
                    wfuser.game_name = None
                    wfuser.save()

                    return restful.ok('后台已开始审核，请注意查看状态。')
                else:
                    img_name = f'{wfuser.username}+{wfuser.uid}_1{name_re.search(name).group()}'

                    if os.path.exists(paths.get_path(f'media/wfusers/{wfuser.uid}')) is False:
                        os.makedirs(paths.get_path(f'media/wfusers/{wfuser.uid}'))

                    with open(paths.get_path(f'media/wfusers/{wfuser.uid}/{img_name}'), 'wb') as imgfp:
                        for chunk in file.chunks():
                            imgfp.write(chunk)
                    img_dict['1'] = f'/media/wfusers/{wfuser.uid}/{img_name}'
                    user_game.game_status = WfUserGame.MANUAL_STATUS
                    user_game.save()
                    wfuser.game_name = None
                    wfuser.save()

                    return restful.ok('后台已开始审核，请注意查看状态。')
        else:
            return restful.parameters_error('请上传正确的格式的图片，后台只接受PNG与JPG图片。')
    except:
        return restful.server_error('服务器处理请求失败，请稍后再试。')