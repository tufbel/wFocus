/*
 * @Author: Lumoon 
 * @Date: 2019-11-09 23:08:58 
 * @Last Modified by: Lumoon
 * @Last Modified time: 2019-12-16 14:44:38
 * @description: 弹窗提示。
 */

"use strict";


class Message {

    constructor() {
        this._run();
    }
    _run() {
        let self = this;
        // 修饰原本提示方法，添加字符串处理能力，使程序更加健壮（使用了闭包）
        self.error_message = description.call(self, self._error_message);
        self.warning_message = description.call(self, self._warning_message);
        self.ok_message = description.call(self, self._ok_message);
        self.prompt_message = description.call(self, self._prompt_message);
    }

    // 初始化内容
    _init_element() {
        let message_div = {};
        message_div.wrapper = $(`<div></div>`);
        message_div.wrapper.hide();
        message_div.wrapper.css({
            width: `300px`,
            fontSize: `16px`,
            borderRadius: `3px`,
            overflow: `hidden`,
            boxShadow: `2px 2px 10px 2px #485460`,
            position: `fixed`,
            zIndex: `10000`,
            top: `-100px`,
            left: `50%`,
            transform: `translateX(-50%)`
        });

        // 添加提示框标题栏      
        let bar = $(`<div></div>`);
        bar.css({
            width: `100%`,
            height: `32px`,
            background: `#333333`,
            display: `flex`,
            justifyContent: `space-between`,
            alignItems: `center`,
            color: `#fff`
        });

        message_div.title = $(`<span></span>`);
        message_div.title.css({
            margin: `auto 10px`,
            fontWeight: `700`
        });

        message_div.close = $(`<i class="iconfont icon-close"></i>`);
        message_div.close.css({
            fontSize: `16px`,
            margin: `auto 10px`,
            cursor: `pointer`,
            color: `#EA2027`
        });


        // 添加内容显示区域
        let content = $(`<div></div>`);
        content.css({
            width: `100%`,
            background: `linear-gradient(160deg, #e3f2fd, #42a5f5)`,
            color: `#000`,
            display: `flex`,
            alignItems: `center`
        });

        message_div.message = {
            p: $(`<p></p>`),
            icon: $(`<i></i>`)
        };

        message_div.message.p.css({
            minWidth: `234px`,
            padding: `5px`,
            fontSize: `14px`,
            fontWeight: '600'
        });
        message_div.message.icon.css({
            minWidth: `66px`,
            maxWidth: `66px`,
            height: `66px`,
            fontSize: `36px`,
            display: `flex`,
            justifyContent: `center`,
            alignItems: `center`
        });

        // 组合
        bar.append(message_div.title);
        bar.append(message_div.close);
        content.append(message_div.message.icon);
        content.append(message_div.message.p);
        message_div.wrapper.append(bar);
        message_div.wrapper.append(content);

        return message_div;
    }

    // 四种提示内容的动态添加
    _error_message(message) {
        let self = this;
        let message_div = self._init_element();

        message_div.title.html("错误提示")
        message_div.message.p.html(message);
        message_div.message.icon.removeClass();
        message_div.message.icon.addClass("iconfont icon-error");
        message_div.message.icon.css({
            color: `red`
        });

        self._show(message_div);
    }
    _warning_message(message) {
        let self = this;
        let message_div = self._init_element();

        message_div.title.html("警告提示")
        message_div.message.p.html(message);
        message_div.message.icon.removeClass();
        message_div.message.icon.addClass("iconfont icon-warning");
        message_div.message.icon.css({
            color: `#ffa801`
        });
        self._show(message_div);
    }
    _ok_message(message) {
        let self = this;
        let message_div = self._init_element();

        message_div.title.html("正确提示")
        message_div.message.p.html(message);
        message_div.message.icon.removeClass();
        message_div.message.icon.addClass("iconfont icon-zhengque");
        message_div.message.icon.css({
            color: `#0be881`
        });
        self._show(message_div);
    }
    _prompt_message(message) {
        let self = this;
        let message_div = self._init_element();

        message_div.title.html("提示")
        message_div.message.p.html(message);
        message_div.message.icon.removeClass();
        message_div.message.icon.addClass("iconfont icon-tishi");
        message_div.message.icon.css({
            color: `#34e7e4`
        });
        self._show(message_div);
    }

    // 消息框显示控制
    _show(message_div) {
        let self = this;
        $(document.body).append(message_div.wrapper)
        message_div.wrapper.show();
        message_div.wrapper.animate({
            top: `20px`
        }, 260, () => {
            // 定时关闭消息框
            message_div.animate = setTimeout(self._hide.bind(self, message_div), 3000);
            // 添加hover事件与主动关闭事件
            self._add_hover(message_div);
            self._add_close(message_div);
        });
    }

    _hide(message_div) {
        message_div.wrapper.animate({
            top: `-100px`
        }, 260, () => {
            message_div.wrapper.remove();
        });
    }

    // 主动关闭与查看控制
    _add_close(message_div) {
        let self = this;
        message_div.close.click(() => {
            clearTimeout(message_div.animate);
            self._hide(message_div);
        });
    }
    _add_hover(message_div) {
        message_div.wrapper.hover(() => {
            clearTimeout(message_div.animate);
        }, () => {});
    }
}

function description(fn) {
    // 装饰器，添加字符串处理能力
    return (message) => {
        let content = add_message(message);
        // 改变this,并执行函数
        fn.call(this, content);
    }
}

function add_message(message) {
    // 递归处理字符串
    let content = ``;
    if (message) {
        if (message.constructor == String) {
            content = `${content}${message}`;
            return content;
        } else if (message.constructor == Object || message.constructor == Array) {
            for (const key in message) {
                content = `${content}${add_message(message[key])}`;
            }
            return content;
        } else {
            content = `${content}${message + ''}。`
            return content;
        }
    } else {
        return content;
    }
}

let message = new Message();
let msg = {};
msg.error_message = message.error_message;
msg.ok_message = message.ok_message;
msg.prompt_message = message.prompt_message;
msg.warning_message = message.warning_message;

export default msg;