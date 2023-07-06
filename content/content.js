'use strict';

const LS = localStorage;


chrome.storage.local.get(["key", "keyTwo"]).then((result) => {
    let status = JSON.stringify(result.keyTwo.status);
    for (let item in result.key) {
        if (cleanUp(window.location.href) === result.key[item] && status === 'true') {
            countdown();
            document.body.innerHTML = `
                    <div class="time">
                    <h1>Время работать!</h1> 
                    <span>Возвращаю к работе через: 
                    <span class="countdown">${timer}</span>!
                    </span>
                    </div>`;
            setTimeout(function () {
                window.open("http://google.com/", "_self");
            }, 5000);

        }
    }
});

let timer = 5;

function countdown() {
    const upTime = setInterval(function () {
        timer--;
        document.querySelector('.countdown').textContent = timer;
        if (timer === 0) { clearInterval(upTime) }
    }, 1000);
}

function cleanUp(url) {
    var url = url.trim(url);
    if (url.search(/^https?\:\/\//) != -1)
        url = url.match(/^https?\:\/\/([^\/?#]+)(?:[\/?#]|$)/i, "");
    else
        url = url.match(/^([^\/?#]+)(?:[\/?#]|$)/i, "");
    return url[1];
}
