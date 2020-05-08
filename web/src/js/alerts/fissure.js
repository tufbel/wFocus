/*
 * @Author: Lumoon 
 * @Date: 2019-12-09 22:10:15 
 * @Last Modified by: Lumoon
 * @Last Modified time: 2019-12-19 21:15:15
 * @description: 裂缝任务
 */



"use strict";

import msg from "../message.js";
import {
    AlertsBase,
    Resize,
} from "../alerts/alerts.js";

class Fissure extends AlertsBase {

    constructor() {
        super();

        this._init_element();

        this._run();
    }

    _run() {
        let self = this;

        self._add_click_listener();
        self._send_request();
    }

    _init_element() {
        let self = this;
        self.element = $(`li[fissure]`);
        self.content = self.element.parents(`[alert]`).find(`article[content] [fissure]`);
    }

    _send_request() {
        let self = this;

        wfpromise.post({
            url: self.base_url + `fissure`,
        }).then(response => {
            if (response.code == 200) {
                self._add_fissure_card(response.data);
            } else {
                msg.error_message(response.message);
            }
        });
    }

    _add_click_listener() {
        let self = this;

        self.element.click(function (e) {
            $(this).siblings().removeClass(`select`);
            $(this).addClass(`select`);
            self.content.siblings().hide();
            self.content.show();

            Resize.resize_element($(this).parents(`[alert]`)[0]);
        });
    }

    _add_fissure_card(data) {
        let self = this;
        self.content.html(``);

        let time_elements_map = new Map();

        for (const item of data) {
            let card = $(`
                <div alert-card>
                    <div alert-card-title>${item.missionType}</div>
                    <div alert-card-content></div>
                </div>
            `);
            let card_content = card.find(`[alert-card-content]`);

            card_content.append(self._init_alert_item(`normal`, item.node, `地点`));
            card_content.append(self._init_alert_item(`normal`, item.tier, `纪元`));
            card_content.append(self._init_alert_item(`normal`, item.enemy, `阵营`));

            let time_el = self._init_alert_item(`end`, item.expiry);
            card_content.append(time_el);

            time_elements_map.set(time_el[0], new Date(item.expiry));

            self.content.append(card);
        }

        self._change_time(time_elements_map);
        setInterval(self._change_time, 1000 * 3, time_elements_map);

        Resize.resize_element(self.element.parents(`[alert]`)[0]);
    }

    _change_time(time_elements_map) {
        for (const [key, time] of time_elements_map.entries()) {
            let [str, expiry_date] = window.time_difference(time);
            $(key).find(`span`).html(str);
            if (expiry_date < -3) {
                $(key).parents(`[alert-card]`).remove();
            }
        }
    }

}


new Fissure();