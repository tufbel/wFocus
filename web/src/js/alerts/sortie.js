/*
 * @Author: Lumoon 
 * @Date: 2019-12-08 13:17:12 
 * @Last Modified by: Lumoon
 * @Last Modified time: 2019-12-09 21:58:40
 * @description: 突击任务信息
 */

"use strict";

import msg from "../message.js";
import {
    AlertsBase,
    Resize,
} from "../alerts/alerts.js";

class Sortie extends AlertsBase {

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
        self.element = $(`section[sortie]`);
    }

    _send_request() {
        let self = this;

        wfajax.post({
            url: self.base_url + `sortie`,
            success: (response) => {
                if (response.code == 200) {
                    self._add_sortie_element(response.data);
                } else {
                    msg.error_message(response.message);
                }
            },
            fail: (error) => {
                console.error(error);
            }
        });

    }

    _add_sortie_element(data) {
        if (!data)
            return;

        let self = this;
        let content_el = self.element.find(`[alert-content] > div`);
        let time_el = self.element.find(`[alert-footer] [alert-time]`);
        let mask_el = self.element.find(`[alert-mask]`);

        time_el.html(`<span>每日0时</span> <span>切换</span>`);
        // content_el.attr(`alert-content-border`, ``);

        let boss_el = self._init_alert_item(`normal`, data.boss[0], `阵营头目`);
        let faction_el = self._init_alert_item(`enemy`, data.faction, `阵营`);
        content_el.append(boss_el);
        content_el.append(faction_el);

        data.variants.forEach((item, index, arr) => {
            let card = $(`
                <div alert-card>
                    <div alert-card-title>任务${index+1}: ${item.missionType}</div>
                    <div alert-card-content></div>
                </div>
            `);

            let node = self._init_alert_item(`mission`, item.node, `任务地点`);
            let limiters = self._init_alert_item(`mission`, item.modifier, `任务模式`);
            let card_content = card.find(`[alert-card-content]`);

            card_content.append(node);
            card_content.append(limiters);

            content_el.append(card);
        });

        Resize.resize_element(self.element[0]);
        mask_el.hide();
    }

}
new Sortie();