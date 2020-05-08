$(function () {

    let divs = document.querySelectorAll('div');
    console.log(...divs);
    let s = [...divs];
    let c = $(`<div>4</div>`);
    $(document.body).append(c);
    s.push(c[0])
    $(s).click(() => {
        console.log(1);
    });
})