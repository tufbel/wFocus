"use strict";


class HeaderManage {

    constructor() {
        this.nav_judge = document.getElementById("nav-judge");
        this.search_judge = document.getElementById("search-judge");
        console.log("new");
    }

    run() {
        console.log("注册");
        this.manage();
    }

    manage() {
        console.log("进入注册");
        this.nav_judge.addEventListener("CheckboxStateChange", () => {
            console.log(this.nav_judge.checked);
        });
        this.search_judge.addEventListener("CheckboxStateChange", () => {
            console.log(this.nav_search.checked);
        });

    }
}