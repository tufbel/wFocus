function RivenList() {
    this.riven_data = {};
    this.collection_data = {};
}

RivenList.prototype.run = function (riven_value, collection_value, my_riven_value) {
    let self = this;
    self.riven_data = riven_value;
    self.collection_data = collection_value;
    self.my_riven_data = my_riven_value;
    self.riven_list();
};

//将所有紫卡信息渲染到我的紫卡界面
RivenList.prototype.riven_list = function () {
    let self = this;
    //遍历所有紫卡
    for (let i = 0; i < self.riven_data.length; i++) {
        let j = 0;
        //遍历我的紫卡
        for (j; j < self.my_riven_data.length; j++) {
            //该用户发布的紫卡
            if (self.riven_data[i].id === self.my_riven_data[j].id) {
                _my_riven(self.riven_data[i]); //渲染我的紫卡
                break;
            }
        }
        //该紫卡不是由该用户发布,遍历我的收藏
        if (j === self.my_riven_data.length) {
            let k = 0;
            //遍历我的收藏
            for (k; k < self.collection_data.length; k++) {
                //该用户收藏的紫卡
                if (self.riven_data[i].id === self.collection_data[k].riven) {
                    _collection_riven(self.riven_data[i]);
                    break;
                }
            }
            //即不是由该用户发布也不被该用户收藏的紫卡
            if (k === self.collection_data.length) {
                _not_collection_riven(self.riven_data[i]);
            }
        }

    }
};

//将该用户发布的紫卡渲染到紫卡市场界面
function _my_riven(riven) {
    let riven_box = $(`<section class="riven-box"></section>`);
    riven_box.attr('seller-game-name',riven.seller.game_name);
    let html = ``;
    html =
        `   
      <div>
        <div>
          <div>
            <span class="riven-name">${ riven.riven_name }</span>
            <span id="riven-id">${ riven.id }</span>
          </div>
          <div>
            
          </div>
        </div>
        <div>
          <div class="property">
            
          </div>
          <div>
            <span>${ riven.price }p</span>
          </div>
        </div>
        <div>
          <span class="changeFont leaveMessage" leaveMessage-judge="false">
            <i class="fa fa-envelope-o"></i>
            <span>留言</span>
          </span>
          <span>${ time_since(riven.pub_time)}</span>
          <span>
            <i class="fa fa-circle"></i> ${ riven.seller.username }
          </span>
        </div>
        </div>
        <div class="riven-box-leaveMessage">
            <div>
            </div>
            <div class="message-area">
            </div>
            <div>
              <input type="text">
              <button class="update-self-msg-btn">发布</button>
            </div>
        </div>
        <div class="my-logo"></div>
      `;
    riven_box.html(html);
    riven_box.css('overflow', 'hidden');
    $('.riven-wrapper').append(riven_box);

    let property = riven_box.find('.property');
    $.each(riven.properties, function (k, v) {
        let span = $('<span>' + k + v + '</span>');
        // let li = $('<li>' + k + v + '</li>');
        span.appendTo(property);
    });
}

//将该用户收藏的紫卡渲染到紫卡市场界面
function _collection_riven(riven) {
    let riven_box = $(`<section class="riven-box"></section>`);
    riven_box.attr('seller-game-name',riven.seller.game_name);
    let html = ``;
    html =
        `   
      <div>
        <div>
          <div>
            <span class="riven-name">${ riven.riven_name }</span>
            <span id="riven-id">${ riven.id }</span>
          </div>
          <div>
            <ul>
              <li class="changeFont addWareRiven" addwareriven-judge="true">
                <i class="fa fa-heart collection"></i>
                <span>取消收藏</span>
              </li>
              <li class="changeFont fastReply">
                <i class="fa fa-clone"></i>
                <span>快捷回复</span>
              </li>
            </ul>
          </div>
        </div>
        <div>
          <div class="property">
            
          </div>
          <div>
            <span class="riven-price">${ riven.price }p</span>
          </div>
        </div>
        <div>
          <span class="changeFont leaveMessage" leaveMessage-judge="false">
            <i class="fa fa-envelope-o"></i>
            <span>留言</span>
          </span>
          <span>${ time_since(riven.pub_time)}</span>
          <span>
              <i class="fa fa-circle"></i>
              <span class="riven-seller">${ riven.seller.username }</span>
          </span>
        </div>
        </div>
        <div class="riven-box-leaveMessage">
            <div>
            </div>
            <div class="message-area">
            </div>
            <div>
              <input type="text">
              <button class="update-msg-btn">发布</button>
            </div>
        </div>
      `;
    riven_box.html(html);
    $('.riven-wrapper').append(riven_box);

    let property = riven_box.find('.property');
    $.each(riven.properties, function (k, v) {
        let span = $('<span>' + k + v + '</span>');
        // let li = $('<li>' + k + v + '</li>');
        span.appendTo(property);
    });
}

//即不是由该用户发布也不被该用户收藏的紫卡渲染到紫卡界面
function _not_collection_riven(riven) {
    let riven_box = $(`<section class="riven-box"></section>`);
    riven_box.attr('seller-game-name',riven.seller.game_name);
    let html = ``;
    html =
        `   
        <div>
            <div>
            <div>
                <span class="riven-name">${ riven.riven_name }</span>
                <span class="riven-id">${ riven.id }</span>
            </div>
            <div>
                <ul>
                <li class="changeFont addWareRiven" addwareriven-judge="false">
                    <i class="fa fa-heart notcollection"></i>
                    <span>收藏</span>
                </li>
                <li class="changeFont fastReply">
                    <i class="fa fa-clone"></i>
                    <span>快捷回复</span>
                </li>
                </ul>
            </div>
            </div>
            <div>
            <div class="property">
                
            </div>
            <div>
                <span class="riven-price">${ riven.price }p</span>
            </div>
            </div>
            <div>
            <span class="changeFont leaveMessage" leaveMessage-judge="false">
                <i class="fa fa-envelope-o"></i>
                <span>留言</span>
            </span>
            <span>${ time_since(riven.pub_time) }</span>
            <span>
                <i class="fa fa-circle"></i>
                <span class="riven-seller">${ riven.seller.username }</span>
            </span>
            </div>
            </div>
            <div class="riven-box-leaveMessage">
                <div>
                </div>
                <div class="message-area">
                </div>
                <div>
                <input type="text">
                <button class="update-msg-btn">发布</button>
                </div>
            </div>
        `;
    riven_box.html(html);
    $('.riven-wrapper').append(riven_box);

    let property = riven_box.find('.property');
    $.each(riven.properties, function (k, v) {
        let span = $('<span>' + k + v + '</span>');
        span.appendTo(property);
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
};

let rivenlist = new RivenList();
export default rivenlist;