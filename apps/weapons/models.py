from django.db import models
from django_mysql.models import JSONField


class Weapon(models.Model):
    """武器模型类"""
    id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=100, unique=True, null=False)  # 名字
    family = models.CharField(max_length=100)  # 武器所属
    slot = models.CharField(max_length=20)  # 武器槽位
    type = models.CharField(max_length=20)  # 武器类型
    noise_level = models.CharField(max_length=20)  # 警戒等级
    fire_rate = models.CharField(max_length=10)  # 射速
    accuracy = models.CharField(max_length=10)  # 精准度
    magazine_size = models.CharField(max_length=10)  # 弹夹容量
    max_ammo = models.CharField(max_length=10)  # 弹药上限
    reload_time = models.CharField(max_length=10)  # 装填时间
    disposition = models.CharField(max_length=100)  # 裂隙倾向
    trigger_type = models.CharField(max_length=100)  # 模式
    pattern = JSONField()  # 模式伤害

    def __str__(self):
        info = '名称:{}--武器类型:{}--:{}'
        return info.format(self.name, self.type, self.id)
