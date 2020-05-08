(() => {


})();

function when_ajax() {
    wfajax.post({
        url: 'https://www.baidu.com',
        success: (data) => {
            console.log(`成功的回调`);
        },
        fail: (error) => {
            console.log(`您访问的服务器崩溃了！${error}`);
        }
    });
}