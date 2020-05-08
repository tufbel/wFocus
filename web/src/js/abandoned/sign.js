/*
 * @Author: Lumoon 
 * @Date: 2019-12-03 21:54:02 
 * @Last Modified by: Lumoon
 * @Last Modified time: 2019-12-04 13:29:22
 * @description: 登录注册页面控制
 */

"use strict";

import msg from "../message.js";

class Sign {

    constructor() {
        this.signin_judge = {
            email: false,
            password: false,
            set email(val) {
                console.log(this);
            },
            get email() {
                return this.email;
            }
        }
        this.password_signin = true;
        this.password_signup = true;
        this.username

        this._run();
    }

    _run() {
        let self = this;

        self._input_focus_lisenter();
        self._email_check();
        self._password_check();
        self._username_check();
        self._add_shift_listener();
        self._add_signin_listener();
        self._add_signup_listener();
    }

    _input_focus_lisenter() {
        let self = this;
        $(`input`).focus(function (e) {
            $(this).css(`color`, ``);
        });
    }



    _email_check() {
        let self = this;
        let email_re = /^[A-Za-z0-9\u4e00-\u9fa5]+@[a-zA-Z0-9_-]+(\.[a-zA-Z0-9_-]+)+$/
        let email_element = $(`input[name="email"]`);
        email_element.blur(function (e) {
            let input = $(this).val();
            if (input) {
                if (email_re.test(input)) {
                    $(this).attr(`data-input-check`, `true`);
                } else {
                    $(this).attr(`data-input-check`, `false`);
                    $(this).css(`color`, `red`);
                }
                $(this).addClass(`fixed`);
            } else {
                $(this).attr(`data-input-check`, `false`);
                $(this).removeClass(`fixed`);
            }
            if ($(this).parents(`#signin`).length > 0) {
                self._button_disabled_signin();
            } else {
                self._button_disabled_signup();
            }
        })
    }

    _password_check() {
        let self = this;
        let password_re = /^[a-zA-Z0-9][_a-zA-Z0-9]{4,14}[a-zA-Z0-9]$/;
        let password_element = $(`input[type="password"]`);
        password_element.blur(function (e) {
            let input = $(this).val();
            if (input) {
                if (/password_again/i.test($(this).attr(`name`))) {
                    let again = $(this).parents(`#signup`).find(`[name="password"]`).val();
                    if (again == input) {
                        if (password_re.test(input)) {
                            $(this).attr(`data-input-check`, `true`);
                        } else {
                            $(this).attr(`data-input-check`, `false`);
                            $(this).css(`color`, `red`);
                            if (self.password_signup) {
                                msg.warning_message(`&emsp;&emsp;请输入6-16位数字字母下下划线组成的密码，并且不能以下划线开头结尾。`);
                                self.password_signup = false;
                            }
                        }
                    } else {
                        $(this).attr(`data-input-check`, `false`);
                        $(this).css(`color`, `red`);
                        msg.warning_message(`&emsp;&emsp;两次输入密码不一致。`);
                    }
                } else {
                    if (password_re.test(input)) {
                        $(this).attr(`data-input-check`, `true`);
                    } else {
                        $(this).attr(`data-input-check`, `false`);
                        $(this).css(`color`, `red`);
                        if ($(this).parents(`#signin`).length > 0) {
                            if (self.password_signin) {
                                msg.warning_message(`&emsp;&emsp;请输入6-16位数字字母下下划线组成的密码，并且不能以下划线开头结尾。`);
                                self.password_signin = false;
                            }
                        } else {
                            if (self.password_signup) {
                                msg.warning_message(`&emsp;&emsp;请输入6-16位数字字母下下划线组成的密码，并且不能以下划线开头结尾。`);
                                self.password_signup = false;
                            }
                        }
                    }
                }
                $(this).addClass(`fixed`);
            } else {
                $(this).attr(`data-input-check`, `false`);
                $(this).removeClass(`fixed`);
            }
            if ($(this).parents(`#signin`).length > 0) {
                self._button_disabled_signin();
            } else {
                self._button_disabled_signup();
            }
        })
    }

    _username_check() {
        let self = this;
        let username_re = /^[a-zA-Z][_a-zA-Z0-9]{5,19}$/;
        $(`#signup`).on(`blur`, `input[name="username"]`, function (e) {
            let input = $(this).val();
            if (input) {
                if (username_re.test(input)) {
                    $(this).attr(`data-input-check`, `true`);
                } else {
                    $(this).attr(`data-input-check`, `false`);
                    $(this).css(`color`, `red`);
                }
                $(this).addClass(`fixed`);
            } else {
                $(this).attr(`data-input-check`, `false`);
                $(this).removeClass(`fixed`);
            }
        });
    }

    _add_shift_listener() {
        let shift = $(`[for="sign-form-manage"]`);
        shift.click(function (e) {
            console.log(`切换`);
        })
    }

    _button_disabled_signin() {
        let self = this;
        let signin = $(`#signin`);
        let signin_judge = [...signin.find(`input`)].every((element) => {
            let judge = $(element).attr(`data-input-check`);
            if (judge && /true/i.test(judge))
                return true
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
        let signup_judge = [...signup.find(`input`)].every((element) => {
            let judge = $(element).attr(`data-input-check`);
            if (judge && /true/i.test(judge))
                return true
            return false;
        });
        if (signup_judge) {
            signup.find(`.sign-manage button`).removeClass(`no-click`);
        } else {
            signup.find(`.sign-manage button`).addClass(`no-click`);
        }
    }

    _add_signin_listener() {
        let self = this;
        $(`#signin`).on(`click`, `.sign-manage button`, function (e) {
            console.log(e);
        });
    }
    _add_signup_listener() {
        let self = this;
        $(`#signup`).on(`click`, `.sign-manage button`, function (e) {
            console.log(e);
        });
    }
}

let sign_manage = new Sign();