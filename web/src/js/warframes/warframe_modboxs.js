/*
 * @Author: Lumoon 
 * @Date: 2019-11-20 13:50:39 
 * @Last Modified by: Lumoon
 * @Last Modified time: 2019-12-02 16:17:03
 * @description: 配置槽控制
 */

"use strict";

import interaction from "../modules_interaction.js";
import msg from "../message.js";

class WarframeModBoxs {

    constructor() {
        this.modboxs_map = new Map();

        this._init_element();
        this._run();
    }

    _run() {
        let self = this;
        self.adjust_modboxs = self._adjust_modboxs();
        self.auto_adjust_modboxs = self._auto_adjust_modboxs();
        self._add_polarity_listener();
        self._add_addmod_listener();
        self._add_share_listener();
    }

    _init_element() {
        let self = this;
        let modboxs = $(`<article class="modboxs col-lg-8 col-md-7 col-sm-12"><div></div></article>`);
        let modbox_div = modboxs.children(`div`);

        for (let index in [...Array(10).keys()]) {
            let modbox = $(`
                <section class="modbox">
                    <div class="polarity" data-polarity="Null">
                        <i class="iconfont icon-add" data-polarity="Null"></i>
                        <i class="iconfont icon-Madurai_px" data-polarity="Madurai"></i>
                        <i class="iconfont icon-Naramon_px" data-polarity="Naramon"></i>
                        <i class="iconfont icon-Vazarin_px" data-polarity="Vazarin"></i>
                        <i class="iconfont icon-Zenurik_px" data-polarity="Zenurik"></i>
                        <i class="iconfont icon-Umbra_px" data-polarity="Umbra"></i>
                    </div>
                    <div class="modbox-manage">
                        <i class="iconfont icon-add" name="modbox-add"></i>
                    </div>
                </section>
            `);
            modbox_div.append(modbox);
            self.modboxs_map.set(modbox[0], {
                polarity: `Null`,
                type: index == 0 ? `Aura` : `Normal`,
                mod: null
            });
        }
        let modboxs_function = $(`<div class="modboxs-function"></div>`);
        self.share = $(`<i class="modboxs-share iconfont icon-share"></i>`);
        modboxs_function.append(self.share);

        modbox_div.append(modboxs_function);
        $(`.wf-main`).append(modboxs);
    }

    _add_polarity_listener() {
        let self = this;
        let polaritys = $([...self.modboxs_map.keys()]).children(`.polarity`);
        polaritys.children().click(function (e) {
            let polarity = $(this).parent();
            let polarity_str = $(this).attr(`data-polarity`);
            polarity.attr(`data-polarity`, polarity_str);
            polarity.css(`width`, `10px`);
            setTimeout(() => {
                polarity.css(`width`, ``);
            }, 200);
            let add = polarity.next().children(`i`);
            add.attr(`class`, $(this).attr(`class`));
            self.modboxs_map.get(polarity.parent()[0]).polarity = polarity_str;
        });
    }

    _add_addmod_listener() {
        let self = this;
        $([...self.modboxs_map.keys()]).on(`click`, `.modbox-manage>i`, function (e) {
            interaction.now_selected_modbox = [e.delegateTarget, self.modboxs_map.get(e.delegateTarget)];
            let mods_in_modboxs_set = new Set();
            for (const modbox of self.modboxs_map.values()) {
                if (modbox.mod)
                    mods_in_modboxs_set.add(modbox.mod);
            }
            if (interaction.show_mods)
                interaction.show_mods(mods_in_modboxs_set);
        });
    }

    /**
     * @description 调整单一配置槽
     */
    _adjust_modboxs() {
        let self = this;
        return () => {
            // TODO 执行配制槽调整
            if (interaction.get_size && interaction.now_selected_modbox && interaction.now_selected_mod) {
                let judge = self._adjust_modboxs_judge();
                if (judge) {
                    // 可放置，更新配置操
                    let modbox_select = interaction.now_selected_modbox[0];
                    let mod_select = interaction.now_selected_mod;
                    // 1.添加新Mod
                    self._update_modbox(modbox_select, mod_select);
                    // 2.向后台请求信息
                    self._change_warframe_info();
                } else {
                    // 弹窗提示不能放
                    msg.error_message(`放置失败，请检查配置槽容量。`);
                }
                interaction.now_selected_modbox = null;
                interaction.now_selected_mod = null;
            }
        }
    }

