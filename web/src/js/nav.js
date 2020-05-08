/*
 * @Author: Lumoon 
 * @Date: 2019-11-08 20:24:22 
 * @Last Modified by: Lumoon
 * @Last Modified time: 2019-11-19 13:56:41
 * @description: 导航栏特效控制。
 */


"use strict";

$(function () {
    let nav = new WfNav();
    nav.run();
})

class WfNav {

    constructor() {
        this.nav_lis = $(".nav-li");
        this.nav_now = $(".nav-li-now");
    }

    run() {
        this._nav_hover();
    }
    /**
     * 鼠标悬浮进导航栏后，模块跟随鼠标滑动。
     */
    _nav_hover() {
        let self = this;
        let span = this.nav_now.children("span");

        self.nav_lis.hover(function () {
            let n = $(this).index() - self.nav_now.index();
            span.css({
                "left": `${n}00%`,
            })
        }, function () {
            span.css({
                "left": "0",
            })
        });

    }
}