'use strict';

const LS = localStorage;
const input = document.querySelector('#site-link');
const output = document.querySelector('.output-site-link');
const onOfList = document.querySelector('#list-on');
const errorTextBlock = document.querySelector('.error-text-block');
const blockSiteList = {};
const enableBlocking = {
    status: false,
}
let siteID = 0;

document.addEventListener('DOMContentLoaded', (e) => {
    checkLS();
    if (LS.getItem('chekedOpen') && LS.getItem('chekedOpen') === 'true') {
        onOfList.checked = true;
        enableBlocking.status = true;
        output.removeAttribute('hidden', 'true');
    } else {
        enableBlocking.status = false;
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
    if (LS.getItem('blockSiteList')) {
        const result = JSON.parse(LS.getItem('blockSiteList'));
        for (let key in result) {
            blockSiteList[key] = result[key];
            printBlockSiteList(result[key], key)
            siteID = Object.keys(result).length;
        }
    }
}
window.addEventListener('keydown', (e) => {
    let linkText = input.value.toLowerCase()
    if ((e.code === 'Enter' || e.code === 'NumpadEnter') && cleanUp(linkText)) {
        const test = checkItemForDB(blockSiteList, cleanUp(linkText))
        if (test) {
            errorTextBlock.textContent = 'Такая ссылка уже есть!';
            input.value = '';
            setTimeout(function () {
                errorTextBlock.textContent = '';
            }, 10000)
        } else {
            printBlockSiteList(cleanUp(linkText), siteID);
            blockSiteList[siteID] = cleanUp(linkText);
            siteID++;
            input.value = '';
            saveLS();
            send();
        }
    }
})
function saveLS() {
    LS.setItem('blockSiteList', JSON.stringify(blockSiteList));
}
function printBlockSiteList(text, id) {
    let link = `http://www.google.com/s2/favicons?domain=${cleanUp(text)}&sz=128`;
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
    } else {
        output.setAttribute('hidden', 'true');
        LS.setItem('chekedOpen', false);
        enableBlocking.status = false;
    }
    send();
    console.log(enableBlocking.status);
})

function cleanUp(url) {
    var url = url.trim(url);
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
        console.log("Value is set");
    });
}