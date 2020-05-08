/*
 * @Author: Lumoon 
 * @Date: 2019-11-10 12:50:44 
 * @Last Modified by: Lumoon
 * @Last Modified time: 2019-11-17 19:47:27
 * @description: 装饰器测试，导入导出测试
 */

"use strict";

// 结果：暂不支持装饰器

import msg from "../message.js";

$(function () {
    $(`[type="button"]`).click(() => {
        msg.error_message(`错误提示`);
    });
})