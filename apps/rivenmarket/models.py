# from django.db import models
# from apps.rivenmygoods.models import Riven
# from apps.wfusers.models import WfUser
#
#
# class RivenMsg(models.Model):
#     view_state = models.BooleanField(default=False)  # 留言状态(是否已被卖家自己查看)
#     content = models.TextField(max_length=256)  # 留言内容
#     comment_time = models.DateTimeField(auto_now_add=True)  # 留言时间
#     riven = models.ForeignKey(
#         Riven,
#         on_delete=models.CASCADE
#     )  # 紫卡
#     writer = models.ForeignKey(
#         WfUser,
#         on_delete=models.DO_NOTHING
#     )  # 留言人
#
#     parent = models.ForeignKey(
#         'self',
#         on_delete=models.CASCADE,
#         null=True,
#         related_name='children'
#     )
#
#     class Meta:
#         ordering = ['comment_time']
