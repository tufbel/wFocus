/*
 * @Author: Lumoon 
 * @Date: 2019-11-10 23:21:22 
 * @Last Modified by: Lumoon
 * @Last Modified time: 2019-11-11 12:36:11
 * @description: 搜索提示框
 */

"use strict";

$(function () {
    let searchtips = new Searchtips();

    $(document.body).append(searchtips.wrapper);
    for (let i = 0; i < 10; i++) {
        searchtips.tips.append(
            $(`<section class="search-tip">${i}</section>`)
        );
    }

})

class Searchtips {

    constructor() {

        this._initElement();
        this._run();
    }

    _run() {

    }
    _initElement() {
        let self = this;

        self.wrapper = $(`<div></div>`);
        self.wrapper.css({
            margin: `2px 5px 5px 5px`,
        });
        let fill = $(`<div></div>`);
        fill.css({
            background: `#f5f6fa`,
            height: `10px`,
            width: `100%`,
            clipPath: `polygon(30% 0, calc(30% - 10px) 100%, calc(30% + 7px) 100%)`
        });
        let content = $(`<div></div>`);
        content.css({
            width: `100%`,
            background: `#f5f6fa`,
            maxHeight: `262px`,
            overflow: `hidden`,
            borderRadius: `5px`,
            boxShadow: `2px 2px 5px #535c68`,
            border: `solid 2px #f5f6fa`,
            borderTop: `solid 5px #f5f6fa`,
            borderBottom: `solid 5px #f5f6fa`
        });

        self.tips = $(`<article></article>`);

        // 组装
        content.append(self.tips);
        self.wrapper.append(fill);
        self.wrapper.append(content);
    }
}