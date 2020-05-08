/*
 * @Author: Lumoon 
 * @Date: 2019-12-08 21:14:59 
 * @Last Modified by: Lumoon
 * @Last Modified time: 2019-12-09 13:49:25
 * @description: Ajax请求添加csrftoken认证
 */


"use strict";

var wfajax = {
    get: function (args) {
        args.type = `GET`;
        this.ajax(args);
    },
    post: function (args) {
        args.type = `POST`;
        this.ajax(args);
    },
    ajax: function (args) {
        let settings = this._before(args);
        $.ajax(settings);
    },
    _before: function (args) {
        let re_type = /^GET|HEAD|OPTIONS|TRACE$/;

        re_type.test(args.type) || (
            args[`beforeSend`] = function (xhr, settings) {
                this.crossDomain || xhr.setRequestHeader(`X-CSRFToken`, get_cookie(`csrftoken`));
            }
        );

        args.error || (
            args[`error`] = (xhr, status_text, error) => {
                console.error(`请求失败：${xhr.status}`);
            }
        );

        // args.statusCode = {
        //     404: () => {
        //         console.log(`错误码404，没找到页面`);
        //     },
        //     405: () => {
        //         console.log(`错误码405，请求方式错误`);
        //     }
        // }

        return args;
    }

}

var wfpromise = {
    get: function (args) {
        args.type = `GET`;
        return this.ajax(args);
    },
    post: function (args) {
        args.type = `POST`;
        return this.ajax(args);
    },
    ajax: function (args) {
        let self = this;
        return new Promise((resolve, reject) => {
            let settings = self._before(args, resolve, reject);
            wfajax.ajax(settings);
        });
    },
    _before: function (args, resolve, reject) {
        args[`success`] = (response) => {
            resolve(response);
        };
        args[`error`] = (xhr) => {
            console.log(`错误状态码：${xhr.status}`);
            reject(xhr.status);
        };
        return args;
    }
}