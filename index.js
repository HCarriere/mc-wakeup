const express = require('express');
const http = require('http');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser');

const ping = require('ping');
const https = require('https');

const app = express();
const server = http.createServer(app);

const port = process.env.PORT || 3000;
const env = process.env.ENV || 'dev'; // prod
const apiPassword = process.env.API_PASSWORD || 'LixX4f8wm7EUB9g2G2025XjVYmgNYCA7p/c58l3Wv+0=';
const jwtSecret = process.env.JWT_SECRET || 'secret';
const wakeUpUrl = process.env.WAKE_UP_URL || 'https://localhost:50000';
const hostToPing = process.env.HOST_TO_PING || 'https://localhost:50001';

app.use(express.static(__dirname + '/front/dist/front'));
app.use(express.static(__dirname + '/public'));

app
.use(bodyParser.json({limit: '100mb', extended: true}))
.use(bodyParser.urlencoded({limit: '100mb', extended: true}));

function checkHttps(req, res, next){    
    if(req.get('X-Forwarded-Proto').indexOf("https")!=-1){
      return next();
    } else {
      res.redirect('https://' + req.hostname + req.url);
    }
}

if (env == 'prod') {
    app.all('*', checkHttps)
}


app
.post('/api/auth', (req, res) => {
    const { password } = req.body;
    if (!password) return res.sendStatus(400);
    
    const hash = crypto.createHash('sha256').update(password).digest('base64');
    // console.log(hash)
    if (hash == apiPassword) {
        const accessToken = jwt.sign({ login: 'admin'}, jwtSecret, { expiresIn: '1d'});
        res.json({
            accessToken,
        });
    } else {
        res.sendStatus(401);
    }
})

.post('/api/wakeupmc', mustBeAdmin, (req, res) => {
    console.log('Waking up MC ...');
    https.get(wakeUpUrl, res => {
        if (res.statusCode == 200) {
            res.sendStatus(200);
        } 
        else {
            res.sendStatus(500);
            console.log('Wake up failed : ' + res.statusCode);
        }
    }).on('error', err => {
        console.log('Error: ', err.message);
    });
})

.get('/api/serverstatus', mustBeAdmin, (req, res) => {
    console.log('Pinging host ...')
    ping.sys.probe(hostToPing, isAlive => {
        console.log('Host is ' + (isAlive ? 'ON' : 'OFF'));
        res.send(isAlive);
    });
})

.get('*', (req, res) => {
    res.sendFile(__dirname + '/front/dist/front/index.html');
})
.use((err, req, res, next) => {
    console.error(err);
    res.json(err);
});

server.listen(port, (err) => {
    if (err) {
        return console.log(err);
    }
    console.log(`Listening on port ${port}`);
});


function mustBeAdmin(req, res, next) {
    const authHeader = req.headers.authorization;
    let token;
    if (authHeader) {
        token = authHeader.split(' ')[1];
    } else {
        token = req.query.authorization;
    }

    if (token) {
        jwt.verify(token, jwtSecret, (err, user) => {
            if (err) {
                return res.sendStatus(403);
            }

            req.user = user;
            next();
        })
    } else {
        res.sendStatus(401);
    }
}