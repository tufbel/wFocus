import re

import cv2
import numpy as np
from aip import AipOcr
from django.shortcuts import render

from apps.wfusers.models import WfUserGame
from utils import paths
import pytesseract as tocr

# 指定pytesseract的路径
tocr.pytesseract.tesseract_cmd = r'D:\Scoop\Scoop\apps\tesseract4\4.1.0-elag2019'


# 识别游戏ID图片
def add_wfuser_gamename(wfuser, user_game):
    """图片识别用户游戏昵称"""
    try:
        img_path = paths.get_path(re.sub('^/', '', user_game.first_img))

        s = SimilarityImg(img_path)
        result = s.run()

        if result:
            r = RecognitionImg(img_path)
            name_img = r.run()
            oct_img = cv2.cvtColor(name_img, cv2.COLOR_BGR2GRAY)

            text = tocr.image_to_string(oct_img, lang='eng')

            user_game.game_status = WfUserGame.HAVE_GAMENAME
            wfuser.game_name = text.strip()
        else:
            user_game.game_status = WfUserGame.NO_GAMENAME
            wfuser.game_name = ''
    except:
        user_game.game_status = WfUserGame.NO_GAMENAME
        wfuser.game_name = None
    finally:
        user_game.save()
        wfuser.save()


# 识别紫卡图片
def riven_property_ocr(img_bytes):
    """ 你的 APPID AK SK """
    APP_ID = '17932642'
    API_KEY = 'Imwmalz3GwxHN6cE8Zy8HrBB'
    SECRET_KEY = 'i6rjjjwg6DDo0FouPHzLbLjelSR0xo5S'

    client = AipOcr(APP_ID, API_KEY, SECRET_KEY)  # 生成一个对象

    # 读取图片
    riven_text = client.basicAccurate(img_bytes)  # 调用通用文字识别(高精度板)

    result = riven_text['words_result']

    riven_data = extract_riven_data(result)
    riven_name = riven_data['riven_name']
    properties = riven_data['properties']

    data = {
        'riven_name': riven_name,
        'properties': properties,
    }
    return data


# 提取紫卡图片信息(分割)
def extract_riven_data(file):
    riven_name = ''
    properties = {}
    for riven_data in file:
        if re.match(r'[\u4e00-\u9fa5]', riven_data['words']) != None:
            if re.match(r'段', riven_data['words']) == None:
                pattern = re.compile(r'[^\u4e00-\u9fa5]')
                riven_name = re.sub(pattern, '', riven_data['words'])

        if re.match(r'[+-]', riven_data['words']) != None:
            riven_list = riven_data['words'].split('%')
            riven_property_key = riven_list[1]
            riven_property_value = riven_list[0] + '%'
            riven_property = {
                riven_property_key: riven_property_value
            }
            properties.update(riven_property)
    return {
        'riven_name': riven_name,
        'properties': properties
    }


# 过滤敏感词（确定有穷自动机算法）
class DFAFilter(object):
    def __init__(self):
        self.keyword_chains = {}  # 敏感词链表
        self.delimit = '\x00'  # 结束标志的key

    # 打开敏感词文件，遍历文件中的每一个敏感词
    def parse(self, path):
        with open(path, 'r') as f:
            for keyword in f:
                self.add(str(keyword).strip())

    # 将文件中的敏感词转成字典
    def add(self, keyword):
        keyword = keyword.lower()
        chars = keyword.strip()
        if not chars:
            return
        level = self.keyword_chains

        # 遍历敏感词的每个字
        for i in range(len(chars)):
            # 如果这个字已经存在字符链的key中就进入其子字典
            if chars[i] in level:
                level = level[chars[i]]
            else:
                for j in range(i, len(chars)):
                    level[chars[j]] = {}  # 这个字为key，对应value为空的键值对
                    last_level = level  # 设这个字所属的字典为最后一层字典
                    last_char = chars[j]  # 设这个字为敏感词的最后一个字
                    level = level[chars[j]]
                last_level[last_char] = {self.delimit: 0}  # 敏感词的最后一个字符对应的value存储一个结束标志（表示该value对应的key是敏感词的最后一个字符）
                break
        if i == len(chars) - 1:
            level[self.delimit] = 0

    # 过滤留言中的敏感词
    def filter(self, message, repl="*"):
        message = message.lower()
        ret = []  # 过滤后的留言
        start = 0  # 留言内各字的索引值
        while start < len(message):
            level = self.keyword_chains  # 敏感词链表
            step_ins = 0
            # 切片遍历留言
            for char in message[start:]:
                if char in level:
                    step_ins += 1
                    if self.delimit not in level[char]:
                        level = level[char]
                    else:
                        ret.append(repl * step_ins)
                        start += step_ins
                        break
                else:
                    ret.append(message[start])
                    start += 1
                    break

        return ''.join(ret)


