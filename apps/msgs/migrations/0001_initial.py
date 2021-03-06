# Generated by Django 2.2.5 on 2019-12-20 07:03

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ('rivenmygoods', '0002_riven_collector'),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name='RivenMsg',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('view_state', models.BooleanField(default=False)),
                ('content', models.TextField(max_length=256)),
                ('comment_time', models.DateTimeField(auto_now_add=True)),
                ('parent', models.ForeignKey(null=True, on_delete=django.db.models.deletion.CASCADE, related_name='children', to='msgs.RivenMsg')),
                ('riven', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='rivenmygoods.Riven')),
                ('writer', models.ForeignKey(on_delete=django.db.models.deletion.DO_NOTHING, to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'ordering': ['comment_time'],
            },
        ),
    ]
