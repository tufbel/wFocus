from django.db import models
from django_mysql.models import JSONField
from shortuuidfield import ShortUUIDField


class Mod(models.Model):
    """Mod模型类"""
    id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=100, unique=True, null=False)
    family = models.CharField(max_length=20)
    polarity = models.CharField(max_length=20, null=False)
    rarity = models.CharField(max_length=20, null=False)
    base_drain = models.IntegerField(null=False)
    fusion_limit = models.IntegerField(null=False)
    type = models.CharField(max_length=100, null=False)
    property = JSONField()

    def __str__(self):
        return '{}:--{}:--{}'.format(self.name, self.type, self.property)


class ModBox(models.Model):
    """配置槽模型类"""
    id = ShortUUIDField(primary_key=True)
    modboxs = JSONField()
    type = models.CharField(max_length=20, null=False)
    wfuser = models.ForeignKey(
        'wfusers.WfUser',
        on_delete=models.CASCADE,
        to_field='email',
        db_column='wfuser_email',
        null=False
    )
    warframe = models.ForeignKey(
        'warframes.Warframe',
        on_delete=models.CASCADE,
        to_field='name',
        db_column='warframe_name',
        null=True
    )
    weapon = models.ForeignKey(
        'weapons.Weapon',
        on_delete=models.CASCADE,
        to_field='name',
        db_column='weapon_name',
        null=True
    )

    share_time = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        if self.warframe_id:
            return '{}:--{}'.format(self.wfuser_id, self.warframe_id)
        elif self.weapon_id:
            return '{}:--{}'.format(self.wfuser_id, self.weapon_id)
        else:
            return '{}:--Null'.format(self.wfuser_id)

    class Meta:
        ordering = ['-share_time']
