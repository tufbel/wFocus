import msg from '../message.js'


$(function(){
    listenMessageBoardEvent();
});

//监听留言板
function listenMessageBoardEvent(){
    //给我的紫卡评论
    $(`.other-box`).on('click', `#write-self-msg-btn`, function (e) {
        listenSelfCommentEvent($(this));
    });
    //给收藏的紫卡评论
    $(`.other-box`).on('click', `#write-msg-btn`, function (e) {
        listenCommentEvent($(this));
    });
    //查看前4条子留言
    $('.other-box').on('click', '.show-children-msg-box', function (e) {
        listenChildrenEvent($(this));
    });
    //查看更多子留言
    $('.other-box').on('click', '.add-children-msg', function (e) {
        listenMoreChildrenEvent($(this));
    });
    //监听显示或隐藏回复框事件
    $('.other-box').on('click', '.show-release-msg-box', function (e) {
        listenReleaseBoxEvent($(this));
    });
    //回复父留言(添加子留言)
    $('.other-box').on('click', '.release-parent-msg-btn', function (e) {
        listenReleaseBtnEvent($(this));
    });
}

//给我的紫卡发表父留言
function listenSelfCommentEvent(write_self_msg_btn){
    let riven_id = $('.message-board').attr('riven-id');
    let my_new_msg = write_self_msg_btn.prev().val(); //获取留言框内容
    let msg_area = write_self_msg_btn.parent().next().children(); //留言区域
    let re = /^[\s\S]{1,256}$/;
    let msg_result = re.test(my_new_msg);
    if (my_new_msg !== '') {
        if(msg_result){
            myajax.post({
                'url': '/msgs/write_self_parent_msg/',
                'data': {
                    'riven_id': riven_id,
                    'msg': my_new_msg,
                },
                'success': function (result) {
                    let code = result['code'];
                    let message = result['message'];
                    if (code === 200) {
                        msg.ok_message(message);
                        write_self_msg_btn.prev().val('');
                        msg_area.empty();
                        query_msgs(riven_id, msg_area); // 刷新留言板
                    }else{
                        msg.error_message(message);
                    }
                },
                'error': function (error) {
                    console.error(`请求失败：${error.status}`);
                }
            });
        }else{
            msg.error_message('留言长度不能超过256个字符');
        }
    }else{
        msg.error_message('留言不能为空');
    }
}

//给收藏的紫卡发表父留言
function listenCommentEvent(write_msg_btn) {
    let riven_id = $('.message-board').attr('riven-id');
    let my_new_msg = write_msg_btn.prev().val(); //获取留言框内容
    let msg_area = write_msg_btn.parent().next().children(); //留言区域
    let re = /^[\s\S]{1,256}$/;
    let msg_result = re.test(my_new_msg);
    if (my_new_msg !== '') {
        if(msg_result){
            myajax.post({
                'url': '/msgs/write_parent_msg/',
                'data': {
                    'riven_id': riven_id,
                    'msg': my_new_msg,
                },
                'success': function (result) {
                    let code = result['code'];
                    let message = result['message'];
                    if (code === 200) {
                        msg.ok_message(message);
                        write_msg_btn.prev().val('');
                        msg_area.empty();
                        query_msgs(riven_id, msg_area); // 刷新留言板
                    }else{
                        msg.error_message(message);
                    }
                },
                'error': function (error) {
                    console.error(`请求失败：${error.status}`);
                }
            })
        }else{
            msg.error_message('留言长度不能超过256个字符');
        }
    }else{
        msg.error_message('留言不能为空');
    }
}

//重新查看父留言并渲染(刷新留言板)
function query_msgs(riven_id, msg_area) {
    myajax.get({
        'url': '/msgs/query_parent_msg/',
        'data': {
            'riven_id': riven_id,
        },
        'success': function (result) {
            let msgs = result['data'];
            let code = result['code'];
            let message = result['message'];
            if (code === 200) {
                //把留言渲染到留言区域
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
                    $(msg_area).append(msg_wrapper);
                };
            }
        }
    });
}

//查看前4条子留言
function listenChildrenEvent(show_children_msg_box){
    let self = this;
    let children_msg_box = show_children_msg_box.parents('.msg-wrapper').find('.children-msg-box'); //子留言盒子
    let parent_element = show_children_msg_box.parent().parent().parent().parent(); //父留言对象
    let parent_msg_id = parent_element.attr('parent-msg-id'); //父留言id

    if (show_children_msg_box.attr('show-children') == 'false') {
        children_msg_box.empty();
        show_children_msg_box.parent().parent().parent().next().next().show();
        show_children_msg_box.attr('show-children', 'true');

        myajax.post({
            'url': '/msgs/query_children_msg/',
            'data':{
                'parent_msg_id':parent_msg_id
            },
            'success': function(result){
                let code = result['code'];
                let children_msgs = result['data'];
                let message = result['message'];
                if(code == 200){
                    parent_element.attr('msg-page','2');
                    add_children_msgs(children_msgs, children_msg_box) //渲染子留言
                }else{
                    msg.error_message(message);
                }
            },
            'error': function (error) {
                console.error(`请求失败：${error.status}`);
            }
        });
    } else {
        show_children_msg_box.parent().parent().parent().next().next().hide();
        show_children_msg_box.attr('show-children', 'false');
        children_msg_box.empty();
    }
}

