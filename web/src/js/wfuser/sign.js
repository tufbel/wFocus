/*
 * @Author: Lumoon 
 * @Date: 2019-12-03 21:54:02 
 * @Last Modified by: Lumoon
 * @Last Modified time: 2019-12-06 21:38:42
 * @description: 登录注册页面控制
 */

"use strict";

import msg from "../message.js";

class Sign {

    constructor() {
        this._init_judge_signin();
        this._init_judge_signup();

        this._run();
    }

    _run() {
        let self = this;

        self._input_focus_lisenter();
        self._remember_listener();
        self._add_signin_listener();
        self._add_signup_listener();
        self._send_listener();
        self._img_listener();

        self._email_check();
        self._password_check();
        self._username_check();
        self._password_again_check();
        self._captcha_check();
    }

    _init_judge_signin() {
        let self = this;
        let email_el = $(`#signin input[name="email"]`);
        let password_el = $(`#signin input[name="password"]`);
        self.signin = {
            data: {
                email: null,
                password: null,
                remember: false
            },
            set email(val) {
                if (val) {
                    email_el.attr(`data-input-check`, `true`);
                    this.data.email = val;
                } else {
                    email_el.attr(`data-input-check`, `false`);
                    this.data.email = null;
                };
            },
            get email() {
                return this.data.email
            },
            set password(val) {
                if (val) {
                    password_el.attr(`data-input-check`, `true`);
                    this.data.password = val;
                } else {
                    password_el.attr(`data-input-check`, `false`);
                    this.data.password = null;
                };
            },
            get password() {
                return this.data.password;
            }
        }

        Object.defineProperty(self.signin, `data`, {
            enumerable: false
        })
    }

    _init_judge_signup() {
        let self = this;
        let username_el = $(`#signup input[name="username"]`);
        let email_el = $(`#signup input[name="email"]`);
        let password_el = $(`#signup input[name="password"]`);
        let password_again_el = $(`#signup input[name="password_again"]`);
        let email_captcha_el = $(`#signup input[name="email_captcha"]`);
        let img_captcha_el = $(`#signup input[name="img_captcha"]`);
        self.signup = {
            data: {
                username: null,
                email: null,
                password: null,
                password_again: null,
                email_captcha: null,
                img_captcha: null
            },
            set username(val) {
                if (val) {
                    username_el.attr(`data-input-check`, `true`);
                    this.data.username = val;
                } else {
                    username_el.attr(`data-input-check`, `false`);
                    this.data.username = null;
                }
            },
            get username() {
                return this.data.username
            },
            set email(val) {
                if (val) {
                    email_el.attr(`data-input-check`, `true`);
                    this.data.email = val;
                } else {
                    email_el.attr(`data-input-check`, `false`);
                    this.data.email = null;
                }
            },
            get email() {
                return this.data.email
            },
            set password(val) {
                if (val) {
                    password_el.attr(`data-input-check`, `true`);
                    this.data.password = val;
                } else {
                    password_el.attr(`data-input-check`, `false`);
                    this.data.password = null;
                }
            },
            get password() {
                return this.data.password
            },
            set password_again(val) {
                if (val) {
                    password_again_el.attr(`data-input-check`, `true`);
                    this.data.password_again = val;
                } else {
                    password_again_el.attr(`data-input-check`, `false`);
                    this.data.password_again = null;
                }
            },
            get password_again() {
                return this.data.password_again
            },
            set email_captcha(val) {
                if (val) {
                    email_captcha_el.attr(`data-input-check`, `true`);
                    this.data.email_captcha = val;
                } else {
                    email_captcha_el.attr(`data-input-check`, `false`);
                    this.data.email_captcha = null;
                }
            },
            get email_captcha() {
                return this.data.email_captcha
            },
            set img_captcha(val) {
                if (val) {
                    img_captcha_el.attr(`data-input-check`, `true`);
                    this.data.img_captcha = val;
                } else {
                    img_captcha_el.attr(`data-input-check`, `false`);
                    this.data.img_captcha = null;
                }
            },
            get img_captcha() {
                return this.data.img_captcha
            },
        }

        Object.defineProperty(self.signup, `data`, {
            enumerable: false
        })
    }

