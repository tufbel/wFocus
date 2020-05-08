/*
 * @Author: Lumoon 
 * @Date: 2019-11-27 21:52:09 
 * @Last Modified by: Lumoon
 * @Last Modified time: 2019-12-08 23:12:33
 * @description: 武器信息展示
 */

"use strict";

import interaction from "../modules_interaction.js";
import msg from "../message.js";

class WeaponInfo {

    constructor() {
        this.update_num = 0;
        this.data = {};

        this._init_element();
        this._run();
    }

    _run() {
        let self = this;
        self.get_size = self._get_size();
        self.set_size = self._set_size();
        self.get_up_info = self._get_up_info();
        self.share_weapon_modboxs = self._share_weapon_modboxs();

        self._get_weapon_info();
        self._add_resize_listener();
    }

    _init_element() {
        let self = this;
        self.info = $(`<article class="weapon-info col-lg-4 col-md-5 col-sm-12"></article>`);
        self.title = $(`<article><span>N/A</span></article>`);
        self.now_size = 0;
        self.max_size = 60;
        self.size = $(`<section class="mod-size var-item"><span>容量</span><span>${self.now_size}</span><span>${self.max_size}</span><i></i></section>`);
        self.type = $(`<section class="imm-item"><span>武器类型</span><span></span></section>`);
        self.noise_level = $(`<section class="imm-item"><span>噪音等级</span><span></span></section>`);
        self.fire_rate = $(`<section class="var-item"><span>射速</span><span></span><span></span></section>`);
        self.magazine_size = $(`<section class="var-item"><span>弹夹容量</span><span></span><span></span></section>`);
        self.max_ammo = $(`<section class="var-item"><span>弹药上限</span><span></span><span></span></section>`);
        self.reload_time = $(`<section class="var-item"><span>换弹时间</span><span></span><span></span></section>`);
        self.disposition = $(`<section class="imm-item"><span>裂隙倾向</span><span>○○○○○(0)</span></section>`);

        self.weapon_pattern = $(`<div class="weapon-pattern"></div>`);
        self.pattern_item = $(`
        <div class="pattern-item">
            <div class="pattern-base"></div>
            <div class="pattern-physical"></div>
            <div class="pattern-elemental"></div>
        </div>
        `);

        self.info.append(self.title);
        self.info.append(self.size);
        self.info.append(self.type);
        self.info.append(self.noise_level);
        self.info.append(self.fire_rate);
        self.info.append(self.magazine_size);
        self.info.append(self.max_ammo);
        self.info.append(self.reload_time);
        self.info.append(self.disposition);

        $(`.wf-main`).prepend(self.info);
    }

    _get_size() {
        let self = this;
        return () => {
            return {
                now: self.now_size,
                max: self.max_size
            }
        }
    }
    _set_size() {
        let self = this;
        return (size) => {
            self.now_size = size.now;
            self.max_size = size.max;
            self._update_size();
        }
    }

    _update_size() {
        let self = this;

        self.size.find('span:nth-of-type(2)').html(self.now_size)
        self.size.find('span:nth-of-type(3)').html(self.max_size)
        if (self.now_size != 0) {
            let long = self.now_size / self.max_size * 100;
            self.size.find(`i`).css({
                outline: `2px solid rgba(0, 170, 255, 0.8)`,
                width: `calc(${long}%  - 4px)`
            });
        } else {
            self.size.find(`i`).css({
                outline: `none`,
                width: `0`
            });
        }
    }

    _add_resize_listener() {
        let self = this;
        $(window).resize(() => {
            self._change_rows();
        });
        $(window).resize();
    }
    _change_rows() {
        let self = this;
        let out_height = self.info.outerHeight();
        let rows = Math.ceil(out_height / 120);
        self.info.css(`grid-row`, `1/span ${rows}`);
    }


    _get_weapon_info() {
        let self = this;
        wfajax.post({
            data: {
                methond: 'original',
            },
            success: (response) => {
                if (response.code == 200) {
                    self._update_info(response.data);
                    self._add_original_info();
                } else {
                    msg.error_message(`请求失败，请刷新页面：${response.message}`);
                }
            },
            fail: (error) => {
                // 请求失败
                console.log(`服务崩溃${error}`);
            }
        });
    }

    _add_original_info() {
        let self = this;
        let info = self.data.weapon;

        self.title.find('span').html(info.name[0]);
        self.type.find('span:nth-of-type(2)').html(info.type[0]);
        self.noise_level.find('span:nth-of-type(2)').html(info.noise_level[0]);
        self.fire_rate.find('span:nth-of-type(2)').html(`${info.fire_rate.toFixed(2)}发/秒`);
        self.magazine_size.find('span:nth-of-type(2)').html(`${info.magazine_size}发`);
        self.disposition.find('span:nth-of-type(2)').html(info.disposition);
        if (typeof self.max_ammo == `number`) {
            self.max_ammo.find('span:nth-of-type(2)').html(`${info.max_ammo}发`);
        } else {
            self.max_ammo.find('span:nth-of-type(2)').html(info.max_ammo);
        }
        self.reload_time.find('span:nth-of-type(2)').html(`${info.reload_time.toFixed(2)}秒`);

        for (const [key, value] of Object.entries(info.pattern)) {
            self.weapon_pattern.append($(`<div><span>${key.replace(/_/g,' ')}</span></div>`));
            self._init_element_pattern(key, value);

            self.info.append(self.weapon_pattern);
            self.info.append(self.pattern_item);
            break;
        }

        self.update_num++;
        $(window).resize();
    }

