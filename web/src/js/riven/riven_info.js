import msg from '../message.js';
import rivenlist from "../riven/riven_list.js";


$(function () {
    let riven_info = new RivenInfo();
    riven_info.run();
});

function RivenInfo() {

}

RivenInfo.prototype.run = function () {
    let self = this;
    self.get_riven_info();
};

//初始化获取紫卡信息
RivenInfo.prototype.get_riven_info = function () {
    let self = this;
    myajax.post({
        'url': '/rivenmarket/',
        'data': {

        },
        'success': function (result) {
            let code = result['code'];
            let data = result['data'];
            let message = result['message'];
            console.log(data);
            if (code == 200) {
                let all_name = data['all_name'];
                let riven_data = data['rivens'];
                let collection_data = data['collections'];
                let my_riven_data = data['my_rivens'];

                search_content_list(all_name);
                rivenlist.run(riven_data, collection_data, my_riven_data);
            } else {
                msg.error_message(message);
            }
        },
        'error': function (error) {
            console.error(`请求失败：${error.status}`);
        }
    });
};


//渲染搜索框内容
function search_content_list(all_name) {
    console.log(`搜索框加内容`);
    console.log(all_name);
    for (let i = 0; i < all_name.length; i++) {
        let riven_name = $('<li class="all-name-member">' + all_name[i] + '</li>');
        riven_name.appendTo($('.all-name-list'))
    }
};