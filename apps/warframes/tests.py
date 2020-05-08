import os
import re

from django.http import Http404, HttpResponseNotFound
from django.test import TestCase
import json
from pprint import pprint

from django.views.decorators.http import require_POST

from apps.warframes.models import Warframe
from utils import paths, restful


def update_imgs():
    ws = Warframe.objects.all()
    imgs_name = os.listdir(paths.get_path('media/warframes'))
    for warframe in ws:
        name = warframe.name
        name = re.sub('\s', "", name)
        img_name = list(filter(lambda x: re.search(name, x), imgs_name))[0]
        warframe.img = f'/media/warframes/{img_name}'

    Warframe.objects.bulk_update(ws, ['img'])


def create_warframes():
    ws = list()
    with open(paths.get_path(idir='json/Warframes.json'), 'r', encoding='utf-8') as fp:
        data = json.load(fp)

    for item in data:
        w = Warframe()
        w.name = item.get('name')
        w.health = item.get('health')
        w.shield = item.get('shield')
        w.armor = item.get('armor')
        w.power = item.get('power')
        w.sprint_speed = item.get('sprintSpeed')

        ws.append(w)
    pprint(ws)
    # Warframe.objects.bulk_create(ws)

@require_POST
def ajax_test(request):
    return HttpResponseNotFound('页面找不到')
