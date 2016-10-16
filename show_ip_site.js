var app = require('express')();

// curl -d 'message you want to send' http://134.173.208.126:3142

app.set('view engine', 'pug');
app.enable('trust proxy');

var ips = []

app.post('/', function(req, res) {
    var ip = req.connection.remoteAddress;
    req.on('data', function(data) {
        if (data.length > 100) {
          data = data.slice(0, 100);
        }
        //console.log(ip);
        ips.push({ip: ip, time: new Date(), data: data});
        if (ips.length > 100) {
            ips = ips.slice(-100);
        }
        res.send('Got your IP: ' + ip + '\n');
    });
});

app.get('/', function(req, res) {
    var ip = req.connection.remoteAddress;
    if (ip.substring(0,7) != '134.173') {
        console.log('Rejected ' + ip);
        res.send('For security, this site can only be reached from Claremont\n')
    } else {
        var now = new Date();
        // Difference of dates gives a difference in milliseconds. Clear
        // entries once they're 10 minutes old
        while (ips.length > 0 && now - ips[0].time > 10*60*1000) {
            ips.shift();
        }
        res.render('template', {ips: ips});
    }
});

app.listen(3142, '0.0.0.0');
