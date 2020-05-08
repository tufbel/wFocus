from django.db import models
from django_mysql.models import JSONField

# Create your models here.
from apps.wfusers.models import WfUser


class Riven(models.Model):
    IS_SELL = 1
    IS_NOT_SELL = 2
    IS_AUDIT = 3

    riven_name = models.CharField(max_length=40)
    properties = JSONField()
    price = models.IntegerField(default=0)
    is_sell = models.IntegerField()
    thumbnail = models.URLField()
    pub_time = models.DateTimeField(auto_now_add=True)
    seller = models.ForeignKey(
        WfUser,
        on_delete=models.CASCADE
    )
    collector = models.ManyToManyField(WfUser, related_name='collector_wfuser')

    def __str__(self):
        return f'{self.id}--:{self.riven_name}--:{self.seller_id}'

    class Meta:
        ordering = ['-pub_time']


