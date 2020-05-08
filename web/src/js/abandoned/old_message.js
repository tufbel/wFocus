/*
 * @Author: Lumoon 
 * @Date: 2019-11-09 23:08:58 
 * @Last Modified by: Lumoon
 * @Last Modified time: 2019-11-23 14:34:30
 * @description: 弹窗提示。
 */

"use strict";

class Message {

    constructor() {
        this._is_appended = false; // 判断是否已在body中添加，在本代码中只new了一次，所以不会出现提示出现一次就会多一个div的情况
        this._animate = 0; // 正在执行的隐藏动画的计时器的索引

        this._initElement();
        this._run();
    }
    _run() {
        // 添加点击close关闭事件
        this._add_close();
        this._add_hover();

        // 修饰原本提示方法，添加字符串处理能力，使程序更加健壮（使用了闭包）
        this.error_message = description.call(this, this.error_message);
        this.warning_message = description.call(this, this.warning_message);
        this.ok_message = description.call(this, this.ok_message);
        this.prompt_message = description.call(this, this.prompt_message);
    }
    // 初始化内容
    _initElement() {
        let self = this;
        self.wrapper = $(`<div></div>`);
        self.wrapper.hide();
        self.wrapper.css({
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

        self.title = $(`<span></span>`);
        self.title.css({
            margin: `auto 10px`,
            fontWeight: `700`
        });

        self.close = $(`<i class="iconfont icon-close"></i>`);
        self.close.css({
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

        self.message = {
            p: $(`<p></p>`),
            icon: $(`<i></i>`)
        };

        self.message.p.css({
            minWidth: `234px`
        });
        self.message.icon.css({
            minWidth: `66px`,
            maxWidth: `66px`,
            height: `66px`,
            fontSize: `36px`,
            display: `flex`,
            justifyContent: `center`,
            alignItems: `center`
        });

        // 组合
        bar.append(self.title);
        bar.append(self.close);
        content.append(self.message.icon);
        content.append(self.message.p);
        self.wrapper.append(bar);
        self.wrapper.append(content);
    }

    // 四种提示内容的动态添加
    error_message(message) {
        let self = this;

        self.title.html("错误提示")
        self.message.p.html(message);
        self.message.icon.removeClass();
        self.message.icon.addClass("iconfont icon-error");
        self.message.icon.css({
            color: `red`
        });
        self._show();
    }

    warning_message(message) {
        let self = this;

        self.title.html("警告提示")
        self.message.p.html(message);
        self.message.icon.removeClass();
        self.message.icon.addClass("iconfont icon-warning");
        self.message.icon.css({
            color: `#ffa801`
        });
        self._show();
    }
    ok_message(message) {
        let self = this;

        self.title.html("正确提示")
        self.message.p.html(message);
        self.message.icon.removeClass();
        self.message.icon.addClass("iconfont icon-zhengque");
        self.message.icon.css({
            color: `#0be881`
        });
        self._show();
    }
    prompt_message(message) {
        let self = this;

        self.title.html("提示")
        self.message.p.html(message);
        self.message.icon.removeClass();
        self.message.icon.addClass("iconfont icon-tishi");
        self.message.icon.css({
            color: `#34e7e4`
        });
        self._show();
    }

    // 控制显示
    _show() {
        let self = this;

        !self._is_appended && $(document.body).append(self.wrapper) && (self._is_appended = true);

        self.wrapper.show();
        self.wrapper.animate({
            top: `20px`
        }, 260, () => {
            self._animate = setTimeout(self._hide.bind(self), 3000);
        })
    }

    _hide() {
        let self = this;
        self.wrapper.animate({
            top: `-100px`
        }, 260, () => {
            self.wrapper.hide();
        });
    }

    // 主动关闭与查看控制
    _add_close() {
        let self = this;
        self.close.click(function (e) {
            e.preventDefault();
            clearTimeout(self._animate);
            self._animate = 0;
            self._hide.call(self);
        });
    }
    _add_hover() {
        let self = this;
        self.wrapper.hover(function () {
            clearTimeout(self._animate);
            self._animate = 0;
        }, function () {

        });
    }
}

function description(fn) {
    return (message) => {
        let content = ``;
        if (message.constructor == String)
            content = message;
        else
            for (const key in message) {
                if (message[key].constructor == String) {

                }
            }
        fn.call(this, content);
    }
}

function add_message(message, content) {
    if (message.constructor == String)
        content = `${conrent}${message},`;
    else if (message.constructor == Object) {
        for (const key in object) {
            add_message(message[key]);
        }
    } else {
        content = `${conrent}${message+''},`
    }
}

const msg = new Message();
export default msg;