    _add_up_data() {
        let self = this;
        let info = self.data.up
        let base = self.pattern_item.children(`.pattern-base`);
        let physical = self.pattern_item.children(`.pattern-physical`);
        let elemental = self.pattern_item.children(`.pattern-elemental`);

        self.fire_rate.find('span:nth-of-type(3)').html(`${info.fire_rate.toFixed(2)}发/秒`);
        self.magazine_size.find('span:nth-of-type(3)').html(`${info.magazine_size}发`);
        if (typeof self.max_ammo == `number`) {
            self.max_ammo.find('span:nth-of-type(3)').html(`${info.max_ammo}发`);
        }
        self.reload_time.find('span:nth-of-type(3)').html(`${info.reload_time.toFixed(2)}秒`);

        for (const [key, value] of Object.entries(info.pattern)) {
            let property = {};
            get_hash(value, property);
            for (const [new_key, new_value] of Object.entries(property)) {
                if (self[key].hasOwnProperty(new_key)) {
                    if (/crit_chance|status_chance/i.test(new_key)) {
                        self[key][new_key].find('span:nth-of-type(3)').html(`${Math.round(new_value*100)}%`);
                    } else if (/crit_multiplier/i.test(new_key)) {
                        self[key][new_key].find('span:nth-of-type(3)').html(`${new_value.toFixed(2)}x`);
                    } else {
                        self[key][new_key].find('span:nth-of-type(3)').html(`${Math.round(new_value)}`);
                    }
                } else {
                    let element = self._init_element_by_pattern(new_key, 0);
                    self[key][new_key] = element;

                    element.find('span:nth-of-type(3)').html(`${Math.round(new_value)}`);

                    if (/puncture|impact|slash/i.test(new_key)) {
                        physical.append(element);
                    } else {
                        elemental.append(element);
                    }
                }
            }
            break;
        }
        self._render();
        $(window).resize();
    }

    _render() {
        let self = this;
        let original = self.data.weapon;
        let up = self.data.up;

        for (const key in up) {
            if (/pattern/i.test(key)) {
                for (const p_key in up[key]) {
                    let original_property = {}
                    let up_property = {}
                    get_hash(up[key][p_key], up_property)
                    get_hash(original[key][p_key], original_property)
                    for (const up_key in up_property) {
                        if (original_property.hasOwnProperty(up_key)) {
                            if (original_property[up_key] > up_property[up_key])
                                self[p_key][up_key].find('span:nth-of-type(3)').css({
                                    color: `#e84118`,
                                });
                            else if (original_property[up_key] < up_property[up_key])
                                self[p_key][up_key].find('span:nth-of-type(3)').css({
                                    color: `#4cd137`,
                                });
                            else
                                self[p_key][up_key].find('span:nth-of-type(3)').css({
                                    color: `transparent`,
                                });
                        } else {
                            self[p_key][up_key].find('span:nth-of-type(3)').css({
                                color: `#4cd137`,
                            });
                        }
                    }
                    let all_keys = Object.keys(self[p_key]);
                    for (const all_key of all_keys) {
                        if (up_property.hasOwnProperty(all_key)) {
                            self[p_key][all_key].show();
                        } else {
                            self[p_key][all_key].hide();
                        }
                    }
                    break;
                }
            } else {
                if (original.hasOwnProperty(key) && self.hasOwnProperty(key)) {
                    if (original[key] > up[key])
                        self[key].find('span:nth-of-type(3)').css({
                            color: `#e84118`,
                        });
                    else if (original[key] < up[key])
                        self[key].find('span:nth-of-type(3)').css({
                            color: `#4cd137`,
                        });
                    else
                        self[key].find('span:nth-of-type(3)').css({
                            color: `transparent`,
                        });
                }
            }
        }
    }

    _init_element_pattern(pattern_key, pattern_item) {
        let self = this;
        let element_list = {};
        let new_key = pattern_key.replace(/\s/g, '_');
        if (self.hasOwnProperty(new_key))
            element_list = self[new_key];
        else
            self[new_key] = element_list;

        let base = self.pattern_item.children(`.pattern-base`);
        let physical = self.pattern_item.children(`.pattern-physical`);
        let elemental = self.pattern_item.children(`.pattern-elemental`);

        for (const [key, value] of Object.entries(pattern_item)) {
            if (/total_damage/i.test(key)) {
                for (const [t_key, t_value] of Object.entries(value[1])) {
                    let element = self._init_element_by_pattern(t_key, t_value);
                    element_list[t_key] = element;
                    if (/puncture|impact|slash/i.test(t_key)) {
                        physical.append(element);
                    } else {
                        elemental.append(element);
                    }
                }
            } else {
                let element = self._init_element_by_pattern(key, value);
                element_list[key] = element;
                base.append(element);
            }
        }
    }

