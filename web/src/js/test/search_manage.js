/*
 * @Author: Lumoon 
 * @Date: 2019-12-19 16:02:38 
 * @Last Modified by: Lumoon
 * @Last Modified time: 2019-12-19 20:59:27
 * @description: 搜索提示管理
 */
"use strict";

class SearchManage {

    constructor() {
        this.tag_list = [];
        this._init_element();

        this._run();
    }

    _run() {
        let self = this;

        self._request_warframe_tag();
        self._request_weapon_tag();

        self._add_search_listener();
    }

    _init_element() {
        let self = this;

        let header_input = $(`.header-search`);
        self.input = header_input.find(`.search-input`);
        self.hint = header_input.find(`.search-hint`);
    }

    _request_warframe_tag() {
        let self = this;
        let data = [{
                name: `Mesa`,
                type: `战甲`,
                url: `#`
            },
            {
                name: `Mesa Prime`,
                type: `战甲`,
                url: `#`
            },
            {
                name: `Mesa Rhino`,
                type: `战甲`,
                url: `#`
            },
        ];

        self._render_tag(data, `warframe`);
    }
    _request_weapon_tag() {
        let self = this;
        let data = [{
                name: `捕月`,
                type: `武器`,
                url: `#`
            },
            {
                name: `螺钉步枪`,
                type: `武器`,
                url: `#`
            },
            {
                name: `雷霆`,
                type: `武器`,
                url: `#`
            },
        ];

        self._render_tag(data, `weapon`);
    }

    _render_tag(data, type) {
        let self = this;
        let content = self.hint.children(`div`);

        for (const tag of data) {
            let el = $(`
                <a class="search-hint-tag" href="${tag.url}" search-filter="false">
                    <span class="span-${type}-tag">${tag.type}</span>
                    <span>${tag.name}</span>
                </a>
            `);

            self.tag_list.push(el[0]);
            content.append(el);
        }
    }

    _add_search_listener() {
        let self = this;
        self.input.on(`input propertychange`, function (e) {
            let value = this.value.trim();
            if (value) {
                let re_str = new RegExp([...value].join(`[\\s\\S]*`), `i`);
                self._manage_search(re_str);
            } else {
                self.hint.hide();
            }
        });
    }

    _manage_search(re_str) {
        let self = this;
        let judge = false;

        for (const tag of self.tag_list) {
            let text = tag.textContent.replace(/\s*/g, ``);
            if (re_str.exec(text)) {
                $(tag).attr(`search-filter`, `true`);
                judge = true;
            } else {
                $(tag).attr(`search-filter`, `false`);
            }
        }
        if (judge) {
            self.hint.show();
        } else {
            self.hint.hide();
        }
    }
}

let search_manage = new SearchManage();