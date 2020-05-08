/*
 * @Author: Lumoon 
 * @Date: 2019-11-09 14:00:09 
 * @Last Modified by: Lumoon
 * @Last Modified time: 2019-12-08 22:26:16
 * @description: wfajax测试。
 */


new_wfajax.get({
    url: `/test`,
    success: (response, code, xhr) => {
        console.log(response);
    }
});



function submit_test() {
    $('#submit').click(function (e) {
        e.preventDefault();

        // wfajax.post({
        //     url: '/',
        //     data: {
        //         email: "admin@163.com",
        //         password: "123456789",
        //         remember: true
        //     },
        //     success: (data) => {
        //         console.log(data);
        //     },
        //     fail: (error) => {
        //         console.log(error);
        //     }
        // });
    });
}