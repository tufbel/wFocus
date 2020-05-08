/*
 * @Author: Lumoon 
 * @Date: 2019-11-21 21:07:38 
 * @Last Modified by: Lumoon
 * @Last Modified time: 2019-11-21 21:08:58
 * @description: 节点与Map测试
 */

let map = new WeakMap()

$(function () {
    let jqdivs = $(`div`);
    let jsdivs = document.getElementsByTagName(`div`);
    let jsdiv = document.getElementById(`1`);

    map.set(jsdiv, `你好`);
    show();
})

function show() {
    setTimeout(() => {
        let jqdivs = $(`div`);
        console.log(map.get(jqdivs[0]));
    }, 10);
}