    /**
     * @description 配置槽可否放置配卡判断
     */
    _adjust_modboxs_judge() {
        let self = this;
        let size = interaction.get_size();
        let modbox_select = interaction.now_selected_modbox[1];
        let mod_select = interaction.now_selected_mod;
        // TODO 调整判断
        // 1.判断是否为光环槽。光环槽调整max；非光环槽调整now
        // 2.判断当前槽上有无MOD。若有MOD执行3；若无MOD执行4。
        // 3.先将已有MOD的容量计算出来，从对应属性上扣除。
        // 4.将新选择的MOD消耗容量计算并在对应属性添加。
        // 5.比较now与max大小。若now小于等于max则可添加，若now大于max则不可添加。
        if (modbox_select[`type`].toUpperCase() == `Aura`.toUpperCase()) {
            let polarity = modbox_select.polarity;
            let mod_in = modbox_select.mod;
            // 判断原本是否有MOD
            if (mod_in) {
                let consumption = mod_in.base_drain + mod_in.fusion_limit;
                if (polarity.toUpperCase() == `Null`.toUpperCase()) {} else if (polarity.toUpperCase() == mod_in.polarity.toUpperCase()) {
                    consumption = consumption * 2;
                } else {
                    consumption = consumption - Math.round(consumption / 4);
                }
                size.max = size.max - consumption;
            }
            // 添加新MOD导致Size容量变化
            let new_consumption = mod_select.base_drain + mod_select.fusion_limit;
            if (polarity.toUpperCase() == `Null`.toUpperCase()) {} else if (polarity.toUpperCase() == mod_select.polarity.toUpperCase()) {
                new_consumption = new_consumption * 2;
            } else {
                new_consumption = new_consumption - Math.round(new_consumption / 4);
            }
            size.max = size.max + new_consumption;
        } else {
            let polarity = modbox_select.polarity;
            let mod_in = modbox_select.mod;
            // 判断原本是否有MOD
            if (mod_in) {
                let consumption = mod_in.base_drain + mod_in.fusion_limit;
                if (polarity.toUpperCase() == `Null`.toUpperCase()) {} else if (polarity.toUpperCase() == mod_in.polarity.toUpperCase()) {
                    consumption = consumption - Math.round(consumption / 2);
                } else {
                    consumption = consumption + Math.round(consumption / 4);
                }
                size.now = size.now - consumption;
            }
            // 添加新MOD导致Size容量变化
            let new_consumption = mod_select.base_drain + mod_select.fusion_limit;
            if (polarity.toUpperCase() == `Null`.toUpperCase()) {} else if (polarity.toUpperCase() == mod_select.polarity.toUpperCase()) {
                new_consumption = new_consumption - Math.round(new_consumption / 2);
            } else {
                new_consumption = new_consumption + Math.round(new_consumption / 4);
            }
            size.now = size.now + new_consumption;
        }
        return size.now <= size.max
    }

    /**
     * @description 更新配置槽Mod
     */
    _update_modbox(modbox_select, mod_select) {
        let self = this;
        // TODO 放置MOD
        // 1.将新MOD数据保存到modboxs_map中
        self.modboxs_map.get(modbox_select).mod = mod_select;
        // 2.界面添加新MOD
        self._init_mod_element(modbox_select);
    }

    /**
     * @description 向当前配置槽添加Mod
     * @param modbox 当前配置槽
     */
    _init_mod_element(modbox) {
        let self = this;
        // 1.根据当前配置槽信息生成Mod
        let modbox_data = self.modboxs_map.get(modbox);
        let data = modbox_data.mod;
        if (data) {
            let [consumption, color] = self._compute_mod_consumption(modbox_data);
            let mod = $(`
            <article class="mod">
                <span class="mod-name">${data.name}</span>
                <span class="mod-size iconfont icon-${data.polarity}_px">${consumption}</span>
                <div class="mod-property">
                    ${Object.entries(data.property).map(([name,up]) => {
                        return `<span>${name} ${up}</span>`
                    }).join("")}
                </div>
                <i class="mod-remove iconfont icon-close"></i>
            </article>
        `);
            mod.children(`.mod-size`).css(`color`, color);
            // 2.删除原始Mod，并添加新Mod，禁止配置槽极性修改操作
            $(modbox).children(`.mod`).remove();
            $(modbox).children(`.polarity`).css(`pointer-events`, `none`);
            $(modbox).prepend(mod);
            // 添加删除事件
            self._add_remove_listener(modbox, consumption);
        } else {
            $(modbox).children(`.mod`).remove();
            $(modbox).children(`.polarity`).css(`pointer-events`, ``);
        }
    }

    /**
     * @description 计算Mod在该配置槽的消耗
     * @param modbox_data 配置槽信息
     * @returns 消耗及显示颜色
     */
    _compute_mod_consumption(modbox_data) {
        let polarity = modbox_data.polarity;
        let mod_in = modbox_data.mod;
        let consumption = mod_in.base_drain + mod_in.fusion_limit;
        let color = `#fff`;
        if (modbox_data[`type`].toUpperCase() == `Aura`.toUpperCase()) {
            if (polarity.toUpperCase() == `Null`.toUpperCase()) {} else if (polarity.toUpperCase() == mod_in.polarity.toUpperCase()) {
                consumption = consumption * 2;
                color = `#0eb313`;
            } else {
                consumption = consumption - Math.round(consumption / 4);
                color = `#EA2027`;
            }
        } else {
            if (polarity.toUpperCase() == `Null`.toUpperCase()) {} else if (polarity.toUpperCase() == mod_in.polarity.toUpperCase()) {
                consumption = consumption - Math.round(consumption / 2);
                color = `#0eb313`;
            } else {
                consumption = consumption + Math.round(consumption / 4);
                color = `#EA2027`;
            }
        }
        return [consumption, color];
    }

