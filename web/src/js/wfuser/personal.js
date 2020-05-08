import msg from "../message.js";

$(function () {
    let personal_detail = new PersonalDetail;
    personal_detail.run();
});

function PersonalDetail() {

}

PersonalDetail.prototype.run = function () {
    let self = this;
    self.get_personal_info();
    self.listenCheckBtnEvent();
    self.listenUpImagEvent();
    self.listenSubmitCheckEvent();
    self.listenAuditBtnEvent();
};

//初始化个人中心界面
PersonalDetail.prototype.get_personal_info = function () {
    let self = this;
    let check_btn = $('#check-btn');
    let manual_check_btn = $('#manual-check-btn')
    myajax.post({
        'url': '/account/personal',
        'data': {},
        'success': function (result) {
            if (result.code == 200) {
                let user = result['data'];
                $("#user_name").text(user['username']);
                $("#user_email").text(user['email']);
                let game_id_data = user['game_id'];

                if (game_id_data == null) {
                    check_btn.show();
                    manual_check_btn.hide();
                } else {
                    $("#game_id").text(game_id_data);
                    check_btn.hide();
                    manual_check_btn.show();
                }
            } else {
                msg.error_message(result['message']);
                console.log(result);
            }
        },
        'error': function (error) {
            console.error(`请求失败：${error.status}`);
        }
    });
};

//显示或隐藏提交普通审核界面
PersonalDetail.prototype.listenCheckBtnEvent = function () {
    let check_btn = $('#check-btn');
    let information_check = $('.information-check');
    check_btn.click(function () {
        let judge = check_btn.attr('judge');
        if (/false/i.test(judge)) {
            information_check.css('height', '200px');
            check_btn.attr('judge', 'true');
        } else if (/true/i.test(judge)) {
            information_check.css('height', '0');
            check_btn.attr('judge', 'false');
        } else {
            information_check.css('height', '200px');
            check_btn.attr('judge', 'true');
        }
    });
}
//显示或隐藏提交人工审核界面
PersonalDetail.prototype.listenAuditBtnEvent = function () {
    let check_btn = $('#manual-check-btn');
    let information_check = $('.information-check');
    check_btn.click(function () {
        $(`.information-check`).find(`span`).html(`提交人工审核`);
        $(`.information-check`).find(`span`).css('left','230px');
        let judge = check_btn.attr('judge');
        if (/false/i.test(judge)) {
            information_check.css('height', '200px');
            check_btn.attr('judge', 'true');
        } else if (/true/i.test(judge)) {
            information_check.css('height', '0');
            check_btn.attr('judge', 'false');
        } else {
            information_check.css('height', '200px');
            check_btn.attr('judge', 'true');
        }
    });
}

//选择上传图片并回显
PersonalDetail.prototype.listenUpImagEvent = function () {
    let self = this;
    let information_check = $('.information-check');
    let uploadImgBtn = $('#uploadImgBtn');
    let input = $('#file');

    //捕获input内容变化
    input.change(function () {
        let f = this.files[0];
        let reader = new FileReader();
        reader.readAsDataURL(f);

        //图片回显
        reader.onload = function (e) {
            let new_div = $('<div class="pic"></div>');
            let new_img = $('<img>');
            let new_button = $('<button>×</button>');
            new_img.attr('src', e.target.result);
            new_div.append(new_img);
            new_div.append(new_button);
            information_check.append(new_div)
            uploadImgBtn.hide();
            show_off_btn(new_img, new_button); //显示或隐藏删除当前图片按钮
            off_btn(new_div, new_button, input); //删除当前图片
        }

    });

};

//游戏ID图片提交审核
PersonalDetail.prototype.listenSubmitCheckEvent = function () {
    let submit_btn = $('#submit-btn');
    submit_btn.click(function () {
        let input = $('#file');
        if (input.val() == '') {
            alert('请选择上传图片');
        } else {
            if (confirm("确定要提交审核吗？")) {
                let file = input[0].files[0]; //获取当前图片
                let formData = new FormData();
                formData.append('file', file);
                myajax.post({
                    'url': '/account/upload_file/',
                    'data': formData,
                    'processData': false,
                    'contentType': false,
                    'success': function (result) {
                        if (result['code'] === 200) {
                            msg.ok_message(result['message']);
                            submit_btn.parent().next().children().eq(1).click(); //删除回显图片
                        } else {
                            msg.error_message(result['message']);
                        }
                    },
                    'error': function (error) {
                        console.error(`请求失败：${error.status}`);
                    }
                });
            } else {
                msg.ok_message(`已取消提交`);
            }
        }

    })
};

//显示或隐藏删除当前图片按钮
function show_off_btn(new_img, new_button) {
    new_img.mouseover(function () {
        new_button.show();
    });
    new_img.mouseout(function () {
        new_button.hide();
    });
    new_button.mouseover(function () {
        new_button.show();
    });
    new_button.mouseout(function () {
        new_button.hide();
    });
};

//删除当前图片
function off_btn(new_div, new_button, input) {
    let uploadImgBtn = $('#uploadImgBtn');
    new_button.click(function () {
        input.val('');
        new_div.remove();
        uploadImgBtn.show();
    })
};