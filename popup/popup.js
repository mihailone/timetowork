'use strict';

const LS = localStorage;
const input = document.querySelector('#site-link');
const output = document.querySelector('.output-site-link');
const onOfList = document.querySelector('#list-on');
const errorTextBlock = document.querySelector('.error-text-block');
const blockSiteList = {};
const popupOpen = document.querySelector('.settings-popup');
const enableBlocking = {
    status: false,
}
const appStatus = {
    removeNotification: false,
    linkInInput: false,
}
let siteID = 0;


document.addEventListener('DOMContentLoaded', (e) => {
    checkLS();
    if (LS.getItem('chekedOpen') && LS.getItem('chekedOpen') === 'true') {
        onOfList.checked = true;
        enableBlocking.status = true;
        output.removeAttribute('hidden', 'true');
        chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
            chrome.tabs.sendMessage(tabs[0].id, { type: "msg_from_popup" }, function (response) {
                let testTrue = checkItemForDB(blockSiteList, response)
                if (response == undefined || response == 'undefined' && testTrue) {
                } else {
                    input.value = response;
                }
            });
        });
    } else {
        enableBlocking.status = false;
    }
    if (LS.getItem('removeNotification') && LS.getItem('removeNotification') === 'true') {
        appStatus.removeNotification = true;
        document.querySelector('#instruction').checked = true;
        document.querySelector('.title').setAttribute('hidden', true);
    } else {
        document.querySelector('.title').removeAttribute('hidden', true);
        appStatus.removeNotification = false;
        document.querySelector('#instruction').checked = false;
    }
})

function checkItemForDB(db, item) {
    for (let key in db) {
        if (db[key] == item) {
            return true;
        }
    }
}

function checkLS() {
    if (LS.getItem('blockSiteList') && LS.getItem('chekedOpen') === 'true') {
        const result = JSON.parse(LS.getItem('blockSiteList'));
        for (let key in result) {
            blockSiteList[key] = result[key];
            printBlockSiteList(result[key], key)
            siteID = Object.keys(result).length;
        }
    }
}
window.addEventListener('keydown', (e) => {
    let linkText = input.value.trim().toLowerCase()
    if ((e.code === 'Enter' || e.code === 'NumpadEnter') && searchWWW(cleanUp(linkText))) {
        const test = checkItemForDB(blockSiteList, searchWWW(cleanUp(linkText)))
        if (test) {
            errorTextBlock.textContent = 'Такая ссылка уже есть!';
            input.value = '';
            setTimeout(function () {
                errorTextBlock.textContent = '';
            }, 10000)
        } else {
            if (enableBlocking.status === true) {
                printBlockSiteList(cleanUp(linkText), siteID);
                blockSiteList[siteID] = searchWWW(cleanUp(linkText))
                siteID++;
                input.value = '';
                saveLS();
                send();
            } else {
                errorTextBlock.textContent = 'Для начала включите блокировку!';
                input.value = '';
                setTimeout(function () {
                    errorTextBlock.textContent = '';
                }, 10000)
            }
        }
    }
})
function saveLS() {
    LS.setItem('blockSiteList', JSON.stringify(blockSiteList));
}
function printBlockSiteList(text, id) {
    // получает favicons, но замедляет сильно первый запуск popup
    let link = `http://www.google.com/s2/favicons?domain=${cleanUp(text)}&sz=128`;
    // fav - logo.svg
    output.innerHTML += `
        <div class="link-container" id="link-${id}" title="${text}" data-link-id="${id}">
            <span class="f-icon">
                <img type="image/png" style="width: 16px;height: 16px; display: block;-webkit-user-select: none;transition: background-color 300ms;" src="${link}">
            </span>
            <span class="link-text">${cleanUp(text)}</span>
            <span class="remove-link">×</span>
        </div>
    `;
}

output.addEventListener('click', (e) => {
    const linkId = e.target.parentNode.dataset.linkId;
    if (e.target.closest('.remove-link')) {
        delete blockSiteList[linkId];
        saveLS();
        e.target.parentNode.remove(e.target.parentNode.classList.contains('link-container'));
        send();
    }
})

onOfList.addEventListener('input', (e) => {
    if (onOfList.checked === true) {
        output.removeAttribute('hidden', 'true');
        LS.setItem('chekedOpen', true);
        enableBlocking.status = true;
        checkLS();
    } else {
        output.setAttribute('hidden', 'true');
        LS.setItem('chekedOpen', false);
        enableBlocking.status = false;
        output.innerHTML = '';
    }
    send();
})

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


function send() {
    chrome.storage.local.set({
        key: blockSiteList,
        keyTwo: enableBlocking,
    }).then(() => {

    });
}

popupOpen.addEventListener('click', (e) => {
    document.querySelector('.settings-popup-container').removeAttribute('hidden', true);

})
document.querySelector('.popup-content').addEventListener('click', (e) => {
    if (e.target.closest('#instruction') && e.target.closest('#instruction').checked === true) {
        document.querySelector('.title').setAttribute('hidden', true);
        appStatus.removeNotification = true;
        LS.setItem('removeNotification', true);
    }
    if (e.target.closest('#instruction') && e.target.closest('#instruction').checked === false) {
        document.querySelector('.title').removeAttribute('hidden', true);
        appStatus.removeNotification = false;
        LS.setItem('removeNotification', false);
    }
})
document.querySelector('.close-popup').addEventListener('click', (e) => {
    document.querySelector('.settings-popup-container').setAttribute('hidden', true);
})
