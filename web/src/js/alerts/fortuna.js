/*
 * @Author: Lumoon 
 * @Date: 2019-12-08 12:37:44 
 * @Last Modified by: Lumoon
 * @Last Modified time: 2019-12-09 19:30:42
 * @description: 福尔图纳信息
 */

"use strict";

import msg from "../message.js";
import {
    AlertsBase,
    RenderTime,
    Resize,
} from "../alerts/alerts.js";

class Fortuna extends AlertsBase {

    constructor() {
        super();

        this._init_element();
        this._init_data();

        this._run();
    }

    _run() {
        let self = this;
        self._add_click_litener();

        self._send_request();
    }

    _init_element() {
        let self = this;
        self.element = $(`section[fortuna]`);
    }

    _init_data() {
        let self = this;
        self.status = new Proxy({
            data: undefined,
            judge: undefined
        }, {
            get: (obj, key) => obj[key],
            set: (obj, key, value) => {
                obj[key] = value;

                if (key == `data`) {
                    let status_el = self.element.find(`[alert-title] span:nth-of-type(2)`);
                    let time_el = self.element.find(`[alert-footer] [alert-time]`);

                    if (value) {
                        // let test_date = new Date();

                        RenderTime.add_time_dom(self.element[0], () => {

                            let [str, expiry_date] = time_difference(new Date(value.expiry));
                            // let [str, expiry_date] = time_difference(test_date);

                            time_el.html(`<span>${str}</span> <span>切换</span>`);

                            if (value.isWarm) {
                                status_el.html(`<span><i class="iconfont icon-flame"></i>温暖</span>`);
                            } else {
                                status_el.html(`<span><i class="iconfont icon-snow"></i>寒冷</span>`);
                            }

                            if (expiry_date < -3)
                                self._send_request();

                        });

                        self.status.judge = true;

                    } else {
                        RenderTime.delete_time_dom(self.element[0]);
                        status_el.html(``);
                        time_el.html(``);
                        self.status.judge = false;
                    }

                } else if (key == `judge`) {
                    self._manage_mask();
                }

                return true;
            }
        });

        self.fortuna = new Proxy({
            data: undefined,
            judge: undefined
        }, {
            get: (obj, key) => obj[key],
            set: (obj, key, value) => {
                obj[key] = value;

                if (key == `data`) {
                    let ul_el = self.element.find(`[alert-content-page]`);
                    let page_el = self.element.find(`[alert-page]`);
                    ul_el.parent().attr(`alert-content-border`, ``);
                    ul_el.html(``);
                    if (value) {
                        value.forEach((item, index, array) => {
                            let li = $(`<li>${index + 1}</li>`);
                            ul_el.append(li);
                        });
                        ul_el.children()[0].click();
                        self.fortuna.judge = true;
                    } else {
                        ul_el.parent().removeAttr(`alert-content-border`);
                        page_el.html(``);
                        Resize.resize_element(self.element[0]);
                        self.fortuna.judge = false;
                    }
                } else if (key == `judge`) {
                    self._manage_mask();
                }

                return true;
            }
        });
    }

    _manage_mask() {
        let self = this;
        if (self.status.judge && self.fortuna.judge) {
            self.element.find(`[alert-mask]`).hide();
        } else {
            self.element.find(`[alert-mask]`).show();
        }
    }

    _add_click_litener() {
        let self = this;
        self.element.find(`[alert-content-page]`).on(`click`, `li`, function (e) {
            $(e.delegateTarget).children().removeClass(`select`);
            $(this).addClass(`select`);

            let page_el = $(e.delegateTarget).next();
            let data = self.fortuna.data[$(this).index()];

            page_el.html(``);
            data.rewards.forEach((item, index, arr) => {
                let element = self._init_alert_item(item.rarity, item.itemName);
                page_el.append(element);
            });
            Resize.resize_element(self.element[0]);
        })
    }

    _send_request() {
        let self = this;
        self.fortuna.data = undefined;
        self.status.data = undefined;

        wfajax.post({
            url: self.base_url + `solaris`,
            success: (response) => {
                if (response.code == 200) {
                    self.fortuna.data = response.data;
                } else {
                    msg.error_message(response.message);
                }
            },
            fail: (error) => {
                console.error(error);
            }
        });

        wfajax.post({
            url: self.base_url + `vallisCycle`,
            success: (response) => {
                if (response.code == 200) {
                    self.status.data = response.data;
                    console.log(self.status.data);
                } else {
                    msg.error_message(response.message);
                }
            },
            fail: (error) => {
                console.error(error);
            }
        });
    }
}

new Fortuna();