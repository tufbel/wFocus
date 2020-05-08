import msg from '../message.js';

$(function () {
    let collectionRiven = new CollectionRiven();
    collectionRiven.run();
});

function CollectionRiven() {
}

CollectionRiven.prototype.run = function () {
    let self = this;
    self.get_collection_info();
    self.listenCopyRivenEvent();
    self.listenMainWrapperEvent();
    self.listenQueryMsgEvent();
};

//获取我的收藏的紫卡信息并渲染到我的紫卡界面
CollectionRiven.prototype.get_collection_info = function () {
    myajax.post({
        'url': '/rivenmygoods/rivencollection/',
        'data': {

        },
        'success': function (result) {
            console.log(result);
            let riven_data = result['data'];
            let code = result['code'];
            let message = result['message'];
            console.log(riven_data);
            if (code === 200) {
                collection_list(riven_data);
            } else{
                msg.error_message(message);
            }
        },
        'error': function () {
            console.error(`请求失败：${error.status}`);
        }
    });

    //收藏的紫卡信息渲染到我的紫卡界面
    function collection_list(riven_data) {
        for (let i = 0; i < riven_data.length; i++) {
            let other_riven_box = $('<section class="other-riven-box "></section>');
            other_riven_box.attr('seller-game-name',riven_data[i].seller.game_name);
            let html = ``;
            if (riven_data[i].is_sell === 1) {
                html =
                    `
                    <div class="below-wrapper">
                            <div>
                                <span>${ riven_data[i].riven_name }</span>
                                <span id="my-riven-id">${ riven_data[i].id }</span>
                            </div>
                            <div>
                                <ul class="property">
                                    
                                </ul>
                            </div>
                            <div>
                                <span>${ riven_data[i].price }p</span>
                            </div>
                        </div>
                        <div class="above-wrapper">
                            <ul>
                                <li class="revert-btn">快捷回复</li>
                                <li class="other-query-btn">查看留言</li>
                                <li class="not-collection-btn">取消收藏</li>
                            </ul>
                        </div>
                    `;
            } else {
                html =
                    `
                    <div class="below-wrapper">
                            <div>
                                <span>${ riven_data[i].riven_name }</span>
                                <span id="my-riven-id">${ riven_data[i].id }</span>
                            </div>
                            <div>
                                <ul class="property">
                                    
                                </ul>
                            </div>
                            <div>
                                <span>${ riven_data[i].price }p</span>
                            </div>
                            <div class="not-sell-logo">已下架</div>
                        </div>
                        <div class="above-wrapper">
                            <ul>
                                <li class="not-collection-btn">取消收藏</li>
                            </ul>
                        </div>
                    `;
            }
            other_riven_box.html(html);
            $('.main-wrapper').append(other_riven_box);

            let property = other_riven_box.find('.property');
            $.each(riven_data[i].properties, function (k, v) {
                let li = $('<li>' + k + v + '</li>');
                li.appendTo(property);
            });
        }
    }
}

//监听快捷回复按钮事件
CollectionRiven.prototype.listenCopyRivenEvent = function(){
    $('.main-wrapper').on('click', '.revert-btn', function (){
        let copy_text = $('#text-copy-data'); // 放快捷回复数据的对象
        let riven_seller = $(this).parents('.other-riven-box').attr('seller-game-name'); //获取紫卡卖家名
        let riven_name = $(this).parent().parent().prev().children().eq(0).children().eq(0).text(); //获取紫卡名
        let riven_price = $(this).parent().parent().prev().children().eq(2).children().eq(0).text(); //获取紫卡价格

        copy_text.val(`/w ${riven_seller} 你好,我想买你的${riven_name}紫卡,${riven_price}(白金)`);
        copy_text.select(); //复制对象
        document.execCommand(`copy`); //复制内容
        msg.ok_message('(快捷回复)复制成功!');
    });
};

//监听取消收藏按钮事件
CollectionRiven.prototype.listenMainWrapperEvent = function () {
    //监听取消收藏按钮事件
    $('.main-wrapper').on('click', '.not-collection-btn', function () {
        if (confirm("确定要取消收藏吗？")) {
            let riven_id = $(this).parent().parent().prev().children().eq(0).children().eq(1).text();
            myajax.post({
                'url': '/rivenmarket/not_riven_collection/',
                'data': {
                    'riven_id': riven_id
                },
                'success': function (result) {
                    let code = result['code'];
                    if (code == 200) {
                        let message = result['message'];
                        msg.ok_message(message);
                        window.location.reload();
                    } else {
                        msg.error_message(message);
                    }
                },
                'error': function () {
                    console.error(`请求失败：${error.status}`);
                }
            })
        } else {
            console.error(`不取消收藏`);
        }
    });
}

//监听查看留言按钮事件
CollectionRiven.prototype.listenQueryMsgEvent = function () {
    let self = this;
    //捕获点击查看留言按钮
    $('.main-wrapper').on('click', '.other-query-btn', function () {
        let queryMsgBtn = $(this);
        let riven_id = $(this).parent().parent().prev().children().eq(0).children().eq(1).text();
        myajax.get({
            'url': '/msgs/query_parent_msg/',
            'data': {
                'riven_id': riven_id,
            },
            'success': function (result) {
                let msgs = result['data'];
                let code = result['code'];
                if (code === 200) {
                    parent_msg_list(msgs, riven_id);
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
        <div class="message-board" riven_id=''>
            <div class="query-msg-logo">
                <span>留言板</span>
            </div>
            <div class="query-msg-comment">
                <textarea name="" id="" cols="30" rows="3"></textarea>
                <button id="write-msg-btn">发送</button>
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
            let msg_wrapper = $('<div class="msg-wrapper"  parent-msg-id=></div>');
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