    /**
     * @description 添加取下Mod事件监听
     * @param modbox 当前配置槽
     * @param consumption mod消耗
     */
    _add_remove_listener(modbox, consumption) {
        let self = this;
        $(modbox).find(`.mod-remove`).click(() => {
            let modbox_type = self.modboxs_map.get(modbox).type;
            if (self._remove_mod_judge(consumption, modbox_type)) {
                // 1.修改配置槽内部信息
                self._remove_mod_from_modbox(modbox);
                // 2.修改WarframeInfo的Size
                // 3.向后台请求新数据
                self._change_warframe_info();
            } else {
                msg.error_message(`不能取下卡片，请检查配置槽容量。`);
            }
        });
    }

    /**
     * @description 取下配卡判断
     * @param consumption 当前配置槽消耗
     * @param type 配置槽类型
     * @returns 是否可取下的判断
     */
    _remove_mod_judge(consumption, type) {
        let size = interaction.get_size();
        if (type && (type.toUpperCase() == `Aura`.toUpperCase())) {
            size.max -= consumption;
        } else {
            size.now -= consumption;
        }
        return size.now <= size.max;
    }

    /**
     * @description 取下配置槽配卡
     * @param modbox 当前配置槽
     */
    _remove_mod_from_modbox(modbox) {
        let self = this;
        // TODO 更改配置槽
        // 1.移除配置槽内的MOD
        // 2.移除modboxs_map里存储的mod数据
        // 3.启用极性修改操作
        $(modbox).children(`.mod`).remove();
        self.modboxs_map.get(modbox).mod = null;
        $(modbox).children(`.polarity`).css(`pointer-events`, ``);
    }

    /**
     * @description 添加分享按钮事件监听
     */
    _add_share_listener() {
        let self = this;
        let wfper = window.get_cookie(`wfper`);
        wfper = wfper.split(`&`).map((item) => {
            return item.split(`=`)[1].toUpperCase() == `true`.toUpperCase() ? true : false;
        })
        if (wfper[0]) {
            self.share.click(() => {
                let modboxs = {};
                let index = 0;
                for (const [div, modbox] of self.modboxs_map.entries()) {
                    modboxs[index++] = modbox;
                }
                if (interaction.share_warframe_modboxs)
                    interaction.share_warframe_modboxs(modboxs);
                msg.ok_message(`提交分享!`);
            });
        } else {
            self.share.click(() => {
                msg.warning_message(`您需要登录才能使用分享功能！`);
            })
        }
    }


    /**
     * @description 修改信息Warframe信息功能
     */
    _change_warframe_info() {
        let self = this;
        // TODO 遍历modboxs_map修改warframe信息
        // 1.修改WarframeInfo的Size
        // 2.向后台请求新数据
        let mods = {};
        let index = 0;
        let size = {
            now: 0,
            max: 60
        };
        for (const modbox_data of self.modboxs_map.values()) {
            let name = `${index++}`;
            mods[name] = modbox_data.mod;
            if (mods[name]) {
                let [consumption, color] = self._compute_mod_consumption(modbox_data);
                if (modbox_data.type.toUpperCase() == `Aura`.toUpperCase()) {
                    size.max += consumption;
                } else {
                    size.now += consumption;
                }
            }
        }

        if (interaction.set_size)
            interaction.set_size(size);
        if (interaction.get_up_info)
            interaction.get_up_info(mods);
    }

    /**
     * @description 一键配置功能
     * @returns 一键配置功能函数指针
     */
    _auto_adjust_modboxs() {
        let self = this;
        return (modboxs) => {
            let element_list = [...self.modboxs_map.keys()];
            [...Object.values(modboxs)].forEach((item, index, arr) => {
                let modbox_select = element_list[index];
                let mod_select = item.mod;
                self.modboxs_map.set(modbox_select, item);
                self._update_modbox(modbox_select, mod_select);
                if (item.mod)
                    self._change_polarity_by_modboxs(modbox_select);
            });
            self._change_warframe_info();
        }
    }

    _change_polarity_by_modboxs(modbox) {
        let self = this;
        let data = self.modboxs_map.get(modbox);
        let polarity = data.polarity.toLowerCase();
        $(modbox).children(`.polarity`).attr(`data-polarity`, `${polarity.charAt(0).toUpperCase()}${polarity.slice(1).toLowerCase()}`.trim());
        let re = new RegExp(polarity, `i`);
        [...$(modbox).find(`.polarity>i`)].forEach((el, index, arr) => {
            if (re.test($(el).attr(`data-polarity`)))
                $(modbox).find(`[name="modbox-add"]`).attr(`class`, $(el).attr(`class`));
        })
    }
}

let warframe_modboxs = new WarframeModBoxs();

interaction.adjust_modboxs = warframe_modboxs.adjust_modboxs;
interaction.auto_adjust_modboxs = warframe_modboxs.auto_adjust_modboxs;