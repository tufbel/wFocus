/*
 * @Author: Lumoon 
 * @Date: 2019-11-13 15:03:09 
 * @Last Modified by: Lumoon
 * @Last Modified time: 2019-12-03 17:22:32
 * @description: 获取图形验证码
 */

import msg from "../message.js";

$(function () {
    get_captcha();
})


function get_captcha() {

    $(`.img-captcha`).click(function (e) {
        e.preventDefault();
        $(this).attr({
            src: `/account/imgcaptcha/?random=${Math.random()}`
        })
    });

    $(`.email-captcha`).click(function (e) {
        e.preventDefault();
        wfajax.post({
            url: '/account/emailcaptcha',
            data: {
                email: "admin@163.com",
            },
            success: (data) => {
                if (data['code'] == 200) {
                    msg.ok_message(data['message']);
                } else {
                    msg.error_message(data['message']);
                }
            },
            fail: (error) => {
                console.log(data)
                msg.error_message('验证码发送失败！');
            }
        });
    });
}