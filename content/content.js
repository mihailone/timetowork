'use strict';

const LS = localStorage;


chrome.storage.local.get(["key", "keyTwo"]).then((result) => {
    let status = JSON.stringify(result.keyTwo.status);
    for (let item in result.key) {
        if (searchWWW(cleanUp(window.location.href)) === result.key[item] && status === 'true') {
            countdown();
            document.body.innerHTML = `
                    <div class="extension-style-timer-container">
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

function searchWWW(url) {
    if (url.split('.')[0] === 'www') {
        return `${url.split('.')[1]}.${url.split('.')[2]}`;
    } else {
        return url;
    }
}

function cleanUp(url) {
    var url = url.trim();
    console.log(url);
    if (url.search(/^https?\:\/\//) != -1)
        url = url.match(/^https?\:\/\/([^\/?#]+)(?:[\/?#]|$)/i, "");
    else
        url = url.match(/^([^\/?#]+)(?:[\/?#]|$)/i, "");
    return url[1];
}

console.log(searchWWW(cleanUp(window.location.href)));