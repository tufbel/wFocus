/*
 * @Author: Lumoon 
 * @Date: 2019-12-06 21:38:10 
 * @Last Modified by: Lumoon
 * @Last Modified time: 2019-12-09 22:32:49
 * @description: 实时信息页面控制
 */

"use strict";

class Resize {

    static get_singletion() {
        let self = this;
        if (!self._singletion) {
            self._singletion = new Resize();
        }
        return self._singletion;
    }

    constructor() {
        this.element_map = new Map();
    }

    run() {
        let self = this;
        self._init_element();
        self._add_resize_listener();
    }

    _init_element() {
        let self = this;
        self.resizes = $(`[window-resize]`);
    }

    _add_resize_listener() {
        let self = this;
        self.resizes.each(function (index, el) {
            Resize.add_resize_element(el, function () {
                let row_height = Number(el.getAttribute(`window-resize`));
                let content_height = $(el).children(`div`).outerHeight();
                let rows = Math.trunc(content_height / row_height) + 1
                $(el).css(`grid-row-end`, `span ${rows}`);
            });
        });
    }

    static add_resize_element(element, func) {
        let self = this;
        let instance = self.get_singletion();
        instance.element_map.set(element, func);
    }

    static resize_element(el_key = null) {
        let self = this;
        let instance = self.get_singletion();
        if (!el_key) {
            for (const [key, func] of instance.element_map.entries()) {
                if (func) {
                    func();
                } else {
                    instance.element_map.delete(key);
                }
            }
        } else {
            let func = instance.element_map.get(el_key);
            if (func) {
                func();
            } else {
                instance.element_map.delete(key);
            }
        }
    }
}

let resize_instance = Resize.get_singletion();
resize_instance.run();

class RenderTime {

    static get_singletion() {
        let self = this;
        if (!self._singletion) {
            self._singletion = new RenderTime();
        }
        return self._singletion;
    }

    constructor() {
        this.time_map = new Map();
        this._start_thread();
    }

    _start_thread() {
        let self = this;
        let timer_id = setInterval(() => {
            for (const [key, func] of self.time_map.entries()) {
                if (func)
                    func();
                else
                    self.time_map.delete(key);
            }
        }, 1000 * 30);
    }

    static add_time_dom(element, func) {
        let self = this;
        let s = self.get_singletion();
        s.time_map.set(element, func);
        if (func)
            func();
    }
    static delete_time_dom(element) {
        let self = this;
        let s = self.get_singletion();
        s.time_map.delete(element);
    }
}

class AlertsBase {

    constructor() {
        this.base_url = `/alerts/data/`;
    }

    _init_alert_item(type, content, tag = null, blod = false) {
        let element = null;
        switch (type.toLowerCase()) {
            case `common`:
                element = $(`<section alert-item><div Common>${tag?tag:`常见`}</div><span>${content}</span></section>`);
                break;
            case `uncommon`:
                element = $(`<section alert-item><div Uncommon>${tag?tag:`罕见`}</div><span>${content}</span></section>`);
                break;
            case `rare`:
                element = $(`<section alert-item><div Rare>${tag?tag:`稀有`}</div><span>${content}</span></section>`);
                break;
            case `enemy`:
                element = $(`<section alert-item><div enemy>${tag?tag:`敌人`}</div><span>${content}</span></section>`);
                break;
            case `normal`:
                element = $(`<section alert-item><div normal>${tag?tag:`普通`}</div><span>${content}</span></section>`);
                break;
            case `mission`:
                element = $(`<section alert-item><div mission>${tag?tag:`任务`}</div><span>${content}</span></section>`);
                break;
            case `end`:
                element = $(`<section alert-item><div end>${tag?tag:`结束`}</div><span>${content}</span></section>`);
                break;
            default:
                break;
        }
        if (blod) {
            element.find(`span`).css(`font-weight`, `bold`);
        }
        return element;
    }

    _init_alert_progress(p_num, p_element = null) {

        let num = Math.round(p_num);
        let element = p_element ? p_element : $(`
            <section alert-progress>
                <div progress>
                    <div>&ensp;</div>
                </div>
                <span></span>
            </section>
        `);

        element.find(`[progress] > div `).css({
            backgroundColor: num >= 100 ? `#4cd137` : `#8c05e8`,
            width: `${num}%`
        });
        element.find(`span`).html(`${num}%`);

        return p_element ? null : element;
    }
}

export {
    AlertsBase,
    RenderTime,
    Resize,
}


// class Ostron extends AlertsBase {

//     constructor() {
//         super();