    _input_focus_lisenter() {
        let self = this;
        $(`input`).focus(function (e) {
            $(this).css(`color`, ``);
        });
    }

    _email_check() {
        let self = this;
        let email_re = /^[A-Za-z0-9\u4e00-\u9fa5]+@[a-zA-Z0-9_-]+(\.[a-zA-Z0-9_-]+)*(\.(com|cn|online))$/;
        $(`.sign-form article`).on(`blur`, `input[name="email"]`, function (e) {
            let input = this.value;
            if (/signin/i.test(e.delegateTarget.id)) {
                if (input) {
                    if (email_re.test(input)) {
                        self.signin.email = input;
                    } else {
                        self.signin.email = null;
                        $(this).css(`color`, `red`);
                    }
                    $(this).addClass(`fixed`);
                } else {
                    self.signin.email = null;
                    $(this).removeClass(`fixed`);
                }
                self._button_disabled_signin();
            } else {
                if (input) {
                    if (email_re.test(input)) {
                        self.signup.email = input;
                        $(e.delegateTarget).find(`[name="email_send"]`).removeClass(`no-click`);
                    } else {
                        $(e.delegateTarget).find(`[name="email_send"]`).addClass(`no-click`);
                        self.signup.email = null;
                        $(this).css(`color`, `red`);
                    }
                    $(this).addClass(`fixed`);
                } else {
                    $(e.delegateTarget).find(`[name="email_send"]`).addClass(`no-click`);
                    self.signup.email = null;
                    $(this).removeClass(`fixed`);
                }
                self._button_disabled_signup();
            }
        });
    }
    _password_check() {
        let self = this;
        let password_re = /^[a-zA-Z0-9][_a-zA-Z0-9]{4,14}[a-zA-Z0-9]$/;
        $(`.sign-form article`).on(`blur`, `input[name="password"]`, function (e) {
            let input = this.value;
            if (/signin/i.test(e.delegateTarget.id)) {
                if (input) {
                    if (password_re.test(input)) {
                        self.signin.password = input;
                    } else {
                        msg.warning_message(`密码应有6-16位数字字母下划线组成，且不能以下划线开头或结尾。`);
                        self.signin.password = null;
                        $(this).css(`color`, `red`);
                    }
                    $(this).addClass(`fixed`);
                } else {
                    self.signin.password = null;
                    $(this).removeClass(`fixed`);
                }
                self._button_disabled_signin();
            } else {
                if (input) {
                    if (password_re.test(input)) {
                        self.signup.password = input;
                    } else {
                        msg.warning_message(`密码应有6-16位数字字母下划线组成，且不能以下划线开头或结尾。`);
                        self.signup.password = null;
                        $(this).css(`color`, `red`);
                    }
                    $(this).addClass(`fixed`);
                } else {
                    self.signup.password = null;
                    $(this).removeClass(`fixed`);
                }
                self._button_disabled_signup();
            }
        });
    }

    _username_check() {
        let self = this;
        let username_re = /^[a-zA-Z][_a-zA-Z0-9]{2,19}$/;
        $(`#signup`).on(`blur`, `input[name="username"]`, function (e) {
            let input = this.value;
            if (input) {
                if (username_re.test(input)) {
                    self.signup.username = input;
                } else {
                    msg.warning_message(`用户名必须以字母开头且以3-20位数字字母下划线组成。`);
                    self.signup.username = null;
                    $(this).css(`color`, `red`);
                }
                $(this).addClass(`fixed`);
            } else {
                self.signup.username = null;
                $(this).removeClass(`fixed`);
            }
            self._button_disabled_signup();
        });
    }

    _password_again_check() {
        let self = this;
        let password_again_re = /^[a-zA-Z0-9][_a-zA-Z0-9]{4,14}[a-zA-Z0-9]$/;
        $(`#signup`).on(`blur`, `input[name="password_again"]`, function (e) {
            let input = this.value;
            if (input) {
                if (password_again_re.test(input) && input == self.signup.password) {
                    self.signup.password_again = input;
                } else {
                    msg.warning_message(`&emsp;&emsp;请检查两次密码是否输入一致且均符合要求。`);
                    self.signup.password_again = null;
                    $(this).css(`color`, `red`);
                }
                $(this).addClass(`fixed`);
            } else {
                self.signup.password_again = null;
                $(this).removeClass(`fixed`);
            }
            self._button_disabled_signup();
        });
    }

