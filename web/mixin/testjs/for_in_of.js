/*
 * @Author: Lumoon 
 * @Date: 2019-11-21 21:22:35 
 * @Last Modified by: Lumoon
 * @Last Modified time: 2019-11-22 21:02:13
 * @description: 对象遍历测试
 */

let num = 2;
console.log(--num);
console.log(num);

let mod = {
    name: `持久力`,
    attr: `强化`
}


mod = Object.entries(mod).map(([key, value]) => {
    console.log(`${key}:${value}`);
    return `${key}:${value}`;
}).join("");
console.log(mod);