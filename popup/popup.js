'use strict';

const LS = localStorage;
const input = document.querySelector('#site-link');
const output = document.querySelector('.output-site-link');
const onOfList = document.querySelector('#list-on');
const listSpan = document.querySelector('.list-on-span');
const linkInInput = document.querySelector('#link-in-input');
const errorTextBlock = document.querySelector('.error-text-block');
const title = document.querySelector('.title');
const popupOpen = document.querySelector('.settings-popup');
const addButton = document.querySelector('.button-add-and-delete');
const popupContent = document.querySelector('.popup-content');
const popupContainer = document.querySelector('.settings-popup-container');

const blockSiteList = {};
const appStatus = {
    removeNotification: false,
    linkInInput: false,
    enableBlocking: false,
}

document.addEventListener('DOMContentLoaded', (e) => {
    checkLS();
    if (LS.getItem('appStatus')) {
        const obj = JSON.parse(LS.getItem('appStatus'));
        for (let key in obj) {
            appStatus[key] = obj[key]
        }
        if (appStatus.removeNotification === true) {
            document.querySelector('#instruction').checked = true;
            title.setAttribute('hidden', 'true');
        } else {
            document.querySelector('#instruction').checked = false;
            title.removeAttribute('hidden', 'true');
        }
        if (appStatus.linkInInput === true) {
            linkInInput.checked = true;
        } else {
            linkInInput.checked = false;
        }
        if (appStatus.enableBlocking === true) {
            listSpan.textContent = 'Выключить блокировку';
            output.setAttribute('hidden', 'true');
            onOfList.checked = true;
            input.removeAttribute('disabled', 'false');
            addButton.removeAttribute('disabled', 'true');
            checkLinkPage()
        } else {
            listSpan.textContent = 'Включить блокировку';
            output.removeAttribute('hidden', 'true');
            onOfList.checked = false;
            input.setAttribute('disabled', 'true');
            addButton.setAttribute('disabled', 'true');
        }
    }
})

function checkLinkPage() {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        chrome.tabs.sendMessage(tabs[0].id, { type: "msg_from_popup" }, function (response) {
            let tester = checkItemForDB(blockSiteList, response)
            if (appStatus.linkInInput === true) {
                if (tester === false) {
                    if (response == undefined) {
                    } else {
                        addButton.title = 'Добавить ссылку в список';
                        input.value = response;
                    }
                } else {
                    input.value = response;
                    addButton.title = 'Удалить ссылку из списка';
                    addButton.classList.remove('add');
                    addButton.classList.add('remove');
                    addButton.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" height="20" viewBox="0 -960 960 960" width="20"><path d="M261-120q-24 0-42-18t-18-42v-570h-11q-12.75 0-21.375-8.675-8.625-8.676-8.625-21.5 0-12.825 8.625-21.325T190-810h158q0-13 8.625-21.5T378-840h204q12.75 0 21.375 8.625T612-810h158q12.75 0 21.375 8.675 8.625 8.676 8.625 21.5 0 12.825-8.625 21.325T770-750h-11v570q0 24-18 42t-42 18H261Zm0-630v570h438v-570H261Zm0 0v570-570Zm219 330 96 97q11 10 24.5 10t23.5-10q10-10 10.5-24T624-370l-96-98 96-98q10-10 10.5-24t-10.457-23.087Q614-623 600.067-623q-13.934 0-24.067 10l-96 97-95-97q-9-11-23-10.5T337-613q-11 10-10.5 23.5T337-565l96 97-96 97q-10 10-10 23.5t10.043 24.457Q348-313 361.5-313t23.5-10l95-97Z"/></svg>`
                }
            }
        });
    });
}

function checkLS() {
    if (LS.getItem('blockSiteList') && JSON.parse(localStorage.getItem('appStatus')).enableBlocking === true) {
        const result = JSON.parse(LS.getItem('blockSiteList'));
        for (let key in result) {
            blockSiteList[key] = result[key];
            printBlockSiteList(result[key], key)
        }
    }
}

function checkItemForDB(db, item) {
    const arr = []
    const emptyOrder = Object.keys(db).length === 0;
    if (emptyOrder) return false;
    for (let key in db) {
        arr.push(db[key])
    }
    if (arr.includes(item)) {
        return true
    } else {
        return false
    }
}

function printErrorMessage(text) {
    errorTextBlock.removeAttribute('hidden', 'true');
    errorTextBlock.innerHTML = `<div class="error-text">${text}</div>`;
    setInterval(function () {
        errorTextBlock.setAttribute('hidden', 'true');
        errorTextBlock.innerHTML = '';
    }, 5000)
}

