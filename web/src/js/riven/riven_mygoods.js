import msg from '../message.js';
import my_rivenclick from '../riven/my_riven.js';

$(function () {
    let rivenMygoods = new RivenMygoods();
    rivenMygoods.run();
});

function RivenMygoods() {

}

RivenMygoods.prototype.run = function () {
    let self = this;
    self.get_my_riven_info();
    self.releaseRivenEvent();

};

//初始化获取紫卡信息
RivenMygoods.prototype.get_my_riven_info = function () {
    let self = this;
    myajax.post({
        'url': '/rivenmygoods/',
        'data': {},
        'success': function (result) {
            self.riven_data = result['data'];

            let code = result['code'];
            let message = result['message'];
            if (code === 200) {
                self.my_riven_list();

                if (my_rivenclick)
                    my_rivenclick.run();

            } else if (code === 400) {
                msg.error_message(message)
            }
        },
        'fail': function () {

        }
    });
};

//遍历我的紫卡并渲染到我的紫卡界面
RivenMygoods.prototype.my_riven_list = function () {
    let self = this;

    //遍历我的紫卡并渲染到我的紫卡界面
    for (let i = 0; i < self.riven_data.length; i++) {
        let html = ``;
        let my_riven = $(`<section class="my-riven-box"></section>`);

        //上架的紫卡
        if (self.riven_data[i].is_sell == 1) {
            html =
                `
                <div class="below-wrapper">
                    <div>
                        <span>${ self.riven_data[i].riven_name }</span>
                        <span id = "my-riven-id" >${ self.riven_data[i].id }</span>
                    </div>
                    <div>
                        <ul class="property">
                            
                        </ul>
                    </div>
                    <div>
                        <span>${ self.riven_data[i].price }p</span>
                    </div>
                    <span class="icon-dian iconfont new-msg"></span>
                </div>
                <div class="above-wrapper">
                    <ul>
                        <li class="change-price-btn">修改价格</li>
                        <li class="query-msg-btn">查看留言<span class = "icon-dian iconfont new-msg"></span></li>
                        <li class="delete-riven-btn">下架紫卡</li>
                    </ul>
                </div>
                `;
        }
        //审核的紫卡
        if (self.riven_data[i].is_sell == 3) {
            html =
                `
                <div class="below-wrapper" style="overflow: hidden;">
                    <div>
                        <span>${ self.riven_data[i].riven_name }</span>
                        <span id = "my-riven-id" >${ self.riven_data[i].id }</span>
                    </div>
                    <div>
                        <ul class="property">
                            
                        </ul>
                    </div>
                    <div>
                        <span>${ self.riven_data[i].price }p</span>
                    </div>
                    <div class="audit-logo">审核中</div>
                </div>
                <div class="above-wrapper">
                    <ul>
                        <li class="not-audit-btn">取消审核</li>
                    </ul>
                </div>
                `;
        }


        my_riven.html(html);
        $('.my-riven-wrapper').append(my_riven);

        let property = my_riven.find('.property');
        $.each(self.riven_data[i].properties, function (k, v) {
            let li = $('<li>' + k + v + '</li>');
            li.appendTo(property);
        });
    }

    //查找最新留言
    myajax.get({
        'url': '/rivenmygoods/new_msg/',
        'data': {},
        'success': function (result) {
            let data = result['data'];
            $('.my-riven-box').each(function () {
                let my_riven_id = $(this).children().eq(0).children().eq(0).children().eq(1).text();
                for (let i = 0; i < data.length; i++) {
                    if (my_riven_id == data[i].riven_id) {
                        $(this).children().eq(0).children().eq(3).show();
                        $(this).children().eq(1).children().children().eq(1).children().show();
                    }
                }
            })
        },
        'fail': function () {

        }
    });
};

//监听发布紫卡事件及渲染发布紫卡界面
RivenMygoods.prototype.releaseRivenEvent = function () {
    let other_box = $('.other-box');
    $('.add-my-riven-box').click(function () {
        let html =
            `
            <div class="riven-sell">
                <div class="riven-image-wrapper">
                    <span class="icon-ziyuan iconfont new-image-logo"></span>
                    <input type="file" id="file-btn">
                </div>
                <div class="sell-data-wrapper">
                    <div class="sell-data-above">
                        <div class="riven-sell-data">
                            <span class="riven-sell-name"></span>
                            <ul class="riven-sell-property">

                            </ul>
                        </div>
                        <div class="riven-sell-price">
                            <input type="text" name="price" maxlength='4' oninput="value=value.replace(/[^0-9]/g,'')" placeholder="价格">
                        </div>
                        <button id="riven-sell-btn">发布</button>
                        <span id="submit-audit-btn">提交人工审核</span>
                    </div>
                    <div class="sell-data-below">
                        <span>点击上方添加紫卡图片</span>
                        <span>发布的紫卡信息将由图片识别获取</span>
                        <span>为了保证识别出正确紫卡信息,<a>请按下图样式提供图片</a></span>
                        <span>若无法获取正确的紫卡信息,可选择提交人工审核</span>
                        <img src="/static/img/zika.jpg">
                    </div>
                </div>
                <div class="close-release-riven">
                    <i class="icon-guanbi iconfont"></i>
                </div>
            </div>
            `;
        other_box.html(html);
        other_box.show(); //显示蒙层

        listenUpFile(); //上传紫卡图片

        //捕获关闭蒙层按钮
        $('.close-release-riven').click(function () {
            other_box.hide();
        });
    });

};

