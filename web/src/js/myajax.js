

//从cookie中获取csrftoken
window.getCookie = function(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        let cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            let cookie = cookies[i].trim().split(`=`);
            if (cookie[0] === name)
                cookieValue = cookie[1];
        }
    }
    return cookieValue;
}

var myajax = {
    'get': function(args){
        args['method'] = 'get';
        this.ajax(args);
    },
    'post': function(args){
        args['method'] = 'post';
        this._ajaxSetup();
        this.ajax(args);
    },
    'ajax': function(args){
        $.ajax(args);
    },
    '_ajaxSetup': function(){
        $.ajaxSetup({
            beforeSend: function(xhr,settings){
                if(!/^(GET|HEAD|OPTIONS|TRACE)$/.test(settings.type) && !this.crossDomain){
                    xhr.setRequestHeader("X-CSRFToken", window.getCookie('csrftoken'));
                }
            }
        });
    }
};
