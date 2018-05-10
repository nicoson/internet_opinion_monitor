const express   = require('express');
const router    = express.Router();
const DBConn    = require('../model/DBConnection');
const Receiver  = require('../model/Datareceiver');
const log4js = require('log4js');
log4js.configure({
  appenders: { info: { type: 'file', filename: 'log.log' } },
  categories: { 
    default: { 
      appenders: ['info'], 
      level: 'info' 
    }
  }
});
const logger = log4js.getLogger('wa');

const PAGESIZE  = 50;

let isSync = {
  pulp: 0,
  terror: 0,
  politician: 0,
  detection: 0
}

/* GET login page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'login' });
});

/* GET home page. */
router.get('/home', function(req, res, next) {
  res.render('home', { title: 'summary' });
});

/* GET pulp page. */
router.get('/pulp', function(req, res, next) {
  res.render('pulp', { title: 'pulp' });
});

/* GET terror page. */
router.get('/terror', function(req, res, next) {
  res.render('terror', { title: 'terror' });
});

//  post info
router.post('/getdata', function(req, res, next) {
  console.log(req.body.class, req.body.page);
  let q = DBConn.getData(req.body.class, req.body.page * PAGESIZE, PAGESIZE, req.body.startdate, req.body.enddate, req.body.score[0], req.body.cate, req.body.sort, req.body.order);
  q.then(data => {
    res.send(data);
  });
});

//  delete datum
router.post('/deletedatum', function(req, res, next) {
  console.log(req.body.id, req.body.table);
  let q = DBConn.deleteData(req.body.table, req.body.id);
  q.then(data => {
    res.send(data);
  });
});

//  get statistic info
router.get('/static', function(req, res, next) {
  const nday = 7;

  let qpulp = [];
  let qterror = [];
  let qterrordet = [];
  let qpolitician = [];
  let datelist = [];
  for(let i=0; i<nday; i++) {
    let tday = new Date();
    tday.setDate(tday.getDate() - i);
    tday = dateTransform(tday).slice(0,11);
    datelist.push(tday.slice(0,-1));
    qpulp.push(DBConn.getSumData('pulp', tday+'00:00:00', tday+'23:59:59'));
    qterror.push(DBConn.getSumData('terror', tday+'00:00:00', tday+'23:59:59'));
    qterrordet.push(DBConn.getSumData('detection', tday+'00:00:00', tday+'23:59:59'));
    qpolitician.push(DBConn.getSumData('politician', tday+'00:00:00', tday+'23:59:59'));
  }

  let pday = new Date();
  pday.setDate(pday.getDate()-1);
  let q2pulp = DBConn.getTop10('pulp', dateTransform(new Date(pday)), dateTransform(new Date()));
  let q2terror = DBConn.getTop10('terror', dateTransform(new Date(pday)), dateTransform(new Date()));
  let q2terrordet = DBConn.getTop10('terror', dateTransform(new Date(pday)), dateTransform(new Date()));
  let q2politician = DBConn.getTop10('politician', dateTransform(new Date(pday)), dateTransform(new Date()));

  Promise.all([...qpulp,...qterror,...qterrordet,...qpolitician,q2pulp,q2terror,q2terrordet,q2politician]).then(data => {
    // console.log(data);
    res.send({
      pulp: {
        count: data.slice(0,nday).reverse(),
        rank: data.slice(-4,-3)[0]
      },
      terror: {
        count: data.slice(nday, 2*nday).reverse(),
        rank: data.slice(-3,-2)[0]
      },
      terrordet: {
        count: data.slice(2*nday, 3*nday).reverse(),
        rank: data.slice(-2,-1)[0]
      },
      politician: {
        count: data.slice(3*nday, 4*nday).reverse(),
        rank: data.slice(-1)[0]
      },
      datelist: datelist.reverse()
    });
  });
});


function dateTransform(date) {
  date.setHours(date.getHours() + 8);
  return date.toJSON().slice(0,19);
}



// ===========================
// Sync Job
// ===========================
let rec = new Receiver(__dirname + '/../model/');
setInterval(function() {
  syncData('pulp');
  syncData('terror');
  syncData('detection');
  syncData('politician');
}, 60000000);

function syncData(table) {
  if(isSync[table] == 1) {
    console.log('XXXXXXXXXXXXX   job ',table, ' is still running ... ...');
    return;
  }

  console.log('==========>   start new job ',table, ' ... ...');
  isSync[table] = 1;
  console.log('isSync[table] = ', isSync[table]);

  // let q = DBConn.getLatestTime(table);
  // q.then(e => {
  // console.log("========> last upload time is: " + e);
  let today = new Date();  
  let data = rec.getData(table, new Date(`${today.getFullYear()}/${today.getMonth()+1}/${today.getDate()}`));
  data.then(data => {
    let tmp = '';
    
    if(data != undefined && data.length > 0) {
      let res = DBConn.insertData(table, data);
      res.then(e => {
        isSync[table] = 0;
        console.log('isSync[table] = ', isSync[table])
      }).catch(err => logger.info(err));
        
      // merge detection data into terror table
      if(table == 'detection'){
        let res2 = DBConn.insertData('terror', data);
        res2.then(e => {
          isSync[table] = 0;
          console.log('isSync[table] = ', isSync[table])
        }).catch(err => logger.info(err));
      }
    } else {
      console.log(table, ' has no data');
      isSync[table] = 0;
      console.log('isSync[table] = ', isSync[table])
    }
  }).catch(err => logger.info(err));
  // }).catch(err => logger.info(err));
}

module.exports = router;