//查看更多子留言
function listenMoreChildrenEvent(add_children_msg) {
    let parent_element = add_children_msg.parent().parent();//父留言对象
    let page = parent_element.attr('msg-page'); //页数
    let parent_msg_id = parent_element.attr('parent-msg-id'); //父留言id
    let children_msg_box = parent_element.find('.children-msg-box')//子留言盒子
    myajax.post({
        'url': '/msgs/query_new_children_msg/',
        'data': {
            'page': page,
            'parent_msg_id': parent_msg_id,
        },
        'success': function(result){
            let code = result['code'];
            let children_msgs = result['data'];
            let message = result['message'];
            if (code == 200) {
                page++;
                parent_element.attr('msg-page', page);
                add_children_msgs(children_msgs, children_msg_box) //渲染子留言
            } else {
                msg.error_message(message);
            }
        },
        'error': function(error){
            console.error(`请求失败：${error.status}`);
        }
    })
    
}

//渲染子留言
function add_children_msgs(children_msgs, children_msg_box){
    let page = children_msg_box.parent().attr('msg-page');
    if (page == 2) {
        let add_children_msg = $(`<span class="add-children-msg">更多回复</span>`);
        children_msg_box.append(add_children_msg);
    }
    for (let j = 0; j < children_msgs.length; j++) {
        let children_msg = $('<div class="children-msg"></div>');
        let html = ``;
        html =
            `
                    <div class="children-msg-data">
                        <span>${ children_msgs[j].writer.username }:</span>
                        <span>${ children_msgs[j].content }</span>
                    </div>
                    <div class="children-msg-other">
                        <span>${ time_since(children_msgs[j].comment_time) }</span>
                    </div>
                `;
        children_msg.html(html);
        $('.add-children-msg').before(children_msg);
    };
    if (children_msgs.length < 4) {
        children_msg_box.find('.add-children-msg').remove();
    }
}

//显示或隐藏回复框事件
function listenReleaseBoxEvent(show_release_msg_box){
    if (show_release_msg_box.attr('show-release') === 'false') {
        show_release_msg_box.parent().parent().next().show();
        show_release_msg_box.attr('show-release', 'true');       
    } else {
        show_release_msg_box.parent().parent().next().hide();
        show_release_msg_box.attr('show-release', 'false')
    }
}

//回复父留言(添加子留言)
function listenReleaseBtnEvent(release_parent_msg_btn){
    let msg_content = release_parent_msg_btn.prev().val(); //回复框内容
    let parent_msg_id = release_parent_msg_btn.parent().parent().attr('parent-msg-id'); //父留言id
    let show_children_msg_box = release_parent_msg_btn.parent().prev().find('.show-children-msg-box'); //查看前4条子留言按钮

    let re = /^[\s\S]{1,256}$/;
    let msg_result = re.test(msg_content);
    if (msg_content != '') {
        if(msg_result){
            myajax.post({
                'url': '/msgs/add_self_children_msg/',
                'data': {
                    'msg': msg_content,
                    'parent_msg_id': parent_msg_id,
                },
                'success': function (result) {
                    let code = result['code'];
                    let message = result['message'];
                    if (code == 200) {
                        msg.ok_message(message);
                        release_parent_msg_btn.prev().val(''); //清空回复框内容
                        listenChildrenEvent(show_children_msg_box) //重新查看前4条子留言                 

                    } else {
                        msg.error_message(message);
                    }
                },
                'error': function (error) {
                    console.error(`请求失败：${error.status}`);
                }
            });
        }else{
            msg.error_message('留言长度不能超过256个字符');
        }
    }else{
        msg.error_message('回复内容不能为空');
    }
}


//插入临时子留言
// function temporary_children_msg(msg_content, release_parent_msg_btn) {
//     let wfper = window.get_cookie(`wfper`);
//     let judge = false;
//     let game_name = '';
//     if (wfper) {
//         wfper = wfper.split(`&`)[2];
//         if (wfper) {
//             console.log(wfper);
//             wfper = wfper.split(`=`)[1];
//             if (wfper){
//                 judge = true;
//                 game_name = wfper.replace(/"/, '');
//             }
//         }
//     }

//     if(judge){
//         let children_msg = $('<div class="children-msg"></div>');
//         let html = ``;
//         html =
//             `
//             <div class="children-msg-data">
//                 <span>${ game_name }:</span>
//                 <span>${ msg_content }</span>
//             </div>
//             <div class="children-msg-other">
//                 <span>刚刚</span>
//             </div>
//             `;
//         children_msg.html(html);
//         let children_msg_box = release_parent_msg_btn.parent().next();
//         if (children_msg_box.children().length == 0) {
//             children_msg_box.append(children_msg);
//         }else{
//             children_msg_box.children().eq(0).before(children_msg);
//         }
//     }else{
//         msg.error_message('游戏ID需要审核通过才能留言')
//     }
// }

//时间过滤器
function time_since(dateValue){
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