/*
 * @Author: Lumoon 
 * @Date: 2019-12-10 11:39:59 
 * @Last Modified by: Lumoon
 * @Last Modified time: 2019-12-10 13:23:54
 * @description: 异步测试
 */


"use strict";

let timer = setInterval((...args) => {
    console.log(timer);
    clearInterval(timer);
    console.log(args);
}, 1000, 1, 2, 3);


class ButtonJudge {

    constructor() {
        this.resolve = undefined;

        this._init_element();
        this._run();
    }

    _run() {
        let self = this;

        self._add_click_listener();
    }

    _init_element() {
        let self = this;
        self.div = $(`div`);
        self.t = self.div.find(`input`);
    }
    _add_click_listener() {
        let self = this;

        self.t.click(function (e) {
            e.preventDefault()
            if (this.value == `是`) {
                if (self.resolve)
                    self.resolve(true);
            } else {
                if (self.resolve)
                    self.resolve(false);
            }
            console.log(self);

            self.resolve = null;
            console.log(self);

            self.div.hide();
        });
    }

    show_div() {
        let self = this;

        self.div.show();

        return new Promise((resolve, reject) => {
            self.resolve = resolve;
        })
    }
}

let j = new ButtonJudge();

$(`[value="显示"]`).click(getJudge);

async function getJudge(e) {
    console.log(`等待用户确定`);

    let result = await j.show_div();
    if (result) {
        $(`body`).css(`background`, `red`);
    } else {
        $(`body`).css(`background`, `blue`);
    }
}