//connection to database
const mysql = require('mysql');
const URL = require('url');

const HOST = '127.0.0.1';
// const HOST = 'lego-mysql-0.lego-mysql.ava.svc.cluster.local';
const USER = 'root';
const PASSWORD = 'root';
const DATABASE = 'yuqing'

function DBConn(){};

DBConn.createBaseTable = function(table) {
    //  config database
    let connection = mysql.createConnection({
        host: HOST,
        user: USER,
        password: PASSWORD,
        database: DATABASE
    });

    let p = new Promise(function(resolve, reject){
        connection.connect();
        //  create terror table
        let sql =   `CREATE TABLE IF NOT EXISTS ${table}(
                        ID bigint(20) primary key NOT NULL auto_increment,
                        url varchar(500) DEFAULT NULL COMMENT 'image url',
                        original_url varchar(500) DEFAULT NULL COMMENT 'image original url',
                        domain varchar(300) DEFAULT NULL COMMENT 'domain of the original url',
                        bucket varchar(300) DEFAULT NULL COMMENT 'bucket of the original url',
                        ip varchar(30) DEFAULT NULL COMMENT 'IP address of the terminal user',
                        uid varchar(300) DEFAULT NULL COMMENT 'uid of the image',
                        cate varchar(20) DEFAULT NULL COMMENT 'categray for image',
                        score double DEFAULT NULL COMMENT 'probability for classify',
                        isshow tinyint(1) DEFAULT 1 COMMENT 'status for show in frontend',
                        created_date datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'upload date',
                        update_date datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'update date',
                        UNIQUE KEY idx_url (created_date,original_url)
                    ) ENGINE=InnoDB DEFAULT CHARSET=utf8`;
        // console.log(sql);
        //  execute query
        connection.query(sql, function(err, rows, fields) {
            if (err) {
                console.log(err);
            } else {
                console.log(table, ' table created successfully !!!');
            }
        });
        //  close connection
        connection.end();
    });

    return p;
}

DBConn.getData = function(table, start, end, startdate, enddate, score, cate, sort, order) {
    //  config database
    let connection = mysql.createConnection({
        host: HOST,
        user: USER,
        password: PASSWORD,
        database: DATABASE
    });
    
    let p = new Promise(function(resolve, reject){
        connection.connect();
        let sql = `SELECT * from ${table}
                    where created_date >= '${startdate}T00:00:00' and created_date <= '${enddate}T23:59:59' 
                    and uid not in ('1381102897','1380469261','1380460970','1381351220')
                    and isshow = 1
                    and score >= '${score}'
                    ${cate==null ? '':("and cate = '" + cate + "'")}
                    order by ${sort} ${order} limit ${start}, ${end}`;
        console.log(sql);
        //  execute query
        connection.query(sql, function(err, rows, fields) {
            if (err) {
                reject(err);
            }
            // console.log('db: ', rows);
            resolve(rows);
        });
        //  close connection
        connection.end();
    });

    return p;
}

DBConn.getLatestTime = function(table) {
    //  config database
    let connection = mysql.createConnection({
        host: HOST,
        user: USER,
        password: PASSWORD,
        database: DATABASE
    });

    let p = new Promise(function(resolve, reject){
        connection.connect();
        sql = 'SELECT max(update_date) as time from ' + table;
        console.log(sql);

        //  execute query
        connection.query(sql, function(err, rows, fields) {
            if (err) {
                reject(err);
            }
            // console.log('The result is: ', rows);
            resolve(rows[0].time);
        });
        //  close connection
        connection.end();
    });

    return p;
}

DBConn.insertData = function(table, data) {
    //  config database
    let connection = mysql.createConnection({
        host: HOST,
        user: USER,
        password: PASSWORD,
        database: DATABASE
    });

    let tmp = [];
    console.log(data.length);
    data.forEach(datum => {
        // if(datum.uid == 1381102897) return;
        let url = datum.url.replace('qiniu:///ava-test', 'http://oquqvdmso.bkt.clouddn.com');
        // let time = url.replace(/[a-zA-Z-\/=:.]{2,10}/g,'').slice(0,19);
        // time = time.split('T')[0] + 'T' + time.split('T')[1].replace(/-/g,':');
        let time = '2018-01-01T00:00:00'
        if(datum.create_time != undefined) {
            time = datum.create_time.slice(0,19);
        } else {
            time = url.replace(/[a-zA-Z-\/=:.]{2,10}/g,'').slice(0,19);
            time = time.split('T')[0] + 'T' + time.split('T')[1].replace(/-/g,':');
        }

        let uid = 'NULL';
        if(datum.uid == undefined) {
            uid = datum.UID;
        } else {
            uid = datum.uid;
        }
        tmp.push(`('${url}','${datum.original_url}','${datum.original_url == undefined ? 'NULL' : URL.parse(datum.original_url).host}','${datum.label[0].data[0].class}','${datum.label[0].data[0].score}','${uid}','${time}')`);
    });
    // console.log(tmp.join(','));
    console.log(tmp.length, ' valid data remained');

    let p = new Promise(function(resolve, reject){
        if(tmp.length == 0) reject('no data');
        connection.connect();
        sql = 'INSERT IGNORE INTO ' + table + `(url,original_url,domain,cate,score,uid,created_date) VALUES ` + tmp.join(',');

        //  execute query
        connection.query(sql, function(err, rows, fields) {
            if (err) {
                reject(err);
            }
            console.log('Results: ', rows);
            resolve(rows);
        });
        //  close connection
        connection.end();
    });

    return p;
}

