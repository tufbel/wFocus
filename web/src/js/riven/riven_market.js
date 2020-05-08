import rivenlist from "../riven/riven_list.js";

$(function () {
    let rivenMarket = new RivenMarket();
    rivenMarket.run();
});

function RivenMarket() {
    this.modes = $('.mode'); //搜索方式对象
    this.riven_data = {};
    this.rivenwrapper = $('.riven-wrapper');
    this.search = ''; //搜索内容
    this.rivenmode = '时间'; //搜索方式
    this.page = 2; //紫卡加载起始页数
    this.loadBtn = $('.load-other');
}

RivenMarket.prototype.run = function () {
    let self = this;
    self.listenSearchContentEvent();
    self.listenAllNameListEvent();
    self.listenSearchBtnEvent();
    self.searchModeEvent();
    self.listenLoadOtherEvents();
};

//监听搜索框事件
RivenMarket.prototype.listenSearchContentEvent = function () {
    //监听搜索内容变化事件
    $("input[name = 'search']").on('input', function () {
        let query_content = new RegExp($(this).val()); //搜索框内容转正则
        let all_name = $('.all-name-list').children(); //获取所有li
        if ($(this).val() === '') {
            for (let i = 0; i < all_name.length; i++) {
                all_name.eq(i).css('display', 'none');
            }
        } else {
            for (let i = 0; i < all_name.length; i++) {
                all_name.eq(i).css('display', 'none');
                if (query_content.test(all_name.eq(i).text())) {
                    all_name.eq(i).css('display', 'block');
                }
            }
        }
    })
    //监听鼠标位于紫卡名区域事件
    $('.all-name-area').mouseover(function () {
        $(this).attr('search-event', 'true');
    })
    //监听鼠标移出紫卡名区域事件
    $('.all-name-area').mouseleave(function () {
        $(this).attr('search-event', 'false');
    })
    //监听搜索框失去焦点事件
    $("input[name = 'search']").on('blur', function (e) {
        $(this).css('box-shadow', '');
        if ($('.all-name-area').attr('search-event') === 'false') {
            $('.all-name-area').hide();
        }
    })
    //监听搜索框获取焦点事件
    $("input[name = 'search']").on('focus', function () {
        $(this).css('box-shadow', '0 0 10px #fb00ff');
        $('.all-name-area').show();
    })
};

//监听紫卡名列表事件
RivenMarket.prototype.listenAllNameListEvent = function () {
    $('.all-name-list').on('click', '.all-name-member', function () {
        self.search = $(this).text();
        console.log(self.search);
        $("input[name = 'search']").val(self.search);
        $('.all-name-area').hide();
    })
};

//监听搜索事件
RivenMarket.prototype.listenSearchBtnEvent = function () {
    let self = this;

    $('.search-btn').click(function () {
        self.page = 2;
        //empty:可以将对应标签下所有子元素删除
        self.rivenwrapper.empty();
        self.search = $("input[name = 'search']").val();
        myajax.get({
            'url': '/rivenmarket/search',
            'data': {
                'riven_name': self.search,
                'riven_mode': self.rivenmode
            },
            'success': function (result) {
                self.riven_data = result['data']['rivens'];
                let collection_data = result['data']['collections'];
                let my_riven_data = result['data']['my_rivens'];
                let code = result['code'];
                if (code === 200) {
                    rivenlist.run(self.riven_data, collection_data, my_riven_data);
                    if (self.riven_data.length < 6) {
                        self.loadBtn.hide();
                        if (self.riven_data.length === 0) {
                            let none_riven = $(`<div class="none-riven"></div>`);
                            let remind = $(`<span>没有相应的武器紫卡</span>`);
                            none_riven.html(remind);
                            self.rivenwrapper.append(none_riven);
                        }
                    } else {
                        self.loadBtn.show();
                    }
                }
            },
            'error': function (error) {
                console.error(`请求失败：${error.status}`);
            }
        })
    });

    // //给searchBtn对象绑定两个事件（点击事件，键盘按键按下）
    // searchBtn.on('click',function(){
    //     //empty:可以将对应标签下所有子元素删除
    //     // self.rivenwrapper.empty();
    //     console.log('撒旦可能被');
    //     self.search = $("input[name = 'search']").val();
    //     console.log('****');
    //     console.log(self.search);
    //     console.log('*****');
    //     if(self.search){
    //         window.location.href='/rivenmarket/search/'+self.search+'/';
    //     }else{
    //         window.location.href='/rivenmarket/';
    //     }
    // });
    // searchBtn.on('keydown',function(event){
    //     if(event.keyCode === 13){
    //         //empty:可以将对应标签下所有子元素删除
    //         self.rivenwrapper.empty();
    //         self.search = $("input[name = 'search']").val();
    //         window.location.href='/rivenmarket/search/'+self.search+'/';
    //         }
    // })

};

//监听紫卡搜索方式事件
RivenMarket.prototype.searchModeEvent = function () {
    let self = this;
    //捕获点击紫卡搜索方式事件
    self.modes.click(function () {
        self.page = 2;
        $(this).addClass('active').siblings().removeClass('active');
        //获取紫卡搜索方式
        self.rivenmode = $(this).text();
        //empty:可以将对应标签下所有子元素删除
        self.rivenwrapper.empty();
        self.search = $("input[name = 'search']").val();
        console.log(self.search);

        myajax.get({
            'url': '/rivenmarket/search/',
            'data': {
                'riven_name': self.search,
                'riven_mode': self.rivenmode,
            },
            'success': function (result) {
                self.riven_data = result['data']['rivens'];
                let collection_data = result['data']['collections'];
                let my_riven_data = result['data']['my_rivens'];
                let code = result['code'];
                if (code === 200) {
                    rivenlist.run(self.riven_data, collection_data, my_riven_data);
                    if (self.riven_data.length < 6) {
                        self.loadBtn.hide();
                        if (self.riven_data.length === 0) {
                            let none_riven = $(`<div class="none-riven"></div>`);
                            let remind = $(`<span>没有相应的武器紫卡</span>`);
                            none_riven.html(remind);
                            self.rivenwrapper.append(none_riven);
                        }
                    } else {
                        self.loadBtn.show();
                    }
                }
            },
            'error': function (error) {
                console.error(`请求失败：${error.status}`);
            }
        });

    });
};

//监听加载更多紫卡事件
RivenMarket.prototype.listenLoadOtherEvents = function () {
    let self = this;
    self.loadBtn.click(function () {
        let page = self.page;
        self.search = $("input[name = 'search']").val();

        myajax.get({
            'url': '/rivenmarket/newList/',
            'data': {
                'p': page,
                'riven_name': self.search,
                'riven_mode': self.rivenmode,
            },
            'success': function (result) {
                self.riven_data = result['data']['rivens'];
                let collection_data = result['data']['collections'];
                let my_riven_data = result['data']['my_rivens'];
                console.log(self.riven_data);
                console.log(collection_data);
                console.log(my_riven_data);
                let code = result['code'];
                if (code === 200) {
                    rivenlist.run(self.riven_data, collection_data, my_riven_data);
                }
                if (self.riven_data.length < 6) {
                    self.loadBtn.hide();
                }
                self.page++;
            },
            'error': function (error) {
                console.error(`请求失败：${error.status}`);
            }
        });
    });
};