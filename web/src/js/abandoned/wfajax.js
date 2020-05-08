/*
 * @Author: Lumoon 
 * @Date: 2019-11-09 12:58:14 
 * @Last Modified by: Lumoon
 * @Last Modified time: 2019-12-08 22:33:35
 * @description: Ajax请求添加csrftoken认证。
 */

"use strict";


// 全局ajax请求定义
var wfajax = {
    "get": function (args) {
        args["method"] = "get";
        this.ajax(args);
    },
    "post": function (args) {
        args["method"] = "post";
        this._ajaxSetup(args);
        this.ajax(args);
    },
    "ajax": function (args) {
        $.ajax(args);
    },
    "_ajaxSetup": function () {
        $.ajaxSetup({
            beforeSend: function (xhr, settings) {
                let method = /^ GET|HEAD|OPTIONS|TRACE $/;
                if (!method.test(settings.type) && !this.crossDomain) {
                    xhr.setRequestHeader("X-CSRFToken", get_cookie("csrftoken"));
                }
            }
        });
    }
}