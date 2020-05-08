from pprint import pprint

from django.db.models import Count
from django.http import JsonResponse
from django.shortcuts import render, redirect, reverse
from django.views.decorators.http import require_http_methods, require_POST, require_GET

from apps.cms.views import DFAFilter
from apps.msgs.models import RivenMsg
from apps.msgs.serializers import ParentMsgSerializer, AllMsgSerializer
from apps.rivenmarket.templatetags.time_filter import time_since
from apps.rivenmygoods.models import Riven
from apps.rivenmygoods.serializers import RivenSerializer
from utils import restful, paths

ONE_PAGE_RIVEN_COUNT = 6


# 初始化紫卡市场界面
@require_http_methods(["GET", "POST"])
def index(request):
    if request.method == 'GET':
        return render(request, 'riven/riven_market.html')
    else:
        try:
            count = int(ONE_PAGE_RIVEN_COUNT)  # 一次性加载count数量的紫卡
            # [0:count]切片操作,选取从索引为0到索引为count的紫卡信息
            rivens = Riven.objects.filter(is_sell=Riven.IS_SELL)
            rivens = rivens.order_by('-pub_time')[0:count]
            rivens_serializer = RivenSerializer(rivens, many=True)  # 序列化,其中many=True表示rivenes有很多数据需要序列化

            all_name = Riven.objects.values('riven_name').distinct()  # 获取所有不重复的紫卡名
            all_name = list(all_name)  # 不重复紫卡名列表
            name_set = set()
            for item in all_name:
                name_set.add(item['riven_name'])

            all_name = list(name_set)

            if request.user.is_authenticated:
                wfuser = request.user

                my_rivens = Riven.objects.filter(seller=wfuser)  # 查找我的紫卡

                # 我的紫卡id列表
                my_rivens_list = []
                for riven in my_rivens:
                    my_rivens_list.append({
                        'id': riven.id
                    })

                my_collector_rivens = wfuser.collector_wfuser.all()  # 查找我的收藏

                # 我的收藏id列表
                my_collector_list = []
                for my_collector_riven in my_collector_rivens:
                    my_collector_list.append({
                        'riven': my_collector_riven.id,
                        'collector': wfuser.uid,
                    })

                data = {
                    'all_name': all_name,
                    'rivens': rivens_serializer.data,
                    'collections': my_collector_list,
                    'my_rivens': my_rivens_list,
                }

                return restful.ok(data=data)
            else:
                data = {
                    'all_name': all_name,
                    'rivens': rivens_serializer.data,
                    'collections': [],
                    'my_rivens': [],
                }

                return restful.ok(data=data)
        except Exception:
            print(Exception)
            return restful.server_error('服务器未知错误')


# 响应搜索事件
@require_GET
def search_riven(request):
    # 一次性加载count数量的紫卡
    count = int(ONE_PAGE_RIVEN_COUNT)
    riven_name = request.GET.get('riven_name')
    riven_mode = request.GET.get('riven_mode')

    if riven_name != '':
        if riven_mode == '时间':
            # [0:count]切片操作,选取从索引为0到索引为count的紫卡信息
            rivens = Riven.objects.filter(riven_name=riven_name, is_sell=True).order_by('-pub_time')[0:count]
        elif riven_mode == '热度':
            rivens = Riven.objects.annotate(riven_count=Count('collector'))
            rivens = rivens.filter(riven_name=riven_name, is_sell=True).order_by('-riven_count')[0:count]
        else:
            rivens = Riven.objects.filter(riven_name=riven_name, is_sell=True).order_by('price')[0:count]
    else:
        if riven_mode == '时间':
            # [0:count]切片操作,选取从索引为0到索引为count的紫卡信息
            rivens = Riven.objects.filter(is_sell=True).order_by('-pub_time')[0:count]
        elif riven_mode == '热度':
            rivens = Riven.objects.annotate(riven_count=Count('collector'))
            rivens = rivens.filter(is_sell=True).order_by('-riven_count')[0:count]
        else:
            rivens = Riven.objects.filter(is_sell=True).order_by('price')[0:count]

    # 序列化,其中many=True表示rivenes有很多数据需要序列化
    rivens_serializer = RivenSerializer(rivens, many=True)

    if request.user.is_authenticated:
        wfuser = request.user

        my_rivens = Riven.objects.filter(seller=wfuser)  # 查找我的紫卡

        my_rivens_list = []  # 我的紫卡列表

        for riven in my_rivens:
            my_rivens_list.append({
                'id': riven.id
            })

        my_collector_rivens = wfuser.collector_wfuser.all()  # 查找我的收藏

        my_collector_list = []  # 我的收藏列表

        for my_collector_riven in my_collector_rivens:
            my_collector_list.append({
                'riven': my_collector_riven.id,
                'collector': wfuser.uid,
            })

        data = {
            'rivens': rivens_serializer.data,
            'collections': my_collector_list,
            'my_rivens': my_rivens_list,
        }
        return restful.ok(data=data)
    else:
        data = {
            'rivens': rivens_serializer.data,
            'collections': [],
            'my_rivens': [],
        }
        return restful.ok(data=data)