DBConn.getSumData = function(table, start, end) {
    let connection = mysql.createConnection({
        host: HOST,
        user: USER,
        password: PASSWORD,
        database: DATABASE
    });

    let p = new Promise(function(resolve, reject){
        connection.connect();
        //  create pulp table
        // let sql = `select count(*) as count from ${table} where created_date>='${start}' and created_date<='${end}'`;
        let sql = `select count(*) as count from ${table} where created_date>='${start}' and created_date<='${end}'`;
        //  console.log(sql);
        //  execute query
        connection.query(sql, function(err, rows, fields) {
            if (err) {
                reject(err);
            }
            resolve(rows[0].count);
        });
        //  close connection
        connection.end();
    });

    return p;
}

DBConn.deleteData = function(table, id) {
    let connection = mysql.createConnection({
        host: HOST,
        user: USER,
        password: PASSWORD,
        database: DATABASE
    });

    let p = new Promise(function(resolve, reject){
        connection.connect();
        //  create pulp table
        let sql = `update ${table} set isshow=0 where ID='${id}'`;
        // console.log(sql);
        //  execute query
        connection.query(sql, function(err, rows, fields) {
            if (err) {
                reject(err);
            }
            resolve(rows[0]);
        });
        //  close connection
        connection.end();
    });

    return p;
}

DBConn.getTop10 = function(table, start, end) {
    let connection = mysql.createConnection({
        host: HOST,
        user: USER,
        password: PASSWORD,
        database: DATABASE
    });

    let p = new Promise(function(resolve, reject){
        connection.connect();
        //  create pulp table
        let sql = `select uid, count(uid) as num from ${table} 
                    where created_date>='${start}' and created_date<='${end}' 
                    and uid not in ('1381102897','1380469261','1380460970','1381351220')
                    group by uid order by num desc limit 10`;
        console.log(sql);
        //  execute query
        connection.query(sql, function(err, rows, fields) {
            if (err) {
                reject(err);
            }

            let count = [];
            let rank = [];
            for(let i=0; i<rows.length; i++) {
                count.push(rows[i].num);
                rank.push(rows[i].uid);
            }
            resolve({
                uid: rank.reverse(),
                count: count.reverse()
            });
        });
        //  close connection
        connection.end();
    });

    return p;
}

DBConn.getUnhandledData = function(table) {
    let connection = mysql.createConnection({
        host: HOST,
        user: USER,
        password: PASSWORD,
        database: DATABASE
    });

    return new Promise(function(resolve, reject){
        connection.connect();
        //  create pulp table
        // let sql = `select ID,uid,original_url from ${table} where bucket is NULL`;
        let sql = `select ID,uid,original_url from ${table} where original_url like 'http:%'`;
        console.log(sql);
        //  execute query
        connection.query(sql, function(err, rows, fields) {
            if (err) {
                reject(err);
            }
            resolve(rows);
        });
        //  close connection
        connection.end();
    });
}

DBConn.updateBucketIP = function(table,ID,bucket,ip) {
    let connection = mysql.createConnection({
        host: HOST,
        user: USER,
        password: PASSWORD,
        database: DATABASE
    });

    return new Promise(function(resolve, reject){
        connection.connect();
        let sql = `update ${table} set bucket='${bucket}', ip='${ip}' where ID=${ID}`;
        console.log(sql);
        //  execute query
        connection.query(sql, function(err, rows, fields) {
            if (err) {
                reject(err);
            }
            resolve(rows);
        });
        //  close connection
        connection.end();
    });
}

// console.log(DBConn.getData())
module.exports = DBConn;