    _init_element_by_pattern(key, value) {
        if (/crit_chance/i.test(key)) {
            return $(`<section class="var-item" data-pattern="crit_chance"><span>暴击几率</span><span>${Math.round(value*100)}%</span><span></span></section>`);
        } else if (/crit_multiplier/i.test(key)) {
            return $(`<section class="var-item" data-pattern="crit_multiplier"><span>暴击倍率</span><span>${value.toFixed(2)}x</span><span></span></section>`);
        } else if (/status_chance/i.test(key)) {
            return $(`<section class="var-item" data-pattern="status_chance"><span>触发几率</span><span>${Math.round(value*100)}%</span><span></span></section>`);
        } else if (/puncture/i.test(key)) {
            return $(`<section class="var-item" data-pattern="puncture"><span>穿刺伤害</span><span>${Math.round(value)}</span><span></span></section>`);
        } else if (/impact/i.test(key)) {
            return $(`<section class="var-item" data-pattern="impact"><span>冲击伤害</span><span>${Math.round(value)}</span><span></span></section>`);
        } else if (/slash/i.test(key)) {
            return $(`<section class="var-item" data-pattern="slash"><span>切割伤害</span><span>${Math.round(value)}</span><span></span></section>`);
        } else if (/electricity/i.test(key)) {
            return $(`<section class="var-item"><span>电击伤害</span><span>${Math.round(value)}</span><span></span></section>`);
        } else if (/cold/i.test(key)) {
            return $(`<section class="var-item"><span>冰冻伤害</span><span>${Math.round(value)}</span><span></span></section>`);
        } else if (/heat/i.test(key)) {
            return $(`<section class="var-item"><span>火焰伤害</span><span>${Math.round(value)}</span><span></span></section>`);
        } else if (/toxin/i.test(key)) {
            return $(`<section class="var-item"><span>毒素伤害</span><span>${Math.round(value)}</span><span></span></section>`);
        } else if (/viral/i.test(key)) {
            return $(`<section class="var-item"><span>病毒伤害</span><span>${Math.round(value)}</span><span></span></section>`);
        } else if (/blast/i.test(key)) {
            return $(`<section class="var-item"><span>爆炸伤害</span><span>${Math.round(value)}</span><span></span></section>`);
        } else if (/corrosive/i.test(key)) {
            return $(`<section class="var-item"><span>腐蚀伤害</span><span>${Math.round(value)}</span><span></span></section>`);
        } else if (/gas/i.test(key)) {
            return $(`<section class="var-item"><span>毒气伤害</span><span>${Math.round(value)}</span><span></span></section>`);
        } else if (/magnetic/i.test(key)) {
            return $(`<section class="var-item"><span>磁力伤害</span><span>${Math.round(value)}</span><span></span></section>`);
        } else if (/radiation/i.test(key)) {
            return $(`<section class="var-item"><span>辐射伤害</span><span>${Math.round(value)}</span><span></span></section>`);
        }
    }

    _update_info(data) {
        let self = this;
        if (/original/i.test(data.methond)) {
            self.data['weapon'] = data.original;
            let title = self.data.weapon.name;
            document.title = `${title[0].toUpperCase()}-wFocus`;
        } else if (/up/i.test(data.methond)) {
            self.data['up'] = data.up;
        }
    }

    _get_up_info() {
        let self = this;
        return (mods) => {
            self.update_num++;
            let update_now = self.update_num;
            wfajax.post({
                data: {
                    methond: 'up',
                    weapon: JSON.stringify(self.data.weapon),
                    mods: JSON.stringify(mods)
                },
                success: (response) => {
                    if (response.code == 200) {
                        // 请求成功，判断当前状态是否为发送请求时的状态，若是，则更新数据；若不是，则不更新数据。
                        if (update_now == self.update_num) {
                            self._update_info(response.data);
                            self._add_up_data();
                        }
                    } else {
                        msg.error_message(`数据更新失败：${response.message}`);
                    }
                },
                fail: (error) => {
                    console.log(`您访问的服务器崩溃了！${error}`);
                }
            });
        }
    }

    _share_weapon_modboxs() {
        let self = this;
        return (modboxs) => {
            wfajax.post({
                url: `${window.location.pathname}/share`,
                data: {
                    weapon: JSON.stringify(self.data.weapon),
                    modboxs: JSON.stringify(modboxs)
                },
                success: (data) => {
                    if (data.code == 200) {
                        // 提示分享成功
                        msg.ok_message(`分享成功！`);
                    } else {
                        // 提示分享失败
                        msg.error_message(`分享失败：${data.message}`);
                    }
                },
                fail: (error) => {
                    console.log(`您访问的服务器崩溃了！${error}`);
                }
            });
        }
    }


}

let weapon_info = new WeaponInfo();

interaction.get_size = weapon_info.get_size;
interaction.set_size = weapon_info.set_size;
interaction.get_up_info = weapon_info.get_up_info;
interaction.share_weapon_modboxs = weapon_info.share_weapon_modboxs;