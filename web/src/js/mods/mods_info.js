/*
 * @Author: Lumoon 
 * @Date: 2019-11-20 13:50:39 
 * @Last Modified by: Lumoon
 * @Last Modified time: 2019-12-19 14:20:48
 * @description: MOD信息显示控制
 */

"use strict";

import interaction from "../modules_interaction.js";
import msg from "../message.js";

class ModsInfo {

    constructor() {
        this.mods_map = new Map();

        let elements = this._init_element();
        this._run(elements);
    }
    _run(elements) {
        let self = this;
        self._hide_mods = self._add_hide_listener(elements.mask_el, elements.mods_el);
        self.show_mods = self._add_show_listener(elements.mask_el, elements.mods_el);

        self._get_all_mods(elements);
        self._add_remove_click_listener(elements.remove_mods_el);
        self._add_search_listener();
    }

    _init_element() {
        let self = this;
        let elements = {};
        elements.mask_el = $(`<div class="mods-mask" style="display: none;"></div>`);
        elements.mods_el = $(`<article class="mods"></article>`);
        self.search_mods = $(`<input type="text" />`);
        let mods_search = $(` 
            <div class="mods-search">
                <div>
                    <div>请输入名称/属性关键字</div>
                </div>
            </div>
        `);
        elements.filter_mods_el = $(`<ul class="mods-filter"></ul>`);
        elements.info_mods_el = $(`<article class="mods-info"></article>`);
        elements.remove_mods_el = $(`<i class="mods-remove iconfont icon-Closewindowicon"></i>`);

        mods_search.children(`div`).prepend(self.search_mods);
        elements.mask_el.append(elements.mods_el);
        elements.mods_el.append(mods_search);
        elements.mods_el.append(elements.filter_mods_el);
        elements.mods_el.append(elements.info_mods_el);
        elements.mods_el.append(elements.remove_mods_el);

        $(`.wf-main`).after(elements.mask_el);
        return elements;
    }

    _add_remove_click_listener(hide) {
        let self = this;
        hide.click(function (e) {
            e.preventDefault();
            self._hide_mods();
            if (interaction.now_selected_modbox)
                interaction.now_selected_modbox = null;
        });
    }

    _add_hide_listener(mask, mods) {
        return () => {
            mods.css({
                transform: `perspective(1000px) rotateX(90deg)`
            });
            setTimeout(() => {
                mask.hide();
            }, 200);
        }
    }

    _add_show_listener(mask, mods) {
        let self = this;
        return (mods_in) => {
            let now_selected_modbox = interaction.now_selected_modbox;
            if (now_selected_modbox) {
                let modbox_type = now_selected_modbox[1].type;
                self._manage_show_mods(modbox_type, mods_in);
                self._filter_mods_by_input(``);
                mask.show();
                mods.css({
                    transform: `perspective(1000px) rotateX(0deg)`
                });
                $(self.polarity_filter[0]).click();
            }
        }
    }

    _get_all_mods(elements) {
        let self = this;
        wfajax.post({
            url: `${window.location.pathname}/mods`,
            success: (response) => {
                if (response.code == 200) {
                    self._add_all_mods(response.data, elements);
                } else {
                    msg.error_message(`MOD数据请求失败：${response.message}`);
                }
            },
            fail: (error) => {
                console.log(`服务崩溃${error}`);
            }
        });
    }

    _add_all_mods(data, elements) {
        let self = this;
        let polarity_set = new Set();

        for (const item of data) {
            polarity_set.add(item.polarity);

            let mod = $(`
                <section class = "mod ${item.polarity}" data-show="false">
                    <span class="mod-name">${item.name}</span>&ensp;
                    <span class="mod-size">${item.base_drain+item.fusion_limit}</span>
                    <div class="mod-property">
                        ${Object.entries(item.property).map(([name,up]) => {
                            return `<span>${name} ${up}</span>`
                        }).join("")}
                    </div>
                </section>
            `);

            elements.info_mods_el.append(mod);
            self.mods_map.set(mod[0], item);
        }

        self.polarity_filter = [];
        let all = $(`<li class="all select-filter" data-filter="all">全部</li>`);
        elements.filter_mods_el.append(all);
        self.polarity_filter.push(all[0]);

        polarity_set.forEach((item, key) => {
            let el = $(`<li class="${item}" data-filter="${item}"><i class="iconfont icon-${item}_px"></i><span>&ensp;${item}</span></li>`);
            elements.filter_mods_el.append(el);
            self.polarity_filter.push(el[0]);
        });

        self._add_filter_listener();
        self._add_mods_click_listener();
    }

