from django.db.models import Count
from django.shortcuts import render

from django.views.decorators.http import require_http_methods

from apps.cms.views import DFAFilter
from apps.msgs.models import RivenMsg
from apps.msgs.serializers import ParentMsgSerializer, ChildrenMsgSerializer
from utils import restful, paths

ONE_PAGE_RIVEN_COUNT = 4


# 查看父级留言
@require_http_methods(["GET", "POST"])
def query_parent_msg(request):
    try:
        if request.method == 'GET':
            riven_id = request.GET.get('riven_id')

            msgs = RivenMsg.objects.annotate(children_count=Count('children'))
            msgs = msgs.filter(riven_id=riven_id, parent=None)
            msgs = msgs.order_by('-comment_time')
            msgs_serializer = ParentMsgSerializer(msgs, many=True)
            data = msgs_serializer.data
            if(data != None):
                return restful.ok(data=data)
            else:
                return restful.no_content(data=data)
        elif request.method == 'POST':
            riven_id = request.POST.get('riven_id')

            msgs = RivenMsg.objects.annotate(children_count=Count('children'))
            msgs = msgs.filter(riven_id=riven_id, parent=None)
            msgs = msgs.order_by('-comment_time')
            msgs_serializer = ParentMsgSerializer(msgs, many=True)
            data = msgs_serializer.data

            msgs.update(view_state=True)  # 将父留言状态标记为已查看

            if (data != None):
                return restful.ok(data=data)
            else:
                return restful.no_content(data=data)
        else:
            return restful.method_error('请求方式错误。')
    except:
        return restful.server_error('请求失败,请稍后再试')


# 查看前4条子留言
def query_children_msg(request):
    try:
        count = int(ONE_PAGE_RIVEN_COUNT)
        parent_msg_id = request.POST.get('parent_msg_id')
        children_msg = RivenMsg.objects.filter(parent=parent_msg_id).order_by('-comment_time')[0:count]
        children_msg_serializer = ChildrenMsgSerializer(children_msg, many=True)
        data = children_msg_serializer.data
        return restful.ok(data=data)
    except:
        return restful.server_error('请求查询失败，请稍后再试。')


# 查看更多子留言
def query_new_children_msg(request):
    try:
        page = int(request.POST.get('page', 1))
        count = int(ONE_PAGE_RIVEN_COUNT)
        start = (page - 1) * count
        end = start + count

        parent_msg_id = request.POST.get('parent_msg_id')
        children_msg = RivenMsg.objects.filter(parent=parent_msg_id).order_by('-comment_time')[start:end]
        children_msg_serializer = ChildrenMsgSerializer(children_msg, many=True)
        data = children_msg_serializer.data
        return restful.ok(data=data)
    except:
        return restful.server_error('加载失败，请稍后再试。')


# 对收藏的紫卡发表父留言
def write_parent_msg(request):
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
                return restful.ok('留言成功')
            except:
                return restful.server_error('发表留言失败，请稍后再试。')
        else:
            return restful.authority_error('需要通过审核游戏ID后才能留言。')
    else:
        return restful.authority_error('请登录后留言。')


# 对我的紫卡发表父留言
def write_self_parent_msg(request):
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


# 回复父留言(添加子留言)
def add_self_children_msg(request):
    wfuser = request.user
    if wfuser.game_name is not None:
        try:
            msg = request.POST.get('msg')
            parent_msg_id = request.POST.get('parent_msg_id')

            print(msg)
            gfw = DFAFilter()
            path = paths.get_path(f'sensitive_words.txt')
            gfw.parse(path)
            msg = gfw.filter(msg)

            parent_msg = RivenMsg.objects.filter(id=parent_msg_id).first()
            riven_id = parent_msg.riven_id
            RivenMsg.objects.create(
                view_state=True,
                content=msg,
                riven_id=riven_id,
                parent_id=parent_msg_id,
                writer=wfuser)
            return restful.ok('回复留言成功')
        except:
            return restful.ok('回复留言失败')
    else:
        return restful.authority_error('需要通过审核游戏ID后才能回复留言。')

