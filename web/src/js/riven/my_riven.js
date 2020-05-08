import msg from '../message.js'

function MyRiven() {

}

MyRiven.prototype.run = function () {
    let self = this;
    self.listenChangePriceEvent();
    self.listenQueryMsgEvent();
    self.listenNotSellRivenEvent();
    self.listenNotAuditEvent();
};


//监听修改价格按钮事件
MyRiven.prototype.listenChangePriceEvent = function () {
    let self = this;
    //捕获点击修改价格按钮  
    $('.change-price-btn').click(function () {
        let changePriceBtn = $(this);
        let riven_id = $(this).parent().parent().prev().children().eq(0).children().eq(1).text();
        myajax.get({
            'url': '/rivenmygoods/change_price/',
            'data': {
                'riven_id': riven_id
            },
            'success': function (result) {
                let data = result['data'];
                let code = result['code'];
                let message = result['message'];
                if (code === 200) {
                    change_price(data, changePriceBtn);
                } else {
                    msg.error_message(message);
                }
            },
            'error': function (error) {
                console.error(`请求失败：${error.status}`);
            }
        });
    });
}

//修改价格及关闭修改紫卡价格界面
function change_price(riven, changePriceBtn) {
    let other_box = $('.other-box');
    let html =
        `
        <div class="change-price-box">
            <div>
                <span>${ riven.riven_name }</span>  
            </div>
            <div>
                <ul class="property">

                </ul> 
            </div> 
            <div>
                <input name="price" type="text" placeholder="价格" maxlength='4' oninput="value=value.replace(/[^0-9]/g,'')" value="${ riven.price }">
                <button class="confirm-btn">确认</button> 
            </div>  
            <div class="close-change-price"><i class="icon-guanbi iconfont"></i></div>
        </div>
        `;
    other_box.html(html);
    let property = other_box.find('.property');
    $.each(riven.properties, function (k, v) {
        let li = $('<li>' + k + v + '</li>');
        li.appendTo(property);
    });

    let change_price_box = changePriceBtn.parent().parent().parent().parent().children().eq(1).children(); //获取修改紫卡价格的盒子
    other_box.show();
    change_price_box.animate({
        'width': '350px',
        'height': '550px',
    }, 400);

    //捕获确认修改按钮
    $('.confirm-btn').click(function () {
        let price = $(this).prev().val();
        let riven_id = changePriceBtn.parent().parent().prev().children().eq(0).children().eq(1).text();
        console.log(price);
        console.log(riven_id);

        myajax.post({
            'url': '/rivenmygoods/change_price/',
            'data': {
                'riven_id': riven_id,
                'price': price,
            },
            'success': function (result) {
                let code = result['code'];
                let message = result['message'];
                if (code === 200) {
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

    });

    //捕获关闭修改价格界面按钮
    $('.close-change-price').click(function () {
        let change_price_box = $(this).parent();
        change_price_box.animate({
            'width': '0',
            'height': '0',
        }, 400);
        other_box.hide();
        other_box.empty();
    });
}

//监听查看留言按钮事件
MyRiven.prototype.listenQueryMsgEvent = function () {
    let self = this;
    //捕获点击查看留言按钮
    $('.query-msg-btn').click(function () {
        let queryMsgBtn = $(this);
        let riven_id = $(this).parent().parent().prev().children().eq(0).children().eq(1).text();
        myajax.post({
            'url': '/msgs/query_parent_msg/',
            'data': {
                'riven_id': riven_id,
            },
            'success': function (result) {
                let msgs = result['data'];
                let code = result['code'];
                let message = result['message'];
                if (code === 200) {
                    parent_msg_list(msgs, riven_id);
                    queryMsgBtn.children().hide(); //隐藏新消息提示
                    queryMsgBtn.parent().parent().prev().children().eq(3).hide(); //隐藏新消息提示
                    myajax.get({
                        'url': '/rivenmygoods/new_msg/',
                        'data': {},
                        'success': function (result) {
                            let data = result['data'];
                            if (data.length === 0) {
                                $('.title-new-msg').hide(); //隐藏新消息提示
                            }
                        },
                        'error': function (error) {
                            console.error(`请求失败：${error.status}`);
                        }
                    });
                }
            }
        });
    });
};

//初始化留言板及关闭查看留言界面
function parent_msg_list(msgs, riven_id) {

    let other_box = $('.other-box');
    let box_html =
        `
        <div class="message-board" riven-id=''>
            <div class="query-msg-logo">
                <span>留言板</span>
            </div>
            <div class="query-msg-comment">
                <textarea name="" id="" cols="30" rows="3"></textarea>
                <button id="write-self-msg-btn">发送</button>
            </div>
            <div class="query-msg-content">
                <div></div>
            </div>
            <div class="close-query-msg"><i class="icon-guanbi iconfont"></i></div>
        </div>
        `;

    other_box.html(box_html);
    $('.message-board').attr('riven-id', riven_id);
    if (msgs.length > 0) {
        //渲染父留言
        for (let i = 0; i < msgs.length; i++) {
            let msg_wrapper = $('<div class="msg-wrapper" parent-msg-id= )></div>');
            msg_wrapper.attr('parent-msg-id', msgs[i].id)
            let html = ``;
            html =
                `
            <div class="parent-msg-box">
                <div class="parent-msg-data">
                    <span>${ msgs[i].writer.username }:</span>
                    <span>${ msgs[i].content }</span>
                </div>
                <div class="parent-msg-other">
                    <div>
                        <span>${ time_since(msgs[i].comment_time) }</span>
                        <span class="show-children-msg-box" show-children=false>共${ msgs[i].children_count }条回复<i class="iconfont"></i> </span>
                    </div>
                    <span class="show-release-msg-box" show-release=false>回复</span>
                </div>
            </div>
            <div class="release-msg-box" style="display: none;">
                <input class="children-content" placeholder="请输入回复内容">
                <button class="release-parent-msg-btn">确认</button>
            </div>
            <div class="children-msg-box" style="display: none;"></div>
            `;

            msg_wrapper.html(html);
            $('.query-msg-content>div').append(msg_wrapper);
        };
    } else {
        let msg_box_content = $('<span class="no-msg-content">该紫卡还没人留下足迹</span>');
        msg_box_content.appendTo($('.query-msg-content'));
    }

    other_box.show();

    //关闭查看留言界面
    $('.close-query-msg').click(function () {
        other_box.hide();
        other_box.empty();
    });
}

//监听下架紫卡事件
MyRiven.prototype.listenNotSellRivenEvent = function () {
    //捕获下架紫卡按钮
    $('.delete-riven-btn').click(function () {
        if (confirm("确实要下架吗？")) {
            let riven_id = $(this).parent().parent().prev().children().eq(0).children().eq(1).text();
            myajax.post({
                'url': '/rivenmygoods/not_sell_riven/',
                'data': {
                    'riven_id': riven_id
                },
                'success': function (result) {
                    let code = result['code'];
                    let message = result['message'];
                    if (code === 200) {
                        window.location.reload();
                        msg.ok_message(message)
                    } else {
                        msg.error_message(message)
                    }
                },
                'error': function (error) {
                    console.error(`请求失败：${error.status}`);
                }
            });

        } else {
            alert("已经取消下架！");
        }
    });
}

//监听取消审核事件
MyRiven.prototype.listenNotAuditEvent = function () {
    //捕获取消审核按钮
    $('.not-audit-btn').click(function () {
        let riven_id = $(this).parent().parent().prev().find('#my-riven-id').text();
        if (confirm("确定要取消审核吗？")) {
            myajax.post({
                'url': '/rivenmygoods/not_audit_riven/',
                'data': {
                    'riven_id': riven_id
                },
                'success': function (result) {
                    let code = result['code'];
                    let message = result['message'];
                    if (code === 200) {
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

        }
    })
}

//时间过滤器
function time_since(dateValue) {
    let date = new Date(dateValue);
    let datets = date.getTime(); //转化为毫秒
    let nowts = (new Date()).getTime();
    let timestamp = (nowts - datets) / 1000;
    if (timestamp < 60) {
        return '刚刚';
    } else if (timestamp >= 60 && timestamp < 60 * 60) {
        let minutes = parseInt(timestamp / 60);
        return minutes + '分钟前';
    } else if (timestamp >= 60 * 60 && timestamp < 60 * 60 * 24) {
        let hours = parseInt(timestamp / 60 / 60);
        return hours + '小时前';
    } else if (timestamp >= 60 * 60 * 24 && timestamp < 60 * 60 * 24 * 30) {
        let days = parseInt(timestamp / 60 / 60 / 24);
        return days + '天前';
    } else {
        let year = date.getFullYear();
        let month = date.getMonth();
        let day = date.getDay();
        let hour = date.getHours();
        let minute = date.getMinutes();
        return year + '/' + month + '/' + day + ' ' + hour + ':' + minute
    }
}

let my_rivenclick = new MyRiven();
export default my_rivenclick;