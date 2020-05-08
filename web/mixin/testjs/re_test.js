let str1 = `+5.1%`
let str2 = `+6.5`
let re = /%/

let n = str1.match(/[0-9.]+/)[0];
let n_new = (Number(n) * 5).toString();
let m = str2.match(/[0-9.]+/)[0];
let m_new = Number(m) * 2;

console.log(str1.replace(n, n_new));

let re = /[0-9.]+/