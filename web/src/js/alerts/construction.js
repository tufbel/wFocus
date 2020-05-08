/*
 * @Author: Lumoon 
 * @Date: 2019-12-08 16:08:24 
 * @Last Modified by: Lumoon
 * @Last Modified time: 2019-12-08 17:02:08
 * @description: 建造进度
 */

"use strict";

import msg from "../message.js";
import {
    AlertsBase,
    Resize,
} from "../alerts/alerts.js";

class Construction extends AlertsBase {

    constructor() {
        super();

        this._init_element();

        this._run();
    }

    _run() {
        let self = this;

        self._send_request();
    }

    _init_element() {
        let self = this;
        self.element = $(`section[construction]`);
    }

    _send_request() {
        let self = this;

        wfajax.post({
            url: self.base_url + `constructionProgress`,
            success: (response) => {
                if (response.code == 200) {
                    self._add_progress_element(response.data);
                } else {
                    msg.error_message(response.message);
                }
            },
            fail: (error) => {
                console.error(error);
            }
        });
    }

    _add_progress_element(data) {
        if (!data)
            return;
        let self = this;

        let content_el = self.element.find(`[alert-content] > div`);
        let mask_el = self.element.find(`[alert-mask]`);
        let footer_el = self.element.find(`[alert-footer]`);

        let fomorian = $(`<div></div>`);
        fomorian.css(`padding`, `16px 0`);

        let fomorian_p = $(`<p>巨人战舰</p>`);
        fomorian_p.css({
            fontWeight: `bold`,
            margin: `0px auto 6px 6px`,
        });

        let fomorian_progress = self._init_alert_progress(data.fomorianProgress);

        fomorian.prepend(fomorian_p);
        fomorian.append(fomorian_progress);
        content_el.append(fomorian);

        let line = $(`<div class="line"></div>`);
        content_el.append(line);

        let razorback = $(`<div></div>`);
        razorback.css(`padding`, `16px 0`);

        let razorback_p = $(`<p>利刃豺狼</p>`);
        razorback_p.css({
            fontWeight: `bold`,
            margin: `0px auto 6px 6px`,
        });

        let razorback_progress = self._init_alert_progress(data.razorbackProgress);

        razorback.prepend(razorback_p);
        razorback.append(razorback_progress);
        content_el.append(razorback);


        footer_el.remove();
        mask_el.hide();
        Resize.resize_element(self.element[0]);

    }
}

new Construction();