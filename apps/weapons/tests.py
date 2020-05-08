from pprint import pprint

from django.test import TestCase
from utils import dict_keys

up = {
    'name': '压缩',
    'total': {
        'nomal': {
            'crit': 1,
            'base': [
                0, {
                    'salsh': 100,
                    'cold': 20
                }
            ]
        }
    }
}

total = up['total']['nomal']
del up['total']['nomal']

print(up)
print(total)