    _add_mods_click_listener() {
        let self = this;
        $([...self.mods_map.keys()]).click(function (e) {
            e.preventDefault();
            // 将选择的MOD传递给modboxs
            interaction.now_selected_mod = self.mods_map.get(this);
            // TODO 隐藏界面调整配置
            self._hide_mods();
            if (interaction.adjust_modboxs)
                interaction.adjust_modboxs();
        });
    }

    _manage_show_mods(type = null, mods_in = null) {
        let self = this;
        if (type) {
            if (type.toUpperCase() == `Normal`.toUpperCase()) {
                for (const [key, value] of self.mods_map.entries()) {
                    if (value[`type`].toUpperCase() != `Aura`.toUpperCase()) {
                        $(key).attr(`data-show`, `true`);
                    } else {
                        $(key).attr(`data-show`, `false`);
                    }
                    if (mods_in && mods_in.has(value))
                        $(key).attr(`data-show`, `false`);
                }
            } else if (type.toUpperCase() == `Aura`.toUpperCase()) {
                for (const [key, value] of self.mods_map.entries()) {
                    if (value[`type`].toUpperCase() == `Aura`.toUpperCase()) {
                        $(key).attr(`data-show`, `true`);
                    } else {
                        $(key).attr(`data-show`, `false`);
                    }
                    if (mods_in && mods_in.has(value))
                        $(key).attr(`data-show`, `false`);
                }
            } else {
                $(key).attr(`data-show`, `false`);
            }

        } else {
            for (const [key, value] of self.mods_map.entries()) {
                $(key).attr(`data-show`, `false`);
            }
        }
    }

    _add_search_listener() {
        let self = this;
        self.search_mods.on(`input propertychange`, function (e) {
            let value = this.value;
            let timer = setTimeout(() => {
                let new_value = this.value
                if (new_value.trim() == value.trim()) {
                    self._filter_mods_by_input(value.trim());
                }
            }, 360);
        });

        // self.search_mods.keyup(function (e) {
        //     if (e.keyCode == 13 || e.keyCode == 8) {
        //         let value = this.value;
        //         self._filter_mods_by_input(value.trim());
        //     }
        // });
    }

    _filter_mods_by_input(value) {
        let self = this;
        if (value) {
            let re_str = new RegExp([...value].join(`[\\s\\S]*`), `i`);
            for (const element of self.mods_map.keys()) {
                let text = element.textContent.replace(/\s*/g, ``);
                if (re_str.exec(text)) {
                    $(element).attr(`data-filter`, `true`);
                } else {
                    $(element).attr(`data-filter`, `false`);
                }
            }
        } else {
            for (const element of self.mods_map.keys()) {
                $(element).attr(`data-filter`, `true`);
            }
        }
    }

    _add_filter_listener() {
        let self = this;
        $(self.polarity_filter).click(function (e) {
            e.preventDefault();
            $(self.polarity_filter).removeClass(`select-filter`);
            $(this).addClass(`select-filter`);

            let filter_polarity = $(this).attr(`data-filter`);
            if (filter_polarity.toUpperCase() == `all`.toUpperCase()) {
                for (const [div, mod] of self.mods_map.entries()) {
                    $(div).attr(`data-polarity-filter`, `true`);
                    // if ($(div).attr(`data-show`).toUpperCase() != `false`.toUpperCase()) {
                    //     $(div).attr(`data-polarity-filter`, `true`);
                    // } else {
                    //     $(div).attr(`data-filter`, `false`);
                    // }
                }
            } else {
                for (const [div, mod] of self.mods_map.entries()) {
                    if (filter_polarity.toUpperCase() == mod[`polarity`].toUpperCase()) {
                        $(div).attr(`data-polarity-filter`, `true`);
                    } else {
                        $(div).attr(`data-polarity-filter`, `false`);
                    }
                }
            }
        });
    }

}

let mods = new ModsInfo();

interaction.show_mods = mods.show_mods;