//上传紫卡图片
function listenUpFile() {
    let self = this;
    let riven_sell = $('.riven-sell');
    let riven_image_wrapper = $('.riven-image-wrapper');
    let fileBtn = $('#file-btn'); //上传文件按钮
    let new_image_logo = $('.new-image-logo');

    //监听input内容变化并回显图片
    fileBtn.change(function () {
        let f = this.files[0];
        console.log(f);
        let reader = new FileReader();
        reader.readAsDataURL(f);

        //图片回显
        reader.onload = function (e) {
            let new_image = $('<img class="new-image">');
            let new_button = $('<button class="new-btn">×</button>');
            new_image.attr('src', e.target.result);
            riven_image_wrapper.append(new_image);
            riven_image_wrapper.append(new_button);
            new_image_logo.hide(); //隐藏上传图片中心图标
            fileBtn.hide(); //隐藏上传图片按钮
            $('.sell-data-above').css({
                'height': '100%',
                'transition': 'all 0.3s ease-in',
            });
            off_btn(riven_sell); //删除当前上传的图片
        };

        //上传图片及识别出图片信息
        let file = fileBtn[0].files[0]; //获取当前图片
        let formData = new FormData();
        formData.append('file', file);
        myajax.post({
            'url': '/rivenmygoods/upload_file/',
            'data': formData,
            'processData': false,
            'contentType': false,
            'success': function (result) {
                
                let message = result['message'];
                if (result['code'] === 200) {

                    let image_url = result['data']['img_name'];
                    let riven_name = result['data']['riven_name'];
                    let properties = result['data']['properties'];

                    $('.riven-sell-name').text(riven_name);
                    let riven_sell_property = $('.riven-sell-property');
                    $.each(properties, function (k, v) {
                        let li = $('<li>' + k + v + '</li>');
                        li.appendTo(riven_sell_property);
                    });
                    listenSubmitEvent(image_url, riven_name, properties); //监听发布紫卡按钮事件
                    listenAuditEvent(image_url, riven_name, properties); //监听提交人工审核事件
                }else{
                    msg.error_message(message);
                }
            },
        });
    });
};


//删除当前上传的图片
function off_btn(riven_sell) {
    let new_button = riven_sell.find('.new-btn');
    new_button.click(function () {
        riven_sell.find('.new-btn').remove();
        riven_sell.find('.new-image').remove();
        riven_sell.find('#file-btn').val('');
        riven_sell.find('#file-btn').show();
        riven_sell.find('.new-image-logo').show();
        riven_sell.find('.sell-data-above').css('height', '0');
        riven_sell.find('.riven-sell-name').text('');
        riven_sell.find('.riven-sell-property').empty();
        riven_sell.find('.riven-sell-price').children().val('');
    })
}

//监听发布紫卡按钮事件
function listenSubmitEvent(image_url, riven_name, properties) {
    let self = this;
    let rivenSellBtn = $("#riven-sell-btn");

    rivenSellBtn.click(function () {
        let price = $("input[name='price']").val();
        if (price != '') {
            let fileBtn = $('#file-btn');
            let file = fileBtn[0].files[0]; //获取当前图片
            let formData = new FormData();

            formData.append('riven_name', riven_name);
            formData.append('properties', JSON.stringify(properties));
            formData.append('price', price);
            formData.append('file', file);

            myajax.post({
                'url': '/rivenmygoods/pub_riven/',
                'data': formData,
                'processData': false,
                'contentType': false,
                'success': function (result) {
                    let message = result['message'];
                    if (result.code == 200) {
                        window.location.reload();
                        msg.ok_message(message);
                    } else {
                        msg.error_message(message);
                    }
                },
                'error': function (error) {
                    console.error(`请求失败：${error.status}`);
                }
            });
        } else {
            msg.error_message('请输入价格');
        }

    });
}

//监听提交人工审核事件
function listenAuditEvent(image_url, riven_name, properties) {
    let self = this;
    let rivenAuditBtn = $("#submit-audit-btn");

    rivenAuditBtn.click(function () {
        let price = $("input[name='price']").val();
        if (price != '') {
            if (confirm("确定要提交人工审核吗？")) {
                let fileBtn = $('#file-btn');
                let file = fileBtn[0].files[0]; //获取当前图片
                let formData = new FormData();

                formData.append('riven_name', riven_name);
                formData.append('properties', JSON.stringify(properties));
                formData.append('price', price);
                formData.append('file', file);

                myajax.post({
                    'url': '/rivenmygoods/audit_riven/',
                    'data': formData,
                    'processData': false,
                    'contentType': false,
                    'success': function (result) {
                        let message = result['message'];
                        if (result.code == 200) {
                            window.location.reload();
                            msg.ok_message(message);
                        } else {
                            msg.error_message(message);
                        }
                    },
                    'error': function (error) {
                        console.error(`请求失败：${error.status}`);
                    }
                });
            } else {
                console.log(`已取消提交。`);
            }
        } else {
            msg.error_message('请输入价格');
        }

    });

}