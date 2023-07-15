'use strict';

console.log('starting');

const html = `
            <div class="extension-container">
                    <p class="extension-big-text">Доступ к сайту временно приостановлен!</p>
                    <p class="extension-medium-text">Вернись к работе или перейди на <a href="https://www.google.com" target="_self">google.com</a></p>
                    <div class="extension-image">
                        <svg xmlns="http://www.w3.org/2000/svg" height="500" viewBox="0 -960 960 960" width="500"><path d="M355-120q-12 0-23.5-5T312-138L138-312q-8-8-13-19.5t-5-23.5v-250q0-12 5-23.5t13-19.5l174-174q8-8 19.5-13t23.5-5h250q12 0 23.5 5t19.5 13l174 174q8 8 13 19.5t5 23.5v250q0 12-5 23.5T822-312L648-138q-8 8-19.5 13t-23.5 5H355Zm0-60h250l175-175v-250L605-780H355L180-605v250l175 175Zm125-258 102 102q9 9 21 9t21-9q9-9 9-21t-9-21L522-480l102-102q9-9 9-21t-9-21q-9-9-21-9t-21 9L480-522 378-624q-9-9-21-9t-21 9q-9 9-9 21t9 21l102 102-102 102q-9 9-9 21t9 21q9 9 21 9t21-9l102-102Zm0-42Z"/></svg>
                    </div>
            </div>
`;


chrome.storage.local.get(["key", "keyTwo"]).then((result) => {
    let status = JSON.stringify(result.keyTwo);
    for (let item in result.key) {
        if (searchWWW(cleanUp(window.location.href)) === result.key[item] && status === 'true') {
            console.log('yes');
            document.body.innerHTML = html;
            document.body.classList.add('no_scroll')
        }
    }
});
// seng current url to content.js
const a = searchWWW(cleanUp(window.location.href))

chrome.runtime.onMessage.addListener(
    (request, sender, sendResponse) => {
        if (request["type"] == 'msg_from_popup') {
            sendResponse(a);
        }
        return true;
    }
);


function searchWWW(url) {
    if (url.split('.')[0] === 'www') {
        return `${url.split('.')[1]}.${url.split('.')[2]}`;
    } else {
        return url;
    }
}

function cleanUp(url) {
    var url = url.trim();
    if (url.search(/^https?\:\/\//) != -1)
        url = url.match(/^https?\:\/\/([^\/?#]+)(?:[\/?#]|$)/i, "");
    else
        url = url.match(/^([^\/?#]+)(?:[\/?#]|$)/i, "");
    return url[1];
}
console.log('end');