import json
from io import BytesIO
from pprint import pprint

import shortuuid
from django.db.models import Count
from django.shortcuts import render, redirect
from django.urls import reverse
from django.views.decorators.http import require_POST, require_http_methods, require_GET
from django.http import JsonResponse
import os
from django.conf import settings

from apps.cms.views import riven_property_ocr
from apps.msgs.models import RivenMsg
from utils import restful, paths
from .models import Riven

from .serializers import RivenSerializer
from aip import AipOcr

import re
from enum import Enum


class SellState(Enum):
    IS_SELL = 1  # 售卖紫卡
    IS_NOT_SELL = 2  # 已下架
    IS_AUDIT = 3  # 审核中


# 初始化我的紫卡界面
@require_http_methods(["GET", "POST"])
def index(request):
    if request.method == 'GET':
        if request.user.is_authenticated:
            return render(request, 'riven/riven_mygoods.html')
        else:
            return redirect(reverse('rivenmarket:index'))
    else:
        if request.user.is_authenticated:
            try:
                wfuser = request.user
                rivens = Riven.objects.filter(
                    seller_id=wfuser.uid,
                    is_sell__in=[
                        SellState.IS_SELL.value,
                        SellState.IS_AUDIT.value
                    ]
                ).order_by('-pub_time')

                riven_serializer = RivenSerializer(rivens, many=True)
                return restful.ok(data=riven_serializer.data)
            except:
                return restful.server_error('加载失败')
        else:
            return restful.authority_error('请先登录')


# 对上传的紫卡识别
@require_POST
def upload_file(request):
    try:
        file = request.FILES.get('file')
        name = file.name

        name_re = re.compile('(.png|.jpg)$', flags=re.IGNORECASE)
        img_type = name_re.search(name).group()

        if img_type:
            img = bytes()
            for chunk in file.chunks():
                img += chunk

            riven_data = riven_property_ocr(img)

            return restful.ok(data=riven_data)
        else:
            return restful.parameters_error('请上传正确的格式的图片，只接受PNG与JPG图片。')
    except:
        return restful.server_error('图片识别失败')


# 发布紫卡
@require_POST
def write_riven(request):
    if request.user.game_name is not None:
        try:
            wfuser = request.user

            riven_name = request.POST.get('riven_name')
            properties = json.loads(request.POST.get('properties'))
            price = request.POST.get('price')

            file = request.FILES.get('file')
            name = file.name

            name_re = re.compile('(.png|.jpg)$', flags=re.IGNORECASE)
            img_type = name_re.search(name).group()

            if img_type:
                img_name = shortuuid.uuid()
                if os.path.exists(paths.get_path(f'media/wfusers/{wfuser.uid}/rivens')) is False:
                    os.makedirs(paths.get_path(f'media/wfusers/{wfuser.uid}/rivens'))

                img_path = paths.get_path(f'media/wfusers/{wfuser.uid}/rivens/{img_name}{img_type}')
                with open(img_path, 'wb') as imgfp:
                    for chunk in file.chunks():
                        imgfp.write(chunk)

                Riven.objects.create(
                    riven_name=riven_name,
                    properties=properties,
                    price=price,
                    is_sell=SellState.IS_SELL.value,
                    thumbnail=f'/media/wfusers/{wfuser.uid}/rivens/{img_name}{img_type}',
                    seller_id=wfuser.uid
                )

                return restful.ok(message='紫卡上架成功')
            else:
                return restful.parameters_error('请上传正确的格式的图片，只接受PNG与JPG图片。')
        except:
            return restful.server_error('上架紫卡失败，请稍后再试。')
    else:
        return restful.authority_error('需要通过游戏ID审核才能发布紫卡。')


