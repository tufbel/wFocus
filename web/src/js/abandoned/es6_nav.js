"use strict";


class WfNav {

    constructor() {
        // 构造方法
        this.nav_now = document.getElementsByClassName("nav-li-now");
        this.nav_lis = document.getElementsByClassName("nav-li");
    }

    run() {
        this.nav_hover();
    }

    nav_hover() {
        let span = findTag(this.nav_now, "span");
        if (span) {
            let lis = [...this.nav_lis];
            let n = lis.findIndex(item => item == this.nav_now.item(0));
            if (n >= 0) {
                lis.forEach((item, index) => {
                    item.addEventListener("mouseenter", () => {
                        span.style.left = `${index - n}00%`;
                    });
                    item.addEventListener("mouseleave", () => {
                        span.style.left = `0`;
                    });
                });
            }
        }

    }
}

function findTag(elements, tag_name = "", index = 0) {

    let childrens;

    if (elements instanceof HTMLElement) {
        childrens = elements;

    } else if (elements instanceof HTMLCollection) {
        childrens = elements.item(index).children;
    }

    for (const item of childrens) {
        if (item.tagName == tag_name.toUpperCase()) {
            return item;
        } else {
            continue;
        }
    }
}