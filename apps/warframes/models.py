from django.db import models


class Warframe(models.Model):
    """战甲模型类"""
    id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=100, unique=True, null=False)  # 名字
    health = models.IntegerField(null=False)  # 生命值
    shield = models.IntegerField(null=False)  # 护盾
    armor = models.IntegerField(null=False)  # 护甲
    power = models.IntegerField(null=False)  # 能量
    sprint_speed = models.FloatField(null=False)  # 冲刺速度
    power_strength = models.FloatField(null=False, default=1)  # 技能强度
    power_duration = models.FloatField(null=False, default=1)  # 技能持续时间
    power_range = models.FloatField(null=False, default=1)  # 技能范围
    power_efficiency = models.FloatField(null=False, default=1)  # 技能效率
    img = models.URLField(max_length=255, null=True)

    def __str__(self):
        info = '名称:{}--:{}'
        return info.format(self.name, self.img)
