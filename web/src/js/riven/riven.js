import msg from '../message.js';


$(function () {
    listenRivenWrapperEvent();
});

function listenRivenWrapperEvent() {
    //监听收藏图标事件
    $(`.riven-wrapper`).on('click', `.addWareRiven`, function (e) {
        listenWareEvent($(this));
    });
    //监听快捷回复图标事件
    $('.riven-wrapper').on('click', '.fastReply', function (e) {
        listenRevertEvent($(this));
    });
    //监听留言图标事件
    $(`.riven-wrapper`).on('click', `.leaveMessage`, function (e) {
        listenMessageEvent($(this));
    });
    //监听在他人紫卡发布留言按钮事件
    $(`.riven-wrapper`).on('click', `.update-msg-btn`, function (e) {
        listenUpdateMsgBtnEvent($(this));
    });
    //监听在我的紫卡发布留言按钮事件
    $(`.riven-wrapper`).on('click', `.update-self-msg-btn`, function (e) {
        listenUpdateSelfMsgBtnEvent($(this));
    });
}

//监听收藏图标事件
function listenWareEvent(Ware) {
    let wfper = window.get_cookie(`wfper`);
    if (wfper) {
        wfper = wfper.split(`&`).map((item) => {
            return /true/i.test(item.split(`=`)[1]) ? true : false;
        });
        if (wfper[0]) {
            //获取紫卡id
            //prev():获取上一个兄弟元素
            //children():获取该元素下的直接子集元素
            //eq():eq()中的参数是从0开始的
            let id = Ware.parent().parent().prev().children('span').eq(1).text();
            if (/false/i.test(Ware.attr("addwareriven-judge"))) {
               
                myajax.post({
                    'url': '/rivenmarket/riven_collection/',
                    'data': {
                        'riven_id': id
                    },
                    'success': function (result) {
                        let code = result['code'];
                        let message = result['message'];
                        console.log(message);
                        if (code == 200) {
                            msg.ok_message(message);
                            Ware.attr("addwareriven-judge", "true");
                            Ware.children('i').removeClass('notcollection');
                            Ware.children('i').addClass('collection');
                            Ware.children("span").text("取消收藏");
                        } else {
                            msg.error_message(message);
                        }
                    },
                    'error': function (error) {
                        console.error(`请求失败：${error.status}`);
                    }
                })
            } else {
                // Ware.css('opacity', '0');
                myajax.post({
                    'url': '/rivenmarket/not_riven_collection/',
                    'data': {
                        'riven_id': id
                    },
                    'success': function (result) {
                        let code = result['code'];
                        let message = result['message'];
                        console.log(message);
                        if (code == 200) {
                            msg.ok_message(message);
                            Ware.attr("addwareriven-judge", "false");
                            Ware.children('i').removeClass('collection');
                            Ware.children('i').addClass('notcollection');
                            Ware.children("span").text("收藏");
                        } else {
                            msg.error_message(message);
                        }
                    },
                    'error': function (error) {
                        console.error(`请求失败：${error.status}`);
                    }
                })
            }
        } else {
            msg.warning_message('登录后才能收藏。');
        }
    }
};

//监听快捷回复图标事件
function listenRevertEvent(revert) {
    let copy_text = $('#text-copy-data'); // 放快捷回复数据的对象
    let riven_seller = revert.parents('.riven-box').attr('seller-game-name');
    let riven_name = revert.parent().parent().prev().children().eq(0).text();
    let riven_price = revert.parent().parent().parent().parent().find('.riven-price').text();
    copy_text.val(`/w ${riven_seller} 你好,我想买你的${riven_name}紫卡,${riven_price}(白金)`);
    copy_text.select(); //复制对象
    document.execCommand(`copy`); //复制内容
    msg.ok_message('(快捷回复)复制成功!');
}

//监听留言图标事件
function listenMessageEvent(msg_icon) {
    let riven_id = msg_icon.parent().prev().prev().children().eq(0).children().eq(1).text(); //获取相应紫卡id
    let msg_area = msg_icon.parent().parent().next().children().eq(1); //获取留言区域的节点
    if (msg_icon.attr("leaveMessage-judge") === 'false') {
        msg_icon.attr("leaveMessage-judge", "true");
        msg_icon.parent().parent().next().css("height", "140px");
        msg_icon.children('i').removeClass("fa fa-envelope-o");
        msg_icon.children('i').addClass("fa fa-envelope-open-o");

        queryMsg(riven_id, msg_area); //查找相应紫卡的留言信息及渲染到界面
    } else {
        msg_icon.attr("leaveMessage-judge", "false");
        msg_icon.parent().parent().next().css("height", "0px");
        msg_icon.children('i').removeClass("fa fa-envelope-open-o");
        msg_icon.children('i').addClass("fa fa-envelope-o");

        msg_area.empty() //清空msg_area所有内容
    }
};