# 响应加载更多紫卡事件
def riven_new_list(request):
    # 通过p参数,来指定获取第几页的数据,并且p参数是通过查询字符串的方式传过来的/rivenmarket/searchRivenView/?p=1,
    # 如果没有传递p参数,默认为1
    try:
        page = int(request.GET.get('p', 1))

        count = int(ONE_PAGE_RIVEN_COUNT)
        start = (page - 1) * count
        end = start + count

        riven_name = request.GET.get('riven_name')
        riven_mode = request.GET.get('riven_mode')
        if riven_name != '':
            if riven_mode == '时间':
                # [0:count]切片操作,选取从索引为0到索引为count的紫卡信息
                rivens = Riven.objects.filter(riven_name=riven_name, is_sell=True).order_by('-pub_time')[start:end]
            elif riven_mode == '热度':
                rivens = Riven.objects.annotate(riven_count=Count('collector'))
                rivens = rivens.filter(riven_name=riven_name, is_sell=True).order_by('-riven_count')[start:end]
            elif riven_mode == '价格':
                rivens = Riven.objects.filter(riven_name=riven_name, is_sell=True).order_by('price')[start:end]
            else:
                rivens = {}
        else:
            if riven_mode == '时间':
                # [0:count]切片操作,选取从索引为0到索引为count的紫卡信息
                rivens = Riven.objects.filter(is_sell=True).order_by('-pub_time')[start:end]
            elif riven_mode == '热度':
                rivens = Riven.objects.annotate(riven_count=Count('collector'))
                rivens = rivens.filter(is_sell=True).order_by('-riven_count')[start:end]
            elif riven_mode == '价格':
                rivens = Riven.objects.filter(is_sell=True).order_by('price')[start:end]
            else:
                rivens = {}

        # 序列化,其中many=True表示rivenes有很多数据需要序列化
        rivens_serializer = RivenSerializer(rivens, many=True)

        if request.user.is_authenticated:
            wfuser = request.user
            my_rivens = Riven.objects.filter(seller=wfuser)

            my_rivens_list = []
            for riven in my_rivens:
                my_rivens_list.append({
                    'id': riven.id
                })

            my_collector_rivens = wfuser.collector_wfuser.all()
            my_collector_list = []
            for my_collector_riven in my_collector_rivens:
                my_collector_list.append({
                    'riven': my_collector_riven.id,
                    'collector': wfuser.uid,
                })

            data = {
                'rivens': rivens_serializer.data,
                'collections': my_collector_list,
                'my_rivens': my_rivens_list,
            }

            return restful.ok(data=data)
        else:
            data = {
                'rivens': rivens_serializer.data,
                'collections': [],
                'my_rivens': [],
            }
            return restful.ok(data=data)
    except:
        return restful.server_error('服务器查询失败，请稍后再试')


# 响应查找所有留言事件
def query_msg(request):
    try:
        if request.method == 'GET':
            riven_id = request.GET.get('riven_id')
            msgs = RivenMsg.objects.filter(riven_id=riven_id, parent=None)
            msgs = msgs.order_by('-comment_time')
            msgs_serializer = AllMsgSerializer(msgs, many=True)
            data = msgs_serializer.data

            print(data)

            return restful.ok(data=data)
        elif request.method == 'POST':
            riven_id = request.POST.get('riven_id')
            msgs = RivenMsg.objects.filter(riven_id=riven_id, parent=None)
            msgs = msgs.order_by('-comment_time')
            msgs.update(view_state=True)
            msgs_serializer = AllMsgSerializer(msgs, many=True)
            data = msgs_serializer.data

            print(data)

            return restful.ok(data=data)
        return restful.method_error('请求方式错误。')
    except:
        return restful.server_error('加载失败,请稍后再试。')


#  响应在他人紫卡发表父留言事件
def write_msg(request):
    msg = request.POST.get('msg')
    riven_id = request.POST.get('riven_id')

    gfw = DFAFilter()
    path = paths.get_path(f'sensitive_words.txt')
    gfw.parse(path)
    msg = gfw.filter(msg)

    wfuser = request.user
    if wfuser.is_authenticated:
        if wfuser.game_name is not None:
            try:
                RivenMsg.objects.create(
                    content=msg,
                    view_state=False,
                    riven_id=riven_id,
                    writer=wfuser
                )
                print('留言成功')
                return restful.ok('留言成功')
            except:
                return restful.server_error('发表留言失败，请稍后再试。')
        else:
            return restful.authority_error('需要通过审核游戏ID后才能留言。')
    else:
        return restful.authority_error('请登录后留言。')


# 响应在自己紫卡发表父留言事件
def write_self_msg(request):
    msg = request.POST.get('msg')
    riven_id = request.POST.get('riven_id')

    gfw = DFAFilter()
    path = paths.get_path(f'sensitive_words.txt')
    gfw.parse(path)
    msg = gfw.filter(msg)

    wfuser = request.user
    if wfuser.is_authenticated:
        if wfuser.game_name is not None:
            try:
                RivenMsg.objects.create(
                    content=msg,
                    view_state=True,
                    riven_id=riven_id,
                    writer=wfuser
                )
                return restful.ok('留言成功')
            except:
                return restful.server_error('发表留言失败，请稍后再试。')
        else:
            return restful.authority_error('需要通过审核游戏ID后才能留言。')
    else:
        return restful.authority_error('请登录后留言')


# 响应收藏紫卡事件
@require_POST
def riven_collection(request):
    if request.user.is_authenticated:
        try:
            wfuser = request.user
            riven_id = request.POST.get('riven_id')
            riven = Riven.objects.filter(id=riven_id).first()
            riven.collector.add(wfuser)
            riven.save()

            return restful.ok('收藏成功')
        except:
            return restful.server_error('收藏失败，请稍后再试')
    else:
        return restful.authority_error('登录后才能添加收藏。')


# 响应取消收藏事件
@require_POST
def not_riven_collection(request):
    try:
        wfuser = request.user
        riven_id = request.POST.get('riven_id')
        print(type(riven_id))
        riven = Riven.objects.filter(id=riven_id).first()
        riven.collector.remove(wfuser)
        riven.save()
        return restful.ok('取消收藏成功。')
    except:
        return restful.server_error('添加收藏失败，请稍后再试')