# 提交人工审核
@require_POST
def audit_riven(request):
    if request.user.is_authenticated:
        if request.user.game_name is not None:
            try:
                wfuser = request.user

                riven_name = request.POST.get('riven_name')
                properties = json.loads(request.POST.get('properties'))
                price = request.POST.get('price')

                file = request.FILES.get('file')
                name = file.name

                name_re = re.compile('(.png|.jpg)$', flags=re.IGNORECASE)
                img_type = name_re.search(name).group()

                if img_type:
                    img_name = shortuuid.uuid()
                    if os.path.exists(paths.get_path(f'media/wfusers/{wfuser.uid}/rivens')) is False:
                        os.makedirs(paths.get_path(f'media/wfusers/{wfuser.uid}/rivens'))

                    img_path = paths.get_path(f'media/wfusers/{wfuser.uid}/rivens/{img_name}{img_type}')
                    with open(img_path, 'wb') as imgfp:
                        for chunk in file.chunks():
                            imgfp.write(chunk)

                    Riven.objects.create(
                        riven_name=riven_name,
                        properties=properties,
                        price=price,
                        is_sell=SellState.IS_AUDIT.value,
                        thumbnail=f'/media/wfusers/{wfuser.uid}/rivens/{img_name}{img_type}',
                        seller=wfuser
                    )
                    return restful.ok(message='提交审核成功')
                else:
                    return restful.parameters_error('请上传正确的格式的图片，后台只接受PNG与JPG图片。')
            except:
                return restful.server_error('上架紫卡失败，请稍后再试。')
        else:
            return restful.server_error('需要通过游戏ID审核才能发布紫卡。')
    else:
        return restful.authority_error('需要登录才能发布紫卡。')


# 修改价格
@require_http_methods(["GET", "POST"])
def change_price(request):
    if request.method == "GET":
        try:
            id = request.GET.get('riven_id', None)
            riven = Riven.objects.filter(id=id).first()
            riven = RivenSerializer(riven)
            return restful.ok(data=riven.data)
        except:
            return restful.server_error('数据加载失败，请稍后再试')
    elif request.method == "POST":
        try:
            id = request.POST.get('riven_id')
            price = request.POST.get('price')

            riven = Riven.objects.filter(id=id)
            riven.update(price=price)

            return restful.ok('价格修改成功。')
        except:
            return restful.server_error('修改价格失败，请稍后再试')
    else:
        return restful.method_error('请求错误。')

# 下架紫卡
@require_POST
def not_sell_riven(request):
    try:
        id = request.POST.get('riven_id')
        riven = Riven.objects.filter(id=id)
        riven.update(is_sell=SellState.IS_NOT_SELL.value)
        return restful.ok('下架成功')
    except:
        return restful.server_error('下架失败，请稍后再试')


# 取消审核
@require_POST
def not_audit_riven(request):
    try:
        id = request.POST.get('riven_id')
        riven = Riven.objects.filter(id=id)
        riven.delete()
        return restful.ok('取消审核成功')
    except:
        return restful.server_error('取消审核失败，请稍后再试')


# 查找新留言(未查看的父留言)
def new_msg(request):
    if request.user.is_authenticated:
        my_riven_id = Riven.objects.filter(seller=request.user)
        msgs = RivenMsg.objects.filter(view_state=False).values('riven_id').distinct()
        new_msg_riven = msgs.filter(riven__id__in=my_riven_id)
        new_msg_riven = list(new_msg_riven)
        data = new_msg_riven
        return restful.ok(data=data)
    else:
        return restful.authority_error(data=[])


# 初始化我的收藏界面
@require_http_methods(["GET", "POST"])
def rivencollection(request):
    if request.method == 'GET':
        if request.user.is_authenticated:
            return render(request, 'riven/riven_collection.html')
        else:
            return redirect(reverse('rivenmarket:index'))
    elif request.method == 'POST':
        try:
            wfuser = request.user
            rivens = Riven.objects.filter(collector=wfuser)
            rivens = rivens.annotate(riven_count=Count('collector'))
            rivens = rivens.order_by('-riven_count')
            riven_serializer = RivenSerializer(rivens, many=True)
            return restful.ok(data=riven_serializer.data)
        except:
            return restful.server_error('加载失败，请稍后再试。')
    else:
        return restful.method_error('请求方式错误。')