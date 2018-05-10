const getURLInfo    = require('./getURLInfo');
const GETIP         = require('./getip');
const DBConn        = require('./DBConnection');
const ParseIP       = require('./ParseIP');
const qiniu         = require('qiniu');
const URL           = require('url');

let gb = new getURLInfo();
class convertIP {
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

    mapAndInsert(table, datum) {
        if(datum.original_url != undefined && datum.original_url != 'undefined') {
            let urlinfo = URL.parse(datum.original_url);
            let domain = urlinfo.host;
            let key = urlinfo.pathname.slice(1);
            let reqURL = "http://10.34.43.45:16301/admin/domain/" + domain;

            return gb.getBucketInfo(reqURL).then(bk => {
                if(bk.error != undefined){
                    // console.log(bk);
                    return DBConn.updateBucketIP(table, datum.ID, 'UNKNOWN', 'UNKNOWN');
                } else {
                    // console.log(bk.source.sourceQiniuBucket, key, datum.uid);
                    return gb.getIPInfo(bk.source.sourceQiniuBucket, key, datum.uid).then(e => {
                        // console.log(ParseIP.ParseIP(e.ip));
                        return DBConn.updateBucketIP(table, datum.ID, bk.source.sourceQiniuBucket, ParseIP.ParseIP(e.ip));
                        // gi.getZone(ip).then(zone => {
                        //     console.log(zone);
                        //     resolve(zone);
                        // }).catch(err => {
                        //     console.log(err);
                        // });
                    });
                }
            }).catch(err => {
                console.log(err);
                return DBConn.updateBucketIP(table, datum.ID, 'UNKNOWN', 'UNKNOWN');
            });
        } else {
            return DBConn.updateBucketIP(table, datum.ID, 'UNKNOWN', 'UNKNOWN');
        }
    }
}

module.exports = convertIP;