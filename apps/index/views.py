import re
from pprint import pprint

from django.shortcuts import render, redirect
from django.urls import reverse

from apps.translation.views import EnToZh
from apps.warframes.models import Warframe
from apps.weapons.models import Weapon


def index(request):
    return redirect(reverse('app_index:home'))


def home(request):
    return render(request, 'index/index_home.html')


def alerts(request):
    return render(request, 'index/index_alerts.html')


def warframes(request):
    ws = Warframe.objects.all()
    return render(request, 'index/index_warframes.html', context={
        'warframes': ws
    })


def weapons(request):
    ws = Weapon.objects.all()
    weapons: list = []
    en_to_zh = EnToZh()
    for weapon in ws:
        zh_name, en = en_to_zh.query_zh(weapon.name)
        w_dict: dict = {
            'name': zh_name,
            'link': re.sub(r' ', r'_', weapon.name)
        }
        weapons.append(w_dict)

    return render(request, 'index/index_weapons.html', context={
        'weapons': weapons
    })
