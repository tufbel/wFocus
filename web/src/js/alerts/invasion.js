/*
 * @Author: Lumoon 
 * @Date: 2019-12-09 13:37:14 
 * @Last Modified by: Lumoon
 * @Last Modified time: 2019-12-09 22:04:40
 * @description: 入侵任务
 */


"use strict";

import msg from "../message.js";
import {
    AlertsBase,
    Resize,
} from "../alerts/alerts.js";

class Invasion extends AlertsBase {

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
        self.element = $(`li[invasion]`);
        self.content = self.element.parents(`[alert]`).find(`article[content] [invasion]`);
    }

    _send_request() {
        let self = this;

        wfpromise.post({
            url: self.base_url + `invasions`,
        }).then(response => {
            if (response.code == 200) {
                self._add_invasion_card(response.data);
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

    _add_invasion_card(data) {
        let self = this;
        self.content.html(``);

        console.log(data);
        for (const item of data) {
            let card = $(`
                <div alert-card>
                    <div alert-card-content></div>
                </div>
            `);

            let attacker = $(`<div invasion-content></div>`);
            attacker.append(self._init_alert_item(`enemy`, item.attackingFaction, `入侵阵营`));
            attacker.append(self._init_alert_item(`enemy`, item.attackerReward.asString, `入侵奖励`));

            let defender = $(`<div invasion-content></div>`);
            defender.append(self._init_alert_item(`normal`, item.defendingFaction, `抵抗阵营`));
            defender.append(self._init_alert_item(`normal`, item.defenderReward.asString, `抵抗奖励`));

            let node_line = $(`
                <div class="content-line">
                    <span>${item.node.split('|')[0].trim()}</span>
                </div>
            `);

            let num = item.completion;
            num = num>0 ? num.toFixed(2):0;
            let progress_line = $(`
                <div class="content-line">
                    <span>${`${num}%`}</span>
                </div>
            `);

            let progress = $(`<div invasion-content></div>`);
            let progress_el = self._init_alert_progress(item.completion);
            progress_el.find(`span`).remove();
            progress.append(progress_el);

            let card_content = card.find(`[alert-card-content]`);
            card_content.append(attacker);
            card_content.append(node_line);
            card_content.append(defender);
            card_content.append(progress_line);
            card_content.append(progress);

            self.content.append(card);
        }

        Resize.resize_element(self.element.parents(`[alert]`)[0]);
    }
}


new Invasion();