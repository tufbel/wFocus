"use strict";

window.onload = function () {
    let nav = new WfNav();
    nav.run();
}


function WfNav() {
    this.nav_now = document.getElementsByClassName("nav-li-now");
    this.nav_lis = document.getElementsByClassName("nav-li");

}

WfNav.prototype.run = function () {
    this.nav_hover();
}

WfNav.prototype.nav_hover = function () {
    let self = this;
    let span = self.findTag(self.nav_now, "span")[0];
    let lis = [...self.nav_lis];

    let n = lis.findIndex((item) => item == [...self.nav_now][0]);
    lis.forEach((item, index) => {
        item.addEventListener("mouseenter", () => {
            span.style.left = `${index - n}00%`;
        })
        item.addEventListener("mouseleave", () => {
            span.style.left = `0`;
        })

    });
}

WfNav.prototype.findTag = function (dom, tagName) {
    let self = this;
    let childrens = [...dom][0].children;
    self.tagName = tagName;
    return [...childrens].filter((item) => item.tagName == self.tagName.toUpperCase());
}