function saveLS() {
    LS.setItem('blockSiteList', JSON.stringify(blockSiteList));
}
function saveAppStatusToLS() {
    LS.setItem('appStatus', JSON.stringify(appStatus));
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

output.addEventListener('click', (e) => removeElement(e));

function removeElement(e) {
    const linkId = e.target.parentNode.dataset.linkId;
    if (e.target.closest('.remove-link')) {
        delete blockSiteList[linkId];
        saveLS();
        e.target.parentNode.remove(e.target.parentNode.classList.contains('link-container'));
        sendToContentJS();
        addButtonStatus();
        input.value = '';
    }
}

input.addEventListener('keydown', printLinkInOutput)
addButton.addEventListener('mousedown', printLinkInOutput)

function printLinkInOutput(e) {
    if ((e.code === 'Enter' || e.code === 'NumpadEnter' || (e.button === 0 && addButton.closest('.add'))) && input) {
        let siteID = Date.now();
        let link = searchWWW(cleanUp(input.value))
        let tester = checkItemForDB(blockSiteList, link)
        if (tester === false) {
            printBlockSiteList(link, siteID);
            blockSiteList[siteID] = link;
            input.value = '';
            saveLS();
            sendToContentJS();
            addButtonStatus();
        } else {
            printErrorMessage('Этот сайт уже добавлен в список!')
            input.value = '';
        }
    }
    if (e.button === 0 && addButton.closest('.remove')) {
        const target = output.childNodes;
        for (let key in blockSiteList) {
            if (blockSiteList[key] === input.value) {
                target.forEach((item, i) => {
                    if (target[i].title === blockSiteList[key]) {
                        target[i].remove();
                    }
                })
                delete blockSiteList[key];
                input.value = '';
                addButtonStatus()
                saveLS();
                sendToContentJS();
            }

        }
    }
}

linkInInput.addEventListener('click', (e) => {
    if (linkInInput.checked === true) {
        appStatus.linkInInput = true;
        saveAppStatusToLS();
    } else {
        appStatus.linkInInput = false;
        saveAppStatusToLS();
    }
})

onOfList.addEventListener('input', (e) => {
    if (onOfList.checked === true) {
        listSpan.textContent = 'Выключить блокировку';
        output.removeAttribute('hidden', 'true');
        appStatus.enableBlocking = true;
        input.removeAttribute('disabled', 'true');
        addButton.removeAttribute('disabled', 'true');
        saveAppStatusToLS();
        checkLS();
        sendToContentJS();
        checkLinkPage();
    } else {
        listSpan.textContent = 'Включить блокировку';
        input.value = '';
        output.setAttribute('hidden', 'true');
        appStatus.enableBlocking = false;
        output.innerHTML = '';
        input.setAttribute('disabled', 'true');
        addButton.setAttribute('disabled', 'true');
        saveAppStatusToLS();
        sendToContentJS();
    }
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


function sendToContentJS() {
    chrome.storage.local.set({
        key: blockSiteList,
        keyTwo: appStatus.enableBlocking,
    }).then(() => {

    });
}

popupOpen.addEventListener('click', (e) => {
    popupContainer.removeAttribute('hidden', true);
})
popupContent.addEventListener('click', (e) => {
    if (e.target.closest('#instruction') && e.target.closest('#instruction').checked === true) {
        document.querySelector('.title').setAttribute('hidden', true);
        appStatus.removeNotification = true;
    }
    if (e.target.closest('#instruction') && e.target.closest('#instruction').checked === false) {
        document.querySelector('.title').removeAttribute('hidden', true);
        appStatus.removeNotification = false;
    }
    if (e.target.closest('.close-popup')) {
        popupContainer.setAttribute('hidden', true);
    }
    saveAppStatusToLS();
})

function addButtonStatus() {
    if (addButton.classList.contains('add')) {
        addButton.classList.remove('add')
        addButton.classList.add('done')
        addButton.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" height="20" viewBox="0 -960 960 960" width="20"><path d="m378-332 363-363q9.067-9 21.533-9Q775-704 784-694.947q9 9.052 9 21.5Q793-661 784-652L399-267q-9 9-21 9t-21-9L175-449q-9-9.067-8.5-21.533Q167-483 176.053-492q9.052-9 21.5-9Q210-501 219-492l159 160Z"/></svg>`;
        setTimeout(function () {
            addButton.classList.remove('done')
            addButton.classList.add('add')
            addButton.innerHTML = `                        <svg xmlns="http://www.w3.org/2000/svg" height="20" viewBox="0 -960 960 960" width="20">
                            <path
                                d="M479.825-200Q467-200 458.5-208.625T450-230v-220H230q-12.75 0-21.375-8.675-8.625-8.676-8.625-21.5 0-12.825 8.625-21.325T230-510h220v-220q0-12.75 8.675-21.375 8.676-8.625 21.5-8.625 12.825 0 21.325 8.625T510-730v220h220q12.75 0 21.375 8.675 8.625 8.676 8.625 21.5 0 12.825-8.625 21.325T730-450H510v220q0 12.75-8.675 21.375-8.676 8.625-21.5 8.625Z" />
                        </svg>`;
        }, 1000);
    }
    if (addButton.classList.contains('remove')) {
        addButton.classList.remove('remove')
        addButton.classList.add('done')
        addButton.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" height="20" viewBox="0 -960 960 960" width="20"><path d="m378-332 363-363q9.067-9 21.533-9Q775-704 784-694.947q9 9.052 9 21.5Q793-661 784-652L399-267q-9 9-21 9t-21-9L175-449q-9-9.067-8.5-21.533Q167-483 176.053-492q9.052-9 21.5-9Q210-501 219-492l159 160Z"/></svg>`;
        setTimeout(function () {
            addButton.classList.remove('done')
            addButton.classList.add('add')
            addButton.title = 'Удалить ссылку из списка';
            addButton.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" height="20" viewBox="0 -960 960 960" width="20">
                            <path
                                d="M479.825-200Q467-200 458.5-208.625T450-230v-220H230q-12.75 0-21.375-8.675-8.625-8.676-8.625-21.5 0-12.825 8.625-21.325T230-510h220v-220q0-12.75 8.675-21.375 8.676-8.625 21.5-8.625 12.825 0 21.325 8.625T510-730v220h220q12.75 0 21.375 8.675 8.625 8.676 8.625 21.5 0 12.825-8.625 21.325T730-450H510v220q0 12.75-8.675 21.375-8.676 8.625-21.5 8.625Z" />
                        </svg>`;
        }, 1000);
    }
}