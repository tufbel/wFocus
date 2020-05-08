/*
 * @Author: Lumoon 
 * @Date: 2019-11-08 20:24:50 
 * @Last Modified by: Lumoon
 * @Last Modified time: 2019-12-19 21:28:47
 * @description: 页眉特效控制。
 */
"use strict";


class HeaderManage {

    constructor() {
        this.nav_judge = $("#nav-judge");
        this.search_judge = $("#search-judge");

        this._run()
    }

    _run() {
        let self = this;
        self._manage();
    }

    /**
     * 控制导航栏与搜索框只能展开一个。
     */
    _manage() {
        let self = this;
        self.nav_judge.change(function (e) {
            e.preventDefault();
            if (this.checked) {
                let element = self.search_judge.get(0);
                if (element.checked) {
                    element.checked = false;
                }
            }
        });
        self.search_judge.change(function (e) {
            e.preventDefault();
            if (this.checked) {
                let element = self.nav_judge.get(0);
                if (element.checked) {
                    element.checked = false;
                }
            }
        });
    }
}

class UserManage {

    constructor() {
        this._run();
    }
    _run() {
        let self = this;

        self._add_change_listener();
    }

    _add_change_listener() {
        let self = this;
        $(`[for="name-editor-judge"]`).click(function (e) {
            let input = $(this).prevAll(`[type="text"]`);
            self.username = input.val();
            input.attr(`disabled`, false);
            input.val(``);
            input.focus();
        });

        let username_re = /^[a-zA-Z][_a-zA-Z0-9]{2,19}$/;
        $(`.user-name`).blur(function () {
            let input = this.value;
            if (username_re.test(input) && input != self.username) {
                wfajax.post({
                    url: `/account/change_name`,
                    data: {
                        username: input
                    },
                    success: (response) => {
                        if (response.code == 200) {
                            self.username = input;
                        } else {
                            this.value = self.username;
                        }
                    },
                    fail: (error) => {
                        this.value = self.username;
                        console.log(`服务崩溃${error}`);
                    }
                });
            } else {
                this.value = self.username;
            }
            $(this).next().click();
            $(this).attr(`disabled`, true);
        })

        $(`.user-name`).keydown(function (e) {
            if (e.keyCode == 13) {
                $(this).blur();
            }
        });
    }

}

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
        self._add_blur_search_listener();
    }

    _init_element() {
        let self = this;

        let header_input = $(`.header-search`);
        self.input = header_input.find(`.search-input`);
        self.hint = header_input.find(`.search-hint`);
    }

    _request_warframe_tag() {
        let self = this;

        wfpromise.post({
            url: `/warframes/tag`,
        }).then(response => {
            if (response.code == 200) {
                self._render_tag(response.data, `warframe`);
            } else {
                console.log(response.message);
            }
        });
    }
    _request_weapon_tag() {
        let self = this;

        wfpromise.post({
            url: `/weapons/tag`,
        }).then(response => {
            if (response.code == 200) {
                self._render_tag(response.data, `weapon`);
            } else {
                console.log(response.message);
            }
        });
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

    _add_blur_search_listener() {
        let self = this;
        self.input.blur(function (e) {
            self.hint.hide();
            for (const tag of tag_list) {
                $(tag).attr(`search-filter`, `false`);
            }
        });
    }
}

let header_manage = new HeaderManage();
let user_manage = new UserManage();
let search_manage = new SearchManage();