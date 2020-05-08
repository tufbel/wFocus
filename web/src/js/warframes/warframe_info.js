/*
 * @Author: Lumoon 
 * @Date: 2019-11-19 12:18:54 
 * @Last Modified by: Lumoon
 * @Last Modified time: 2019-12-08 23:10:37
 * @description: Warframe信息获取与显示控制
 */

"use strict";

import interaction from "../modules_interaction.js";
import msg from "../message.js";

class WarframeInfo {

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
        self.share_warframe_modboxs = self._share_warframe_modboxs();
        self._get_warframe_info();
    }

    _get_warframe_info() {
        let self = this;
        wfajax.post({
            data: {
                methond: 'original',
            },
            success: (data) => {
                if (data.code == 200) {
                    self._update_info(data.data);
                    self._add_warframe_data();
                } else {
                    msg.error_message(`请求失败，请刷新页面：${data.message}`);
                }
            },
            fail: (error) => {
                // 请求失败
                console.log(`服务崩溃${error}`);
            }
        });
    }

    _get_up_info() {
        let self = this;
        return (mods) => {
            self.update_num++;
            let update_now = self.update_num;
            wfajax.post({
                data: {
                    methond: 'up',
                    warframe: JSON.stringify(self.data.warframe),
                    mods: JSON.stringify(mods)
                },
                success: (data) => {
                    if (data.code == 200) {
                        // 请求成功，判断当前状态是否为发送请求时的状态，若是，则更新数据；若不是，则不更新数据。
                        if (update_now == self.update_num) {
                            self._update_info(data.data);
                            self._add_warframe_up_data();
                        }
                    } else {
                        msg.error_message(`数据更新失败：${data.message}`);
                    }
                },
                fail: (error) => {
                    console.log(`您访问的服务器崩溃了！${error}`);
                }
            });
        }
    }

    _init_element() {
        let self = this;
        // 初始化组件
        self.info = $(`<article class="warframe-info col-lg-4 col-md-5 col-sm-12"></article>`);
        self.title = $(`<article> <span></span> <img> </article>`);
        self.now_size = 0;
        self.max_size = 60;
        self.size = $(`<section class="mod-size"><span>容量</span><span>${self.now_size}</span><span>${self.max_size}</span><i></i></section>`);
        self.health = $(`<section><span>生命值</span><span></span><span></span></section>`);
        self.shield = $(`<section><span>护盾值</span><span></span><span></span></section>`);
        self.armor = $(`<section><span>护甲值</span><span></span><span></span></section>`);
        self.power = $(`<section><span>能量值</span><span></span><span></span></section>`);
        self.sprint_speed = $(`<section><span>冲刺速度</span><span></span><span></span></section>`);
        self.power_strength = $(`<section><span>技能强度</span><span></span><span></span></section>`);
        self.power_duration = $(`<section><span>持续时间</span><span></span><span></span></section>`);
        self.power_range = $(`<section><span>技能范围</span><span></span><span></span></section>`);
        self.power_efficiency = $(`<section><span>技能效率</span><span></span><span></span></section>`);

        // 组装
        self.info.append(self.title);
        self.info.append(self.size);
        self.info.append(self.health);
        self.info.append(self.shield);
        self.info.append(self.armor);
        self.info.append(self.power);
        self.info.append(self.sprint_speed);
        self.info.append(self.power_strength);
        self.info.append(self.power_duration);
        self.info.append(self.power_range);
        self.info.append(self.power_efficiency);
        $('.wf-main').prepend(self.info);
    }

    _add_warframe_data() {
        let self = this;
        let info = self.data.warframe;

        // 添加原始信息
        self.title.find('span').html(info.name);
        self.title.find('img').attr({
            src: `${info.img}`,
            alt: `${info.name}.png`
        });
        self.health.find('span:nth-of-type(2)').html(info.health);
        self.shield.find('span:nth-of-type(2)').html(info.shield);
        self.armor.find('span:nth-of-type(2)').html(info.armor);
        self.power.find('span:nth-of-type(2)').html(info.power);
        self.sprint_speed.find('span:nth-of-type(2)').html(info.sprint_speed.toFixed(2));
        self.power_strength.find('span:nth-of-type(2)').html(`${Math.round(info.power_strength*100)}%`);
        self.power_duration.find('span:nth-of-type(2)').html(`${Math.round(info.power_duration*100)}%`);
        self.power_range.find('span:nth-of-type(2)').html(`${Math.round(info.power_range*100)}%`);
        self.power_efficiency.find('span:nth-of-type(2)').html(`${Math.round(info.power_efficiency*100)}%`);

        // 修改数据计数器
        self.update_num++;
        // 页面加载完成后添加组件
    }
    _add_warframe_up_data() {
        let self = this;
        let info = self.data.up;
        self.health.find('span:nth-of-type(3)').html(info.health);
        self.shield.find('span:nth-of-type(3)').html(info.shield);
        self.armor.find('span:nth-of-type(3)').html(info.armor);
        self.power.find('span:nth-of-type(3)').html(info.power);
        self.sprint_speed.find('span:nth-of-type(3)').html(info.sprint_speed.toFixed(2));
        self.power_strength.find('span:nth-of-type(3)').html(`${Math.round(info.power_strength*100)}%`);
        self.power_duration.find('span:nth-of-type(3)').html(`${Math.round(info.power_duration*100)}%`);
        self.power_range.find('span:nth-of-type(3)').html(`${Math.round(info.power_range*100)}%`);
        self.power_efficiency.find('span:nth-of-type(3)').html(`${Math.round(info.power_efficiency*100)}%`);

        // 渲染提升属性
        self._render();
    }
    _render() {
        let self = this;
        let original = self.data.warframe;
        let up = self.data.up;

        for (const key in up) {
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

    _update_info(data) {
        let self = this;
        // 数据更新逻辑
        if (data.methond.toLowerCase() == 'original') {
            self.data['warframe'] = data.original;
            let title = self.data.warframe.name;
            document.title = `${title.toUpperCase()}-wFocus`;
        } else if (data.methond.toLowerCase() == 'up') {
            self.data['up'] = data.up;
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

    _get_size() {
        let self = this;
        return () => {
            return {
                now: self.now_size,
                max: self.max_size
            }
        }
    }

    _share_warframe_modboxs() {
        let self = this;
        return (modboxs) => {
            wfajax.post({
                url: `${window.location.pathname}/share`,
                data: {
                    warframe: JSON.stringify(self.data.warframe),
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

let wf_info = new WarframeInfo();

interaction.get_size = wf_info.get_size;
interaction.set_size = wf_info.set_size;
interaction.get_up_info = wf_info.get_up_info;
interaction.share_warframe_modboxs = wf_info.share_warframe_modboxs;