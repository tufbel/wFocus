/*
 * @Author: Lumoon 
 * @Date: 2019-11-11 12:22:59 
 * @Last Modified by: Lumoon
 * @Last Modified time: 2019-11-12 15:18:25
 * @description: 自定义滚动条
 */

"use strict";

$(function () {

    let scroll_map = new Map();

    let box = $(`.scrollBox`);
    box.css({
        overflow: `hidden`,
        position: (index, value) => (value == `static`) ? `relative` : value
    });

    box.each(function (index) {
        let box = {};
        if ($(this).children(`.scrollbar`).length <= 0) {
            let content = [...$(this).children()].pop();

            $(content).css({
                position: (index, value) => (value == `static`) ? `relative` : value
            });

            box.content_height = $(content).outerHeight();
            box.box_height = $(this).innerHeight();
            box.max_move = box.content_height - box.box_height;
            box.scrollbar = new Scrollbar();

            console.log(box.content_height);
            console.log(box.box_height);
            console.log(box.max_move);

            let thumb_height = (box.box_height / box.content_height) * box.box_height;
            box.scrollbar.thumb.css({
                height: `${thumb_height}px`
            });


            box.box_height < box.content_height ? box.scrollbar.scrollbar.show() : box.scrollbar.scrollbar.hide();
            $(this).append(box.scrollbar.scrollbar);

            $(this).on(`wheel`, function (event) {
                event.preventDefault();

                // TODO:计算每次滚动距离

                if (event.originalEvent.deltaY > 0) {
                    $(this).children(`article:not(:animated)`).animate({
                        top: `-${box.max_move}px`
                    }, 1000, function () {
                        console.log($(this).css(`top`));
                    });
                } else {
                    $(this).children(`article:not(:animated)`).animate({
                        top: `0px`
                    }, 1000, function () {
                        console.log($(this).css(`top`));
                    });
                }
            });

            // $(this).on(`CheckboxStateChange`, function () {
            //     console.log("html代码发生变化");
            // });

            // setTimeout(() => {
            //     $(this).triggerHandler(`CheckboxStateChange`);
            //     console.log("内容改变");
            // }, 3000)
            // console.table(box);
        }



        // if ($(this).innerHeight() < content.outerHeight()) {

        //     let bar = new Scrollbar();
        //     // $(this).prepend(bar.scrollbar);
        // }
    });

})

class Scrollbar {

    constructor() {

        this._initScrollbar();
        this._run();
    }

    _run() {
        let self = this;

        self._bar_hover();
    }

    _initScrollbar() {
        let self = this;

        self.scrollbar = $(`<aside class="scrollbar"></aside>`);
        self.thumb = $(`<div></div>`);

        self.scrollbar.css({
            position: `absolute`,
            background: `rgba(210, 208, 208, 0.1)`,
            right: `0`,
            top: `0`,
            bottom: `0`,
            width: `6px`,
            cursor: `pointer`
        });
        self.thumb.css({
            width: `100%`,
            height: `20px`,
            background: `rgba(182, 184, 187, 0.6)`,
            borderRadius: `3px`
        });
        self.scrollbar.append(self.thumb);
    }

    _bar_hover() {
        let self = this;
        self.scrollbar.hover(function () {
            self.scrollbar.css({
                background: `rgba(210, 208, 208, 0.3)`
            });
            self.thumb.css({
                background: `rgba(0, 0, 0, 0.712)`
            });

        }, function () {
            self.scrollbar.css({
                background: `rgba(210, 208, 208, 0.1)`
            });
            self.thumb.css({
                background: `rgba(182, 184, 187, 0.6)`
            });
        });
    }
}