class RecognitionImg(object):
    """游戏昵称识别"""
    temp_path = paths.get_path('opencv_imgs/user_biaozhi.png')
    keypoint_num = 10

    def __init__(self, game_path):
        self.game_path = game_path

    def run(self):
        """识别游戏截图"""
        tem_img = cv_imread(self.temp_path)
        game_img = cv_imread(self.game_path)

        # 特征提取
        (kps_t, des_t) = self.detect_and_describe(tem_img)
        (kps_g, des_g) = self.detect_and_describe(game_img)

        # 获取相似特征
        (matches, matches_keypoints) = self.match_keypoints(des_t, des_g)

        # 最佳匹配特征点
        (good_kps_t, good_kps_g) = self.find_good_keypoints(matches_keypoints[:self.keypoint_num], kps_t, kps_g)

        # 最佳匹配区域
        rectangle_t = self.get_rectangle(good_kps_t)
        rectangle_g = self.get_rectangle(good_kps_g)

        rectangle = self.get_rectangle_tem(rectangle_t, rectangle_g, tem_img)

        end_img = self.incision_img(game_img, rectangle)

        return end_img

    def detect_and_describe(self, img):
        """提取特征与特征点"""
        # 图片灰度化
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)

        # sift实例化
        sift = cv2.xfeatures2d.SIFT_create()
        # 特征提取与计算
        (kps, des) = sift.detectAndCompute(gray, None)

        return (kps, des)

    def match_keypoints(self, des_t, des_g):
        """"""
        # 初始化bf
        bf = cv2.BFMatcher()

        # 特征匹配
        matches = bf.match(des_t, des_g)
        matches = sorted(matches, key=lambda x: x.distance)

        matches_keypoints = []
        for m in matches:
            matches_keypoints.append((m.queryIdx, m.trainIdx))

        return (matches, matches_keypoints)

    def find_good_keypoints(self, matches, kps_t, kps_g):
        kpt = np.array([kps_t[i] for (i, _) in matches])
        kpg = np.array([kps_g[i] for (_, i) in matches])

        return (kpt, kpg)

    def get_rectangle(self, kps):
        rectangle = {
            'left': 10000,
            'right': 0,
            'top': 10000,
            'bottom': 0
        }

        for kp in kps:
            x, y = kp.pt
            x, y = round(x), round(y)

            if rectangle['left'] > x:
                rectangle['left'] = x

            if rectangle['right'] < x:
                rectangle['right'] = x

            if rectangle['top'] > y:
                rectangle['top'] = y

            if rectangle['bottom'] < y:
                rectangle['bottom'] = y

        return rectangle

    def get_rectangle_tem(self, rt, rg, imgt):
        """"""
        height, width = imgt.shape[:2]

        height = height - rt['bottom']
        width = width - rt['right']

        return {
            'left': rg['left'] - rt['left'],
            'right': rg['right'] + width,
            'top': rg['top'] - rt['top'],
            'bottom': rg['bottom'] + height
        }

    def trans_img(self, img, prop=1):
        """等比例缩小图片"""
        height, width = img.shape[:2]
        height = round(height * prop)
        width = round(width * prop)
        size = (width, height)
        t_img = cv2.resize(img, size)
        return t_img

    def incision_img(self, img, rectangle):
        """切取图片名称部分"""
        y_start = rectangle['top'] - 50
        y_end = rectangle['top']
        x_start = rectangle['left']
        x_end = rectangle['right']
        cut = img[y_start:y_end, x_start:x_end]
        return cut


class SimilarityImg(object):
    """图片相似度计算"""
    temp_path_list = [
        paths.get_path('opencv_imgs/user1.png'),
        paths.get_path('opencv_imgs/user2.png'),
        paths.get_path('opencv_imgs/user3.png'),
    ]

    def __init__(self, game_path):
        self.game_path = game_path

    def calculate(self, image1, image2):
        # 灰度直方图算法
        # 计算单通道的直方图的相似值
        hist1 = cv2.calcHist([image1], [0], None, [256], [0.0, 255.0])
        hist2 = cv2.calcHist([image2], [0], None, [256], [0.0, 255.0])
        # 计算直方图的重合度
        degree = 0
        for i in range(len(hist1)):
            if hist1[i] != hist2[i]:
                degree = degree + \
                         (1 - abs(hist1[i] - hist2[i]) / max(hist1[i], hist2[i]))
            else:
                degree = degree + 1
        degree = degree / len(hist1)
        return degree

    def run(self):
        similarity_list = []
        for path in self.temp_path_list:
            # 打开图片
            print(path)
            tem_img = cv_imread(path)
            game_img = cv_imread(self.game_path)

            # 计算相似度
            similarity = self.calculate(tem_img, game_img)

            if type(similarity) is float:
                # 完全相似时返回的为float
                similarity_list.append(similarity)
            else:
                # 返回的时nparray
                similarity_list.append(similarity[0])

        for s in similarity_list:
            if s < 0.6:
                return False

        return True


def cv_imread(filePath):
    cv_img = cv2.imdecode(np.fromfile(filePath, dtype=np.uint8), -1)
    return cv_img
