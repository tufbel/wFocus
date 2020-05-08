"use strict";


// let p1 = new Promise((reso, reject) => {
//     wfajax.get({
//         url: `https://www.cnblogs.com`,
//         success: (r) => {
//             reso(`成功1`);
//         },
//         error: (error) => {
//             reject(error);
//         }
//     });
// });

// let p2 = new Promise((reso, reject) => {
//     wfajax.get({
//         url: `https://www.cnblogs.com`,
//         success: (r) => {
//             reso(`成功2`);
//         },
//         error: (error) => {
//             reject(error);
//         }
//     });
// });

// Promise.all([p1, p2]).then(result => {
//     console.log(result);
// });

// (async function () {
//     let result = await new Promise((reso, reject) => {
//         wfajax.get({
//             url: `https://www.cnblogs.com`,
//             success: (response) => {
//                 reso(response);
//             },
//             error: (error) => {
//                 reject(error);
//             }
//         });
//     });
//     console.log(`第一个结束`);
//     try {
//         let r2 = await new Promise((reso, reject) => {
//             console.log(result);
//             wfajax.get({
//                 url: `https://www.cnblogs.com/12132132451`,
//                 success: (response) => {
//                     reso(response);
//                 },
//                 error: (error) => {
//                     reject(error.status);
//                 }
//             });
//         });
//         console.log(r2);
//     } catch (error) {
//         console.log(error.status);
//     }
// })()

// let p = wfpromise.get({
//     url: `https://www.cnblogs.com/1235645`
// });
// p.then(result => {
//     console.log(result);
// }, error => {
//     console.log(error);
// });


// let prom = new Promise((resolve, reject) => {
//     setTimeout(_ => {
//         for (const key in [...Array(5)]) {
//             console.log(key);
//         }
//         resolve(`完毕`);
//     }, 0);
// });

// prom.then(result => {
//     console.log(result);
//     p_yeid.next();
// });



// let p1 = new Promise((resolve, reject) => {
//     let el = $(`.wf-main`);
//     let t = setTimeout(_ => {
//         for (const key in [...Array(10)]) {
//             el.append($(`<div>第一个${key}</div>`))
//         }
//         el.append($(`<div>插入1成功</div>`));
//         resolve(1);
//     }, 1000);
//     console.log(t);
// });

// let p2 = new Promise((resolve, reject) => {
//     let el = $(`.wf-main`);
//     let t = setTimeout(_ => {
//         for (const key in [...Array(10)]) {
//             el.append($(`<div>插入${key}</div>`));
//         }
//         el.append($(`<div>插入2成功</div>`));
//         resolve(2);
//     }, 900);
//     console.log(t);
// });

// Promise.all([p1, p2]).then(result => {
//     let el = $(`.wf-main`);
//     el.append($(`<div>插入${result}</div>`));
// }, error => {
//     console.log(error);
// });

// class StClass {

//     constructor() {
//         this.x = Math.random();
//     }

//     static get_singletion() {
//         let self = this;
//         if (!self._singletion) {
//             self._singletion = new StClass();
//         }
//         return self._singletion;
//     }

//     get_number() {
//         return this.x;
//     }
// }

// let p = new Proxy({
//     name: undefined,
//     judge: false
// }, {
//     get: (obj, key) => obj[key],
//     set: (obj, key, value) => {
//         console.log(`执行代理`);
//         obj[key] = value
//         if (key == `name`) {
//             if (value) {
//                 p.judge = true;
//             } else {
//                 p.judge = false;
//             }
//         } else if (key == `judge`) {
//             console.log(p.judge);
//             console.log(p.judge == true);
//         }
//         return true
//     }
// });




// $(`[ostron] [alert-content-border]`).removeAttr(`alert-content-border`);

// let map = new Map();
// map.set(1, () => {
//     map.delete(2);
// });
// map.set(2, () => {
//     console.log(`执行2`);
// });
// map.set(3, () => {
//     console.log(`执行3`);
// })

// console.log(map);

// for (const [key, func] of map.entries()) {
//     if (key == 1) {
//         map.delete(key);
//     }
//     console.log(key);
//     console.log(func);
//     if (func) {
//         func();
//     }
//     console.log(map);
// }