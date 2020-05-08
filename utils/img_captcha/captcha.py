# -*- encoding: utf-8 -*-
"""
@File    : captcha.py
@Date    : 2019/11/13
@Author  : Regulus
@Contact : yusheng831143@gmail.com
@Desc    : 生成图形验证吗。
"""

import random
import os
import string
import time

from PIL import Image, ImageDraw, ImageFont


class Captcha(object):
    """生产图像验证吗"""
    CAPTCHA_NUM = 4
    IMG_SIZE = (100, 40)
    IMG_BACKGROUND = (0, 0, 0)

    FONT_PATH = os.path.join(os.path.dirname(__file__), 'FiraCode_Medium.ttf')
    FONT_COLOR = (random.randint(100, 255), random.randint(50, 200), random.randint(50, 255))
    FONT_SIZE = 20

    DRAW_LINE = True
    LINE_NUM = random.randint(3, 6)
    LINE_COLOR = (random.randint(0, 255), random.randint(0, 255), random.randint(0, 255))

    DRAW_POINT = True
    POINT_NUM = random.randint(2, 5)
    POINT_COLOR = (random.randint(0, 255), random.randint(0, 255), random.randint(0, 255))

    SOURCE = list(string.ascii_letters)
    for index in range(0, 10):
        SOURCE.append(str(index))

    @classmethod
    def __get_text(cls):
        return ''.join(random.sample(cls.SOURCE, cls.CAPTCHA_NUM))

    @classmethod
    def __gene_line(cls, draw, width, height):
        """绘制干扰线"""
        start = (random.randint(0, width), random.randint(0, height))
        end = (random.randint(0, width), random.randint(0, height))
        draw.line([start, end], fill=cls.LINE_COLOR)

    @classmethod
    def __gene_point(cls, draw, point_chance, width, height):
        """绘制干扰点"""
        chance = min(100, max(0, int(point_chance)))
        for w in range(width):
            for h in range(height):
                tmp = random.randint(0, 100)
                if tmp > 100 - chance:
                    draw.point((w, h), fill=cls.POINT_COLOR)

    @classmethod
    def gene_captcha(cls):
        width, height = cls.IMG_SIZE
        image = Image.new('RGBA', (width, height), cls.IMG_BACKGROUND)
        font = ImageFont.truetype(cls.FONT_PATH, cls.FONT_SIZE)
        draw = ImageDraw.Draw(image)

        text = cls.__get_text()

        font_width, font_height = font.getsize(text)
        draw.text(((width - font_width) / 2, (height - font_height) / 2), text, font=font, fill=cls.FONT_COLOR)

        if cls.DRAW_LINE:
            for x in range(0, cls.LINE_NUM):
                cls.__gene_line(draw, width, height)

        if cls.DRAW_POINT:
            cls.__gene_point(draw, cls.POINT_NUM, width, height)

        return (text, image)
