const express = require('express');
const app = express();
const parser = require('body-parser');
const path = require('path');
const fs = require('fs');
const port = 8080;
const os = require('os');
const editJSONFile = require('edit-json-file');
const ifaces = os.networkInterfaces();
let runTime, answersDB;

/**
 *  Get IPv4 Address of the System
 */
const getIPV4 = () => {
   let ipv4Address;
    Object.keys(ifaces).forEach(function (ifname) {
        ifaces[ifname].forEach(function (iface) {
          if ('IPv4' !== iface.family || iface.internal !== false) {
            return;
          }
          ipv4Address = iface.address;
        });
    });
    return ipv4Address;
}

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

app.get('/', (req, res) => {
    const destPath = path.join(__dirname, 'index.html');
    res.sendFile(destPath);
});

app.get('/web-uri', (req, res) => {
    res.end(uri);
});

app.get('/getconfig', (req, res) => {
    res.send(
        JSON.parse(
            fs.readFileSync(
                path.join(__dirname, 'feedback_config.json')
            )
        )
    );
});

app.post('/submitFeedback', (req, res) => {
    let feedbackEntry = req.body;
    //setting unique time-stamp as a identifier
    let id = 'feedback'+Date.now();
    feedbackEntry.id = id;
    answersDB = editJSONFile(`${__dirname}/feedback-db/feedbacks.json`);
    answersDB.set(id, feedbackEntry);
    answersDB.save();
    res.send({
        "status": "SUCCESS",
        "feedback_id": id
    });
});

const runServer = (isLocal) => {
    uri = "http://"+getIPV4()+":"+port;
    app.listen(port, () => {
        isLocal && console.log("Server listening on "+uri);
    });
    return uri;
}

process.argv.slice(2).forEach(arg => {
    const [key,value] = arg.split("=");
    runTime = value;
});

if (runTime == 'local') {
    runServer(true);
}

module.exports = {
    run: runServer
}