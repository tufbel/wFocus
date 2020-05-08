/*
 * @Author: Lumoon 
 * @Date: 2019-12-07 17:15:11 
 * @Last Modified by: Lumoon
 * @Last Modified time: 2019-12-07 22:24:38
 * @description: 全局工具
 */

"use strict";

function get_cookie(name) {
    let cookie_value = null;
    if (document.cookie && document.cookie != "") {
        let cookies = document.cookie.split(";");
        for (const item of cookies) {
            let cookie = item.trim();
            if (cookie.substring(0, name.length + 1).trim() === `${name}=`.trim()) {
                cookie_value = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookie_value;
}

function copy(object) {
    if (object && typeof object == `object`) {
        let obj = Array.isArray(object) ? [] : {};
        for (const key in object) {
            obj[key] = (typeof object[key] == `object`) ? copy(object[key]) : object[key];
        }
        return obj;
    } else {
        return null;
    }
}

function get_hash(object, null_object) {
    if (object && typeof object == `object`) {
        if (Array.isArray(object)) {
            for (const value of object) {
                get_hash(value, null_object)
            }
        } else {
            for (const [key, value] of Object.entries(object)) {
                if (typeof value == `object`) {
                    get_hash(value, null_object)
                } else {
                    null_object[key] = value
                }
            }
        }
    }
}

function time_difference(edate, now_data = new Date()) {
    let ms = edate - now_data;
    let minutes = Math.trunc(ms / (1000 * 60));
    let return_str = ``;

    if (minutes < -43200) {
        let months = Math.abs(Math.trunc(minutes / 43200));
        return_str = `${months}月前`;
    } else if (minutes > -43200 && minutes <= -1400) {
        let days = Math.abs(Math.trunc(minutes / 1440));
        return_str = `${days}天前`;
    } else if (minutes > -1440 && minutes <= -60) {
        let hours = Math.abs(Math.trunc(minutes / 60));
        return_str = `${hours}小时前`;
    } else if (minutes > -60 && minutes <= -1) {
        return_str = `${Math.abs(minutes)}分钟前`;
    } else if (minutes > -1 && minutes <= 0) {
        return_str = `刚刚`;
    } else if (minutes > 0 && minutes <= 1) {
        return_str = `即将`;
    } else if (minutes > 1 && minutes <= 60) {
        return_str = `${minutes}分钟后`;
    } else if (minutes > 60 && minutes <= 720) {
        let hours = Math.trunc(minutes / 60);
        return_str = `${hours}小时${minutes%60}分钟后`;
    } else if (minutes > 720 && minutes <= 1440) {
        return_str = `12小时后`;
    } else if (minutes > 1440 && minutes <= 43200) {
        let days = Math.trunc(minutes / 1440);
        return_str = `${days}天后`;
    } else {
        let months = Math.trunc(minutes / 43200);
        return_str = `${months}月后`;
    }
    return [return_str, minutes];
}