# -*- encoding: utf-8 -*-
"""
@File    : warframe_api.py
@Date    : 2019/11/15
@Author  : Regulus
@Contact : yusheng831143@gmail.com
@Desc    : 所有与游戏信息相关的API。
"""
# PC端全部信息
PC_URL = r'https://api.warframestat.us/pc'
# 奥布山谷信息
ORB_URL = r'https://api.warframestat.us/pc/vallisCycle'
# 夜灵平原信息
CETUS_URL = r'https://api.warframestat.us/pc/cetusCycle'
# 地球信息
EARTH_URL = r'https://api.warframestat.us/pc/earthCycle'
# 入侵任务信息
INVASIONS_URL = r'https://api.warframestat.us/pc/invasions'

# WFA官网URL地址
WFA_URL = r'https://wfa.richasy.cn/#/'

# Warframe战甲信息
WARFRAME_WARFRAMES = r'https://raw.githubusercontent.com/WFCD/warframe-items/development/data/json/Warframes.json'
WARFRAME_MODS = r'https://raw.githubusercontent.com/WFCD/warframe-items/development/data/json/Mods.json'

# 中英对照表地址
ZH_EN_DICT = r'https://warframe.huijiwiki.com/wiki/UserDict'
WARFRAME_IMGS = r'https://warframe.huijiwiki.com/wiki/%E6%88%98%E7%94%B2'
WIKI = 'https://warframe.huijiwiki.com/wiki/{url}'

EN_WIKI = 'https://warframe.fandom.com/{url}'

KEY_WORDS = [
    # warframe
    r' Ability Efficiency',  # 技能效率
    r' Ability Strength',  # 技能强度
    r' Ability Duration',  # 技能持续时间
    r' Ability Range',  # 技能范围
    r' Armor',  # 护甲
    r' Health',  # 生命值
    r' Shield Capacity',  # 护盾
    r' Energy Max',  # 能量
    r' Parkour Velocity',  # 冲刺速度
    r' Sprint Speed',  # 冲刺速度
    r' Critical Damage',  # 基础伤害
    # 武器
    r' Damage',  # 基础伤害
    r'>Slash',  # 切割伤害
    r'>Impact',  # 冲击伤害
    r'>Puncture',  # 穿刺伤害
    r'>Heat',  # 火伤害
    r'>Cold',  # 冰伤害
    r'>Electricity',  # 电伤害
    r'>Toxin',  # 毒伤害
    r' Critical Chance',  # 暴击几率
    r' Critical Damage',  # 暴击伤害
    r' Fire Rate', # 射速
    r' Multishot',  # 多重射击
    r' Magazine Capacity',  # 弹夹容量
    r' Ammo Maximum',  # 弹药最大值
    r' Punch Through',  # 穿透
    r' Status Chance',  # 异常触发几率
    r' Status Duration',  # 异常持续时间
    r' Weapon Recoil',  # 武器后坐力
    r' Reload Speed',  # 装填速度
    r' Fire Rate \(x2 for Bows\)',# 射速
]


def en_to_zh(str):
    """将英文字段转换为中文"""
    if str == KEY_WORDS[0]:
        return '技能效率'
    elif str == KEY_WORDS[1]:
        return '技能强度'
    elif str == KEY_WORDS[2]:
        return '技能持续时间'
    elif str == KEY_WORDS[3]:
        return '技能范围'
    elif str == KEY_WORDS[4]:
        return '护甲'
    elif str == KEY_WORDS[5]:
        return '生命值'
    elif str == KEY_WORDS[6]:
        return '护盾容量'
    elif str == KEY_WORDS[7]:
        return '能量'
    elif str == KEY_WORDS[8]:
        return '冲刺速度'
    elif str == KEY_WORDS[9]:
        return '冲刺速度'
    elif str == KEY_WORDS[10]:
        return '基础伤害'
    elif str == KEY_WORDS[11]:
        return '伤害'
    elif str == KEY_WORDS[12]:
        return '切割伤害'
    elif str == KEY_WORDS[13]:
        return '冲击伤害'
    elif str == KEY_WORDS[14]:
        return '穿刺伤害'
    elif str == KEY_WORDS[15]:
        return '火焰伤害'
    elif str == KEY_WORDS[16]:
        return '冰冻伤害'
    elif str == KEY_WORDS[17]:
        return '电击伤害'
    elif str == KEY_WORDS[18]:
        return '毒素伤害'
    elif str == KEY_WORDS[19]:
        return '暴击几率'
    elif str == KEY_WORDS[20]:
        return '暴击伤害'
    elif str == KEY_WORDS[21]:
        return '射速'
    elif str == KEY_WORDS[22]:
        return '多重射击'
    elif str == KEY_WORDS[23]:
        return '弹夹容量'
    elif str == KEY_WORDS[24]:
        return '弹药最大值'
    elif str == KEY_WORDS[25]:
        return '穿透'
    elif str == KEY_WORDS[26]:
        return '异常触发几率'
    elif str == KEY_WORDS[27]:
        return '异常持续时间'
    elif str == KEY_WORDS[28]:
        return '武器后坐力'
    elif str == KEY_WORDS[29]:
        return '装填速度'
    elif str == ' Fire Rate (x2 for Bows)':
        return '射速'
    else:
        return '未知'
