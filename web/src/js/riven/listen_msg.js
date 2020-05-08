$(function () {
    new_msg();
})

function new_msg() {
    myajax.get({
        'url': '/rivenmygoods/new_msg/',
        'data': {},
        'success': function (result) {
            let data = result['data'];
            if (data.length > 0) {
                $('.title-new-msg').show(); //显示新消息提示
                my_riven_list(data);
            } else {
                $('.title-new-msg').hide();
            }
        },
        'fail': function () {

        }
    });
    setTimeout('new_msg()', 1000 * 60);
}

// 遍历我的紫卡对象
function my_riven_list(data) {
    $('.my-riven-box').each(function () {
        let my_riven_id = $(this).children().eq(0).children().eq(0).children().eq(1).text();
        for (let i = 0; i < data.length; i++) {
            if (my_riven_id == data[i].riven_id) {
                $(this).children().eq(0).children().eq(3).show(); //显示新消息提示
                $(this).children().eq(1).children().children().eq(1).children().show(); //显示新消息提示
            }
        }

    })
}