//监听在他人紫卡发布留言按钮事件
function listenUpdateMsgBtnEvent(update_msg_btn) {
    let update_msg = update_msg_btn.prev().val(); //获取留言框的内容
    let riven_id = update_msg_btn.parent().parent().prev().children().eq(0).children().eq(0).children().eq(1).text(); //相应紫卡id
    let msg_area = update_msg_btn.parent().prev(); //留言区域
    let re = /^[\s\S]{1,256}$/;
    let msg_result = re.test(update_msg);

    let wfper = window.get_cookie(`wfper`);
    let judge = false;
    if (wfper) {
        wfper = wfper.split(`&`).map((item) => {
            return /true/i.test(item.split(`=`)[1]) ? true : false;
        });
        judge = wfper[1];
    }

    if (judge) {
        if (update_msg !== '') {
            if(msg_result){
                myajax.post({
                    'url': '/msgs/write_parent_msg/',
                    'data': {
                        'msg': update_msg,
                        'riven_id': riven_id,
                    },
                    'success': function (result) {
                        let code = result['code'];
                        let message = result['message'];
                        if (code === 200) {
                            msg.ok_message(message);
                            update_msg_btn.prev().val('');
                            msg_area.empty();
                            queryMsg(riven_id, msg_area);
                        } else {
                            msg.error_message(message);
                        }
                    },
                    'error': function (error) {
                        console.error(`请求失败：${error.status}`);
                    }
                });
            }else{
                msg.error_message('留言内容不能超过256个字符');
            }
        }else{
            msg.error_message('留言内容不能为空');
        }
    } else {
        msg.error_message('登录并审核游戏ID后才能留言');
    }
};

//监听在我的紫卡发布留言按钮事件
function listenUpdateSelfMsgBtnEvent(update_self_msg_btn) {
    let update_self_msg = update_self_msg_btn.prev().val(); //获取留言框的内容
    let riven_id = update_self_msg_btn.parent().parent().prev().children().eq(0).children().eq(0).children().eq(1).text(); //相应紫卡id
    let msg_area = update_self_msg_btn.parent().prev(); //留言区域
    let re = /^[\s\S]{1,256}$/;
    let msg_result = re.test(update_self_msg);

    let wfper = window.get_cookie(`wfper`);
    let judge = false;
    if (wfper) {
        wfper = wfper.split(`&`).map((item) => {
            return /true/i.test(item.split(`=`)[1]) ? true : false;
        });
        judge = wfper[1];
    }

    if (judge) {
        if (update_self_msg !== '') {
            if(msg_result){
                myajax.post({
                    'url': '/msgs/write_self_parent_msg/',
                    'data': {
                        'msg': update_self_msg,
                        'riven_id': riven_id,
                    },
                    'success': function (result) {
                        let code = result['code'];
                        let message = result['message'];
                        if (code === 200) {
                            msg.ok_message(message);
                            update_self_msg_btn.prev().val('');
                            msg_area.empty();
                            queryMsg(riven_id, msg_area);
                        } else {
                            msg.error_message(message);
                        }
                    },
                    'error': function (error) {
                        console.error(`请求失败：${error.status}`);
                    }
                });
            }else{
                 msg.error_message('留言内容长度不能超过256个字符');
            }
        }else{
            msg.error_message('留言内容不能为空');
        }
    } else {
        msg.error_message('登录并审核游戏ID后才能留言');
    }
};

//将相应紫卡的留言信息及回复信息渲染到紫卡市场界面
function queryMsg(riven_id, msg_area) {
    myajax.get({
        'url': '/rivenmarket/query_msg/',
        'data': {
            'riven_id': riven_id,
        },
        'success': function (result) {
            let msgs = result['data'];
            console.log(msgs);
            if (msgs.length === 0) {
                let msg_box_content = $('<span class="no-msg-content">该紫卡还没人留下足迹</span>');
                msg_box_content.appendTo(msg_area);
            } else {
                for (let i = 0; i < msgs.length; i++) {
                    let msg_box = $('<section></section>');
                    let msg_box_content = $(`
                        <div>
                            <span>${msgs[i].writer.username}:</span>
                            <span>${msgs[i].content}</span>
                        </div>
                    `);
                    msg_box.append(msg_box_content);
                    for (const chilren of msgs[i].children) {
                        let children_content = $(`
                            <section>
                                <span>${chilren.writer.username}:</span>
                                <span>${chilren.content}</span>
                            </section>
                        `);
                        msg_box.append(children_content);
                    }
                    msg_area.append(msg_box);
                }
            }
        },
        'error': function (error) {
            console.error(`请求失败：${error.status}`);
        }
    });
};