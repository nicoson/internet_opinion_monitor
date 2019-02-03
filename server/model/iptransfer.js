const getURLInfo    = require('./getURLInfo');
const GETIP         = require('./getip');
// const DBConn        = require('./DBConnection');
const ParseIP       = require('./ParseIP');
const qiniu         = require('qiniu');
const URL           = require('url');

let gb = new getURLInfo();
let getip = new GETIP();

class ipTransfer {
    constructor() {}

    convert(table) {
        DBConn.getUnhandledData(table).then(data => {
            this.loopBody(data, table);
        }).catch(err=>console.log(err));
    }
    
    async loopBody(data, table) {
        for(let i=0; i<data.length; i++) {
            await this.mapAndInsert(table, data[i]).then(e=>console.log('final result: ', i));   
        }
    }

    async getInfo(url) {
        let urlinfo = URL.parse(url);
        let domain = urlinfo.host;
        let key = urlinfo.pathname.slice(1);
        let reqURL = "http://10.34.43.45:16301/admin/domain/" + domain;

        let bucketInfo = await gb.getBucketInfo(reqURL);
        console.log(bucketInfo);
        if(typeof(bucketInfo.uid) == 'undefined') {
            return 'UNKNOWN';
        } else {
            let fileInfo = await gb.getIPInfo(bucketInfo.source.sourceQiniuBucket, key, bucketInfo.uid);
            console.log(fileInfo);
            if(typeof(fileInfo.ip) == 'undefined') {
                return 'UNKNOWN';
            } else {
                let ip = ParseIP.ParseIP(fileInfo.ip.slice(0,-2)+'==');
                console.log(ip);
                let res = await getip.getZone(ip);
                console.log(res);
                if(res.code == 0) {
                    return res.data;
                } else {
                    return 'UNKNOWN';
                }
            }
        }
    }

}

module.exports = ipTransfer;