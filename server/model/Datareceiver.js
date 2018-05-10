const exec = require('child_process').exec; 
const http = require('http');

const publicServer = 'oquqvdmso.bkt.clouddn.com';
const URL_GETJOBS = '/exportlogs/';


class Receiver{
    constructor(path='') {
        this.start      = new Date();
        this.end        = new Date();
        this.pythonpath = path + 'export_logs.py';
    }

    resetRange(beginTime, endTime=new Date()) {
        this.end = new Date(endTime);
        this.start = new Date(beginTime);
        this.start.setSeconds(this.start.getSeconds() + 1);
    }

    getTimeString(time) {
        let year = time.getFullYear();
        let month = time.getMonth()+1;
        month = (month > 9) ? month : ('0' + month.toString());
        let day = time.getDate();
        day = (day > 9) ? day : ('0' + day.toString());
        let hour = time.getHours();
        hour = (hour > 9) ? hour : ('0' + hour.toString());
        let minute = time.getMinutes();
        minute = (minute > 9) ? minute : ('0' + minute.toString());
        let second = time.getSeconds();
        second = (second > 9) ? second : ('0' + second.toString());

        return `${year}-${month}-${day}T${hour}:${minute}:${second}`;
    }

    getData(cate, start, end = new Date()) {
        // start.setSeconds(this.start.getSeconds() + 1);
        // console.log(start, end);
        let cmdStr = `python3 ${this.pythonpath} --cate=${cate} --start=${this.getTimeString(start)} --end=${this.getTimeString(end)}`;
        console.log(cmdStr);
        return this.callPython(cmdStr).then(id => {
            console.log('======= id: ',id);
            return this.statusloop(id).then(key => {
                return this.callData(key);
            }).catch(err => console.log(err));
        }).catch(err => console.log(err));
    }

    callPython(cmdStr) {
        return new Promise(function(resolve, reject){
            exec(cmdStr, function(err,stdout,stderr){
                if(err) {
                    reject(err);
                    console.log(cmdStr + ' error: ' + stderr);
                } else {
                    let res = stdout.replace(/'/g, '"');
                    let data = JSON.parse(res);
                    // console.log(data);
                    // this.getStatus(data.id);
                    resolve(data.id);
                }
            });
        });
    }

    statusloop(id) {
        return new Promise(function(resolve, reject){
            this.getStatus(id).then((res,err) => {
                if(err) reject(err);
                if(res.status == 'done') {
                    console.log('======= key: ',res.params.key);
                    resolve(res.params.key);
                } else if(res.status == 'failed'){
                    console.log('Failed job ======= key: ',res.params.key);
                    reject(res.params.key);
                } else {
                    setTimeout(function(){
                        resolve(this.statusloop(id).then(e => {return e}));
                    }.bind(this), 5000);
                    // console.log('waiting ...');
                    console.log(res.status);
                }
            });
        }.bind(this));
    }

    getStatus(id) {
        let cmdStr = `python3 ${this.pythonpath} --id=` + id;
        // console.log(cmdStr);
        return new Promise(function(resolve, reject){
            exec(cmdStr, function(err, stdout, stderr){
                if(err) {
                    reject(err);
                    console.log('get weather api error:' + stderr);
                } else {
                    let res = null;
                    eval("res = " + stdout);
                    resolve(res);
                }
            });
        });
    }

    callData(key) {
        console.log('start loading data ...');
        console.log(key);
        return new Promise(function(resolve, reject){
            let options = {
                hostname: publicServer,
                path: URL_GETJOBS + key,
            };
        
            let req = http.get(options, (res) => {
                // console.log(`STATUS: ${res.statusCode}`);
                // console.log(`HEADERS: ${JSON.stringify(res.headers)}`);
                let data = '';
                res.setEncoding('utf8');
                res.on('data', (chunk) => {
                    data += chunk;
                    // console.log(`GET BODY: ${chunk}`);
                });
                res.on('end', () => {
                    data = data.replace(/\n/g,',');
                    data = JSON.parse('[' + data.slice(0,-1) + ']');
                    resolve(data);
                });
            });
        
            req.on('error', (e) => {
                console.log(`problem with get request: ${e.message}`);
                reject(e);
            });
        
            req.end();
        });
        
        // getdata.then(function(data) {
        //     console.log(data);
        // });
    }
};


/*  return json list structure
{
    "url":"qiniu:///ava-test/atflow-log-proxy/images/terror-classify-2018-03-04T17-50-37-VcQEsnDkWoXDW62LulSBbw==",
    "type":"image",
    "ops":"logexporter",
    "label":[{
        "name":"terror-classify",
        "type":"classification",
        "version":"1",
        "data":[{
            "class":"normal",
            "score":0.9569041132926941}]
        }],
        "UID":1381102897
    }
*/
/*
{
    "url":"qiniu:///ava-test/atflow-log-proxy/images/pulp-2018-04-18T23-22-47-8KydUtelpUSZdeHPJ2P9SQ==",
    "type":"image",
    "ops":"logexporter",
    "label":[{
        "name":"pulp",
        "type":"classification",
        "version":"1",
        "data":[{
            "class":"pulp",
            "score":1,
            "index":0
        },{
            "class":"normal",
            "score":3.710520601885037e-8,
            "index":0
        },{
            "class":"sexy",
            "score":1.3443409940805395e-8,
            "index":0
        }]
    }],
    "uid":1380460970,
    "create_time":"2018-04-18T23:22:47.412292086+08:00",
    "original_url":"sts://10.34.67.42:5556/v1/fetch?uri=http%3A%2F%2F10.34.52.40%3A11756%2Fdata%3Furl%3Dhttp%253A%252F%252F10.34.52.40%253A9001%252Ffile%252F%253Fquery%253DkjX22DyCgU-s-LBa8ymdhVbXfyt5fWwmbhptd7CoVxuJWTEhpl95QYsxld2XCX-C5x0gF5l0UtOq_1GdMNitPCvKZ8xZoR4VM98HE238BapDMd2ax3V5Eax8BAQHdlZpJTYx4Wmax4Zo8-VT5vtc06nRTQeylXxPVMhVGzXc2y6RrcYp8RDNwvKwrygNlmKsWvHqlCm95BDwiYn71073qnLOBWN4X_jDJ4x5v6DOu5ZjLthQMJIPnxfaEp_82UrVgUMkY2xRNNk%253D"
}
*/

// let test = new Receiver();
// test.getPulpData();
module.exports = Receiver;