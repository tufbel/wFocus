/*
 * @Author: Lumoon 
 * @Date: 2019-11-11 20:35:43 
 * @Last Modified by: Lumoon
 * @Last Modified time: 2019-11-12 10:29:39
 * @description: map存储测试
 */

"use strict";

class Hero {

    static game = 'LOL';

    constructor(name) {
        this.name = name;
    }

    set(game) {
        Hero.game = game;
    }
}

let yasuo = new Hero('亚索');
console.log(yasuo);

yasuo.set('DNF');

console.log(Hero.game);
// $(function () {
//     let one = $(`div`);
//     let map = new Map()
//     let date = {
//         name: `div`,
//         height: 290
//     }
//     let od = one[0];
//     let ow = one[1];

//     map.set(od, date);
//     map.set(ow, '孙海超');

//     let ot = $(`div`)[0];

//     console.log(map);
//     console.log(map.get(ot));
//     console.log(map.get($(`div`)[1]));
// });

// function one() {
//     let divs = $(`div`);
//     divs[0].aaname = 1;

// }

// function two() {
//     $(`div`).each(function (index) {
//         console.log(this.aaname);
//     });
// }