    _captcha_check() {
        let self = this;
        let captcha_re = /^[a-zA-Z0-9]{4}$/;
        $(`#signup`).on(`blur`, `.captcha input`, function (e) {
            let input = this.value;
            if (input) {
                if (captcha_re.test(input)) {
                    self.signup[this.name] = input;
                } else {
                    self.signup[this.name] = null;
                    $(this).css(`color`, `red`);
                }
                $(this).addClass(`fixed`);
            } else {
                self.signup[this.name] = null;
                $(this).removeClass(`fixed`);
            }
            self._button_disabled_signup();
        });
    }

    _button_disabled_signin() {
        let self = this;
        let signin = $(`#signin`);
        let signin_judge = Object.values(self.signin).every((val) => {
            if (val) {
                return true;
            }
            return false;
        });
        if (signin_judge) {
            signin.find(`.sign-manage button`).removeClass(`no-click`);
        } else {
            signin.find(`.sign-manage button`).addClass(`no-click`);
        }
    }

    _button_disabled_signup() {
        let self = this;
        let signup = $(`#signup`);
        let signup_judge = Object.values(self.signup).every((val) => {
            if (val) {
                return true;
            }
            return false;
        });
        if (signup_judge) {
            signup.find(`.sign-manage button`).removeClass(`no-click`);
        } else {
            signup.find(`.sign-manage button`).addClass(`no-click`);
        }
    }

    _remember_listener() {
        let self = this;
        $(`#remember`).change(function (e) {
            self.signin.data.remember = this.checked;
        });
    }
    _send_listener() {
        let self = this;
        $(`[name="email_send"]`).click(function (e) {
            msg.ok_message(`验证码以发送，5分钟内有效，请注意查收。`);
            wfajax.post({
                url: `/account/emailcaptcha`,
                data: {
                    email: self.signup.email
                },
                fail: (error) => {
                    // 请求失败
                    console.log(`服务崩溃${error}`);
                }
            });
            let num = 60;
            $(this).addClass(`no-click`);
            $(this).html(`${num--}s`);
            let timer = setInterval(() => {
                $(this).html(`${num--}s`);
                if (num < 0) {
                    $(this).removeClass(`no-click`);
                    $(this).html(`Send`);
                    clearInterval(timer);
                }
            }, 1000);
        });
    }

    _img_listener() {
        let self = this;
        $(`[name="img_captcha"]`).one(`focus`, function (e) {
            $(this).next(`img`).attr({
                src: `/account/imgcaptcha/?random=${Math.random()}`
            });
        })
        $(`.captcha img`).click(function (e) {
            $(this).attr({
                src: `/account/imgcaptcha/?random=${Math.random()}`
            });
        });
    }

    _add_signin_listener() {
        let self = this;
        $(`#signin`).on(`click`, `.sign-manage button`, function (e) {
            wfajax.post({
                url: `/account/signin${window.location.search}`,
                data: self.signin.data,
                success: (response) => {
                    console.log(response);
                    if (response.code == 200) {
                        window.location.href = response.data.next;
                    } else {
                        msg.error_message(response.message);
                    }
                },
                fail: (error) => {
                    // 请求失败
                    console.log(`服务崩溃${error}`);
                }
            });
        });
    }
    _add_signup_listener() {
        let self = this;
        $(`#signup`).on(`click`, `.sign-manage button`, function (e) {
            wfajax.post({
                url: `/account/signup${window.location.search}`,
                data: self.signup.data,
                success: (response) => {
                    if (response.code == 200) {
                        window.location.href = response.data.next;
                    } else {
                        if (Array.isArray(response.message)) {
                            msg.error_message(response.message[0]);
                        } else {
                            msg.error_message(response.message);
                        }
                    }
                },
                fail: (error) => {
                    // 请求失败
                    console.log(`服务崩溃${error}`);
                }
            });
        });
    }
}

let sign_manage = new Sign();