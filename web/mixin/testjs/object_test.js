"use strict";

let yasuo = {
    name: 'yasuo',
    game: 'lol'
}
console.log(yasuo);
console.log(yasuo.constructor);

for (const value in yasuo) {
    console.log(value);
}