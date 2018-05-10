request = require('request');

const options = {
    method: 'GET',
    url: 'http://int.dpool.sina.com.cn/iplookup/iplookup.php?format=js&ip=180.168.57.238',
    // url: 'http://ip.taobao.com/service/getIpInfo.php?ip=180.168.57.238',
    // url: 'http://ip.ws.126.net/ipquery?ip=180.168.57.238',
    headers: {
        // 'Content-Type': application/json,
        // 'Authorization': token
    }
};

class getIP {
    constructor() {

    }

    getZone(ip) {
        let options = {
            method: 'GET',
            url: 'http://int.dpool.sina.com.cn/iplookup/iplookup.php?format=js&ip='+ip,
            // url: 'http://ip.taobao.com/service/getIpInfo.php?ip=180.168.57.238',
            // url: 'http://ip.ws.126.net/ipquery?ip=180.168.57.238',
            headers: {
                // 'Content-Type': application/json,
                // 'Authorization': token
            }
        };

        return new Promise(function(resolve, reject){
            request(options, function (err, res, body) {
                if (err) {
                    console.log(err)
                    reject(err);
                }else {
                    let ind = body.indexOf('{');
                    let ipaddr = JSON.parse(body.slice(ind,-1));
                    // ipaddr.country = this.reconvert(ipaddr.country);
                    // ipaddr.province = this.reconvert(ipaddr.province);
                    // ipaddr.city = this.reconvert(ipaddr.city);
                    console.log(ipaddr);
                    resolve(ipaddr);
                }
            });
        });
    }

    reconvert(str) { 
        str = str.replace(/(\\u)(\w{1,4})/gi,function($0){ 
            return (String.fromCharCode(parseInt((escape($0).replace(/(%5Cu)(\w{1,4})/g,"$2")),16))); 
        }); 
        str = str.replace(/(&#x)(\w{1,4});/gi,function($0){ 
            return String.fromCharCode(parseInt(escape($0).replace(/(%26%23x)(\w{1,4})(%3B)/g,"$2"),16)); 
        }); 
        str = str.replace(/(&#)(\d{1,6});/gi,function($0){ 
            return String.fromCharCode(parseInt(escape($0).replace(/(%26%23)(\d{1,6})(%3B)/g,"$2"))); 
        }); 
          
        return str; 
    }
}

module.exports = getIP;