/*
 * @Author: Lumoon 
 * @Date: 2019-12-08 15:46:25 
 * @Last Modified by: Lumoon
 * @Last Modified time: 2019-12-09 19:30:33
 * @description: 地球信息
 */

"use strict";

import msg from "../message.js";
import {
    AlertsBase,
    RenderTime,
} from "../alerts/alerts.js";

class Earth extends AlertsBase {

    constructor() {
        super();

        this._init_element();
        this._init_data();

        this._run();
    }

    _run() {
        let self = this;

        self._send_request();
    }

    _init_element() {
        let self = this;
        self.element = $(`section[earth]`);
    }

    _init_data() {
        let self = this;
        self.status = new Proxy({
            data: undefined,
            judge: false
        }, {
            get: (obj, key) => obj[key],
            set: (obj, key, value) => {
                obj[key] = value;

                if (key == `data`) {
                    let status_el = self.element.find(`[alert-title] span:nth-of-type(2)`);
                    let time_el = self.element.find(`[alert-footer] [alert-time]`);

                    if (value) {

                        RenderTime.add_time_dom(self.element[0], () => {

                            let [str, expiry_date] = time_difference(new Date(value.expiry));
                            time_el.html(`<span>${str}</span> <span>切换</span>`);

                            if (value.isDay) {
                                status_el.html(`<span><i class="iconfont icon-sunfill"></i>白昼</span>`);
                            } else {
                                status_el.html(`<span><i class="iconfont icon-yueliang"></i>黑夜</span>`);
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
    }

    _manage_mask() {
        let self = this;
        if (self.status.judge) {
            self.element.find(`[alert-mask]`).hide();
        } else {
            self.element.find(`[alert-mask]`).show();
        }
    }

    _send_request() {
        let self = this;

        self.status.data = undefined;

        wfajax.post({
            url: self.base_url + `earthCycle`,
            success: (response) => {
                if (response.code == 200) {
                    self.status.data = response.data;
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

new Earth();