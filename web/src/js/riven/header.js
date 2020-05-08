import msg from '../message.js'

//网页元素全部加载完成,执行该函数
$(function () {
    let menuItem = new MenuItem();
    menuItem.run();

    let wfUser = new WfUser();
    wfUser.run();
});

//紫卡市场导航栏构造函数
function MenuItem() {
    this.items = $('.item')
}

MenuItem.prototype.run = function () {
    let self = this;
    self.listenmenuItemEvent();
};


//监听紫卡市场主菜单事件
MenuItem.prototype.listenmenuItemEvent = function () {
    let self = this;

    // self.items.click(function () {
    //     $(this).addClass('active').siblings().removeClass('active');
    // });
};


//用户登录构造函数
function WfUser() {
    let self = this;
    self.maskWrapper = $('.mask-wrapper'); //模态框
    self.personalbackBox = $('.personal-back-box'); //登录后个人信息框
    self.personalfrontBox = $('.personal-front-box'); //登录框
}

WfUser.prototype.run = function () {
    let self = this;
    self.listenShowHideEvent(); //监听用户模态框的显示与隐藏事件
    // self.listenLoginEvent(); //监听用户登录事件
    // self.listenLogoffEvent(); //监听用户注销事件
};

//切换至用户个人信息框
WfUser.prototype.ShowUserinfoBox = function () {
    let self = this;
    self.personalbackBox.css("transform", "perspective(900px) rotateY(180deg)");
    self.personalbackBox.css("transition", "1s");
    self.personalbackBox.prev().css("transform", "perspective(900px) rotateY(0deg)");
    self.personalbackBox.prev().css("transition", "1s");
};

//切换至登录框
WfUser.prototype.HideUserinfoBox = function () {
    let self = this;
    self.personalfrontBox.css("transform", "perspective(900px) rotateY(180deg)");
    self.personalfrontBox.css("transition", "1s");
    self.personalfrontBox.next().css("transform", "perspective(900px) rotateY(0deg)");
    self.personalfrontBox.next().css("transition", "1s");

};

//显示模态框
WfUser.prototype.ShowEvent = function () {
    let self = this;
    self.maskWrapper.show();
};

//隐藏模态框
WfUser.prototype.hideEvent = function () {
    let self = this;
    self.maskWrapper.hide();
};

//监听用户模态框的显示与隐藏事件
WfUser.prototype.listenShowHideEvent = function () {
    let self = this;
    let signinBtn = $('#signin-btn');
    let userinforBtn = $('#userinfor-btn');
    let closeBtn = $('.close-box');

    //显示用户登录前模态框
    // signinBtn.click(function () {
    //     self.ShowEvent();
    // });

    //显示用户登录后模态框
    userinforBtn.click(function () {
        self.ShowUserinfoBox();
        self.ShowEvent();
    });

    //隐藏用户登录前后模态框
    closeBtn.click(function () {
        self.hideEvent();
        window.location.reload();
    });
};

//监听用户登录事件
WfUser.prototype.listenLoginEvent = function () {
    let self = this;
    let userloginBtn = $('#user-login');

    //用户点击登录按钮
    userloginBtn.click(function () {

        //获取用户手机号,密码
        let email = $("input[name='email']").val();
        let password = $("input[name='password']").val();

        if (email && password) {
            myajax.post({
                'url': '/account/signin',
                'data': {
                    'email': email,
                    'password': password,
                },
                'success': function (result) {
                    //状态码等于200,才执行success回调函数,其中result为服务器返回的数据
                    let code = result['code'];
                    let message = result['message'];
                    if (code === 200) {
                        let username = $('#user-name');
                        let user_email = $('#user-email');
                        username.text(result['data'].username);
                        user_email.text(result['data'].email);
                        msg.ok_message(message);
                        self.ShowUserinfoBox();
                    }
                    if (code === 400) {
                        msg.error_message(message);
                    }
                },
                'fail': function (error) {
                    alert(error);
                }
            });
        } else {
            msg.error_message('请输入账号及密码');
        }


    });
};

//监听用户注销事件
WfUser.prototype.listenLogoffEvent = function () {
    let self = this;
    let userlogoffBtn = $('#user-logoff');

    //用户点击注销按钮
    userlogoffBtn.click(function () {
        myajax.post({
            'url': '/account/signout/',
            'data': {},
            'success': function (result) {
                //状态码等于200,才执行success回调函数,其中result为服务器返回的数据
                let message = result['message'];
                let code = result['code'];
                if (code == 200) {
                    msg.ok_message(message);
                    self.HideUserinfoBox();
                } else {
                    msg.error_message(message);
                }
            },
            'error': function (error) {
                console.error(`请求失败：${error.status}`);
            }
        });
    });
};