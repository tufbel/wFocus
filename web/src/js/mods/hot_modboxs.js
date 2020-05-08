/*
 * @Author: Lumoon 
 * @Date: 2019-11-23 22:30:02 
 * @Last Modified by: Lumoon
 * @Last Modified time: 2019-12-19 14:06:03
 * @description: 热门配卡界面
 */

"use strict";
import interaction from "../modules_interaction.js";
import msg from "../message.js";

class HotModBoxs {

    constructor() {
        this.page = 0;
        this.hot_modboxs_map = new Map();
        this.query_judge = false;

        this._init_element();
        this._run();
    }

    _run() {
        let self = this;
        self._get_all_hot_modboxs();
        self._add_window_transform_listener();
        self._add_adjust_listener();
        self._add_scroll_listener();
        $(window).resize();
    }
    _init_element() {
        let self = this;
        if (/weapons/i.test(window.location.pathname))
            self.hot_modboxs = $(`<article class="hot-modboxs weapon-hot-modboxs col-lg-8 col-md-7 col-sm-12"></article>`);
        else
            self.hot_modboxs = $(`<article class="hot-modboxs col-lg-8 col-md-12 col-sm-12"></article>`);

        let div = $(`<div></div>`);
        let hot_tag = $(`<p class="hot-tag">hot<span></span><span></span><span></span><span></span></p>`);
        let hot_header = $(`<div class="hot-header">热门配卡</div>`);
        self.hot_main = $(`
            <div class="hot-main">
                <div>
                    <div class="not-hot-main-modbox">当前栏目无热门配卡，期待您的分享！</div>
                </div>
            </div>
            `);

        self.hot_modboxs.append(div);
        div.append(hot_tag);
        div.append(hot_header);
        div.append(self.hot_main);

        $(`.wf-main`).append(self.hot_modboxs);
    }

    _add_window_transform_listener() {
        let self = this;
        $(window).resize(() => {
            self._change_hot_modboxs_rows();
        });
    }

    _change_hot_modboxs_rows() {
        let self = this;
        let out_height = self.hot_modboxs.outerHeight();
        let rows = Math.ceil(out_height / 120);
        self.hot_modboxs.css(`grid-row-end`, `span ${rows}`);
    }

    _get_all_hot_modboxs() {
        let self = this;
        if (!self.query_judge) {
            self.query_judge = true;
            wfajax.post({
                url: `${window.location.pathname}/hotmodboxs/?page=${++self.page}`,
                success: (response) => {
                    if (response.code == 200) {
                        if (self.page == 1) {
                            self.hot_main.children(`div`).html(``);
                        }
                        self._add_all_hot_modboxs(response.data);
                    } else if (response.code == 400) {
                        let content_height = self.hot_main.children(`div`).height();
                        let visible_height = self.hot_main.height();
                        if (visible_height < content_height)
                            msg.prompt_message(`${response.message}`);

                        self.hot_main.off(`scroll`);
                        self.page--;
                    } else {
                        msg.error_message(`MOD数据请求失败：${response.message}`);
                        self.page--;
                    }
                    self.query_judge = false;
                },
                fail: (error) => {
                    console.log(`服务崩溃${error}`);
                    self.page--;
                    self.query_judge = false;
                }
            });
        }
    }

    _add_scroll_listener() {
        let self = this;
        self.hot_main.on(`scroll`, function (e) {
            let content_height = $(this).children(`div`).height() + 15;
            let visible_height = $(this).height();
            let scroll_height = $(this).scrollTop() + visible_height;
            if (scroll_height >= content_height) {
                self._get_all_hot_modboxs();
            }
        });
    }

    _add_all_hot_modboxs(modboxs_data) {
        let self = this;
        // TODO 添加热门配卡
        let content_div = self.hot_main.children(`div`);

        for (const item of modboxs_data) {
            let hot_main = $(`
                <section class="hot-main-modbox">
                    <div class="hot-mods">
                ${Object.entries(item.modboxs).map(([index, modbox]) => {
                    let mod = modbox.mod;
                    let html = ``;
                    if (mod) {
                        html += `
                        <section class="hot-mod">
                            <section class="hot-mod-front">${mod.name}</section>
                            <section class="hot-mod-back">
                                <div>
                                ${Object.entries(mod.property).map(([name,up]) => {
                                    return `<span>${name} ${up}</span>`
                                }).join("")}
                                </div>
                            </section>
                        </section>
                        `;
                    } 
                    return html
                }).join("")}
                    </div>
                    <div class="hot-function">
                        <div>
                            <i class="iconfont icon-up"></i>
                            <span>作者：${item.wfuser.username}</span>
                        </div>
                        <div class="hot-function-adjust">
                            <i class="iconfont icon-setting"></i>
                            <span>一键配置</span>
                        </div>
                    </div>
                </section>
            `);
            let adjust = hot_main.find(`.hot-function-adjust`);
            self.hot_modboxs_map.set(adjust[0], item.modboxs);
            content_div.append(hot_main);
        }
        $(window).resize();
    }

    _add_adjust_listener() {
        let self = this;
        self.hot_main.on(`click`, `.hot-function-adjust`, function () {
            if (interaction.auto_adjust_modboxs) {
                let modboxs = copy(self.hot_modboxs_map.get(this));
                interaction.auto_adjust_modboxs(modboxs);
            }
        });
    }
}

let hot_modboxs = new HotModBoxs();