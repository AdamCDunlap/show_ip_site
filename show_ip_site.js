var express = require('express');
var app = express();

// curl -d 'message you want to send' IP_ADDRESS:3142

var max_msg_len = 100;
var max_num_msgs = 100;

app.use(express.static('static'));

app.set('view engine', 'pug');
app.enable('trust proxy');

var msgs = []

app.post('/', function(req, res) {
    var ip = req.connection.remoteAddress;
    var fullData = '';

    req.on('data', function(data) {
        if (fullData.length < max_msg_len) {
            fullData += data;
            if (fullData.length > max_msg_len) {
              fullData = fullData.slice(0, max_msg_len);
            }
        }
    });
    req.on('end', function() {
        //console.log(ip);
        msgs.push({ip: ip, time: new Date(), data: fullData});
        if (msgs.length > max_num_msgs) {
            msgs = msgs.slice(-max_num_msgs);
        }
        res.send('Got your IP: ' + ip + '\n');
    });
});

app.get('/', function(req, res) {
    var ip = req.connection.remoteAddress;
    if (ip.substring(0,7) != '134.173') {
        //console.log('Rejected ' + ip);
        res.send('For security, this site can only be reached from Claremont\n')
    } else {
        var now = new Date();
        // Difference of dates gives a difference in milliseconds. Clear
        // entries once they're 10 minutes old
        while (msgs.length > 0 && now - msgs[0].time > 10*60*1000) {
            msgs.shift();
        }
        res.render('mainpage', {msgs: msgs});
    }
});

app.listen(3142, '0.0.0.0');
