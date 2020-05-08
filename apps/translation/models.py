from django.db import models
from django_mysql.models import JSONField


class Thesaurus(models.Model):
    """词典模型类"""
    id = models.AutoField(primary_key=True)
    en_key = models.CharField(max_length=50)
    zh_value = models.CharField(max_length=50)

    def __str__(self):
        return f'{self.en_key}--{self.zh_value}'

    class Meta:
        ordering = ['-id']