//         this._init_element();
//         this._init_data();

//         this._run();
//     }

//     _run() {
//         let self = this;
//         self._add_click_litener();

//         self._send_request();
//     }

//     _init_element() {
//         let self = this;
//         self.element = $(`section[ostron]`);
//     }

//     _init_data() {
//         let self = this;
//         self.status = new Proxy({
//             data: null,
//             judge: false
//         }, {
//             get: (obj, key) => obj[key],
//             set: (obj, key, value) => {
//                 obj[key] = value;
//                 if (key == `data`) {
//                     let status_el = self.element.find(`[alert-title] span:nth-of-type(2)`);
//                     let time_el = self.element.find(`[alert-footer] [alert-time]`);
//                     if (value) {
//                         // let test_data = new Date();
//                         // test_data = test_data.setSeconds(test_data.getSeconds() - 31);

//                         RenderTime.add_time_dom(self.element[0], () => {
//                             if (value.isDay) {
//                                 status_el.html(`<span><i class="iconfont icon-sunfill"></i>白昼</span>`);
//                             } else {
//                                 status_el.html(`<span><i class="iconfont icon-yueliang"></i>黑夜</span>`);
//                             }
//                             let [str, expiry_date] = time_difference(new Date(value.expiry));
//                             // let [str, expiry_date] = time_difference(test_data);
//                             time_el.html(`<span>${str}</span> <span>切换</span>`);
//                             if (expiry_date < 0) {
//                                 self._send_request();
//                             }
//                         });
//                         self.status.judge = true;
//                     } else {
//                         RenderTime.delete_time_dom(self.element);
//                         status_el.html(``);
//                         time_el.html(``);
//                         self.status.judge = false;
//                     }
//                 } else if (key == `judge`) {
//                     self._manage_mask();
//                 }
//                 return true;
//             }
//         });
//         self.ostron = new Proxy({
//             data: null,
//             judge: false
//         }, {
//             get: (obj, key) => obj[key],
//             set: (obj, key, value) => {
//                 obj[key] = value;
//                 if (key == `data`) {
//                     let ul_el = self.element.find(`[alert-content-page]`);
//                     let page_el = self.element.find(`[alert-page]`);
//                     ul_el.parent().attr(`alert-content-border`, ``);
//                     ul_el.html(``);
//                     if (value) {
//                         value.forEach((item, index, array) => {
//                             let li = $(`<li>${index + 1}</li>`);
//                             ul_el.append(li);
//                         });
//                         ul_el.children()[0].click();
//                         self.ostron.judge = true;
//                     } else {
//                         ul_el.parent().removeAttr(`alert-content-border`);
//                         page_el.html(``);
//                         Resize.resize_element(self.element[0]);
//                         self.ostron.judge = false;
//                     }
//                 } else if (key == `judge`) {
//                     self._manage_mask();
//                 }
//                 return true
//             }
//         });
//     }

//     _send_request() {
//         let self = this;
//         self.ostron.data = null;
//         self.status.data = null;

//         wfajax.post({
//             url: self.base_url + `cetusStatus`,
//             success: (response) => {
//                 if (response.code == 200) {
//                     self.status.data = response.data;
//                 } else {
//                     msg.error_message(response.message);
//                 }
//             },
//             fail: (error) => {
//                 console.error(error);
//             }
//         });

//         wfajax.post({
//             url: self.base_url + `ostron`,
//             success: (response) => {
//                 if (response.code == 200) {
//                     self.ostron.data = response.data;
//                 } else {
//                     msg.error_message(response.message);
//                 }
//             },
//             fail: (error) => {
//                 console.error(error);
//             }
//         });
//     }

//     _manage_mask() {
//         let self = this;
//         if (self.status.judge && self.ostron.judge) {
//             self.element.find(`[alert-mask]`).hide();
//         } else {
//             self.element.find(`[alert-mask]`).show();
//         }
//     }

//     _add_click_litener() {
//         let self = this;
//         self.element.find(`[alert-content-page]`).on(`click`, `li`, function (e) {
//             $(e.delegateTarget).children().removeClass(`select`);
//             $(this).addClass(`select`);

//             let page_el = $(e.delegateTarget).next();
//             let data = self.ostron.data[$(this).index()];

//             page_el.html(``);
//             data.rewards.forEach((item, index, arr) => {
//                 let element = self._init_alert_item(item.type, item.zh);
//                 page_el.append(element);
//             });
//             Resize.resize_element(self.element[0]);
//         })
//     }
// }

// let ostron = new Ostron();