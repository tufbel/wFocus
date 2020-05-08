/*
 * @Author: Lumoon 
 * @Date: 2019-11-11 12:24:18 
 * @Last Modified by: Lumoon
 * @Last Modified time: 2019-11-11 20:36:00
 * @description: 私有变量测试
 */

"use strict";

let He;

(function () {

    let _self;
    let _game;

    He = class Hero {

        constructor(name, kill) {
            _self = this;
            _game = 'warframe';
            this.name = name;
            _setkill.call(this, kill);
        }

        getgame() {
            return _game;
        }

        changekill(kill) {
            _setkill.call(this, kill);
        }
        setgame(name) {
            _game = name;
        }
    }

    function _setkill(kill) {
        let self = this;
        _self.kill = kill;
    }

})();
console.log(He);
console.log(typeof He);



let mesa = new He("Mesa", "和平使者");
let rhino = new He("Rhino", "震地冲击");
console.log(mesa);
console.log(rhino);
mesa.changekill("铁甲")
console.log(mesa);
console.log(rhino);