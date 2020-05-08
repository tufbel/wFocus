import msg from '../message.js';

$(function(){
     listenMenuClickEvent();
})

function listenMenuClickEvent(){
    $('.item>a').click(function (e) {
        e.preventDefault();
        console.log(document.cookie);
        let wfper = window.get_cookie(`wfper`);
        let judge = false;
        if (wfper) {
            wfper = wfper.split(`&`)[0];
            console.log(wfper);
            if (wfper) {
                wfper = wfper.split(`=`)[1];
                console.log(wfper);
                if (/true/i.test(wfper)) {
                    judge = wfper;
                }   
            }
        }
        if(judge){
            let href = $(this).attr('href');
            console.log(href);
            window.location.href = href;
        }else{
            msg.warning_message('请先登录');
        }
        
    })
}