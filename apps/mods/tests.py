import json
import re
from pprint import pprint

from django.test import TestCase

from apps.mods.models import Mod
from utils import paths
from utils.warframe_data import warframe_api as API


def updata_name():
    mods = Mod.objects.all()
    with open(paths.get_path(idir='json/zh.json'), 'r', encoding='utf-8') as fp:
        en_to_zh = json.load(fp)

    for mod in mods:
        name = mod.name
        name = en_to_zh.get(name, None)
        if name:
            mod.name = name

    pprint(list(mods))
    Mod.objects.bulk_update(mods, ['name'])



def create_mods():
    mods = list()
    with open(paths.get_path(idir='json/FilterThridMods.json'), 'r', encoding='utf-8') as fp:
        data = json.load(fp)

    for mod in data:
        m = Mod()
        m.name = mod.get('name')
        m.polarity = mod.get('polarity')
        m.rarity = mod.get('rarity')
        m.baseDrain = mod.get('baseDrain')
        m.fusionLimit = mod.get('fusionLimit')
        m.modType = mod.get('type')
        m.property = mod.get('property')

        mods.append(m)

    pprint(mods)
    Mod.objects.bulk_create(mods)


def filter_third_mods():
    res = re.compile('(' + '|'.join(API.KEY_WORDS) + ')$')
    ren = re.compile('[+-](([1-9][.0-9]*[%]{0,1}))')
    with open(paths.get_path(idir='json/FilterSecondMods.json'), 'r', encoding='utf-8') as fp:
        data = json.load(fp)
    mods = list()
    for mod in data:
        description = mod.pop('description', None)
        if description:
            prop = {}
            for item in description.split(','):
                key = res.search(item)
                if key:
                    value = ren.search(item)
                    if value:
                        prop[API.en_to_zh(key.group())] = value.group()

            if len(prop) > 0:
                mod['property'] = prop
                mod['type'] = re.sub(r' Mod', '', mod.get('type'))
                mods.append(mod)

    with open(paths.get_path(idir='json/FilterThridMods.json'), 'w', encoding='utf-8') as fp:
        json.dump(mods, fp)


def filter_second_mods():
    prog = re.compile(r'(Warframe|Shotgun|Rifle|Primary|Aura|Secondary|Melee|Stance)')
    with open(paths.get_path(idir='json/FilterMods.json'), 'r', encoding='utf-8') as fp:
        data = json.load(fp)

    mods = list()
    for item in data:
        if prog.match(item.get('type')) is not None:
            mods.append(item)

    with open(paths.get_path(idir='json/FilterSecondMods.json'), 'w', encoding='utf-8') as fp:
        json.dump(mods, fp)


def filter_frist_mods():
    fmods = {}
    with open(paths.get_path(idir='json/Mods.json'), 'r', encoding='utf-8') as fp:
        data = json.load(fp)
    for item in data:
        key = item.get('name', None)
        mod = {}
        mod['name'] = item.get('name')
        mod['polarity'] = item.get('polarity')
        mod['rarity'] = item.get('rarity')
        mod['baseDrain'] = item.get('baseDrain')
        mod['fusionLimit'] = item.get('fusionLimit')
        mod['description'] = item.get('description')
        mod['type'] = item.get('type')

        if key is not None:
            fmods[key] = mod

    fmods = list(fmods.values())
    pprint(fmods)
    with open(paths.get_path(idir='json/FilterMods.json'), 'w', encoding='utf-8') as fp:
        json.dump(fmods, fp)
