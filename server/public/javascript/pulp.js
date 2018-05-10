let isEditor = sessionStorage.isEditor == undefined ? false : (sessionStorage.isEditor == 'true' ? true : false);
let PAGENUM = 0;
let headers = new Headers();
headers.append('Content-Type', 'application/json');
let postBody = {
    method: 'POST',
    headers: headers,
    body: JSON.stringify(
        {
            class: 'pulp',
            page: PAGENUM,
            startdate: dateTransform(new Date()),
            enddate: dateTransform(new Date()),
            score: [0.99, 1],
            cate: ['pulp']
        }
    )
}

if(sessionStorage.islogin == undefined || sessionStorage.islogin != 'true') {
    location.href = '/index.html';
} else {
    document.querySelector('section').removeAttribute('class');
}

window.onload = function() {
    if(APIHOST == undefined) window.APIHOST = '';

    //  set default filter value
    let yesterday = new Date();
    yesterday = yesterday.setDate(yesterday.getDate() - 1);
    document.querySelector('#wa_filter_input_datetime_end').value = dateTransform(new Date());
    document.querySelector('#wa_filter_input_datetime_start').value = dateTransform(new Date(yesterday));

    postBody.body = JSON.stringify(
        {
            class: 'pulp',
            page: PAGENUM,
            startdate: dateTransform(new Date(yesterday)),
            enddate: dateTransform(new Date()),
            score: [0.99, 1],
            cate: ['pulp']
        }
    );

    fetch(APIHOST + '/getdata', postBody).then(e => e.json()).then(function(data) {
        let ele = document.querySelector('#wa_home_tablelist');
    
        let theader = `<tr>
                        <th>序号</th>
                        <th>上传日期</th>
                        <th>截图</th>
                        <th>评测结果</th>
                        <th>置信度</th>
                        <th>来源</th>
                        <th>链接</th>
                    </tr>`;
    
        let tmp = createTemplate(data);
        PAGENUM++;
        ele.innerHTML = theader + tmp;
    });
}

document.querySelectorAll('#wa_home_navbar>p').forEach(e => e.addEventListener('click', function(e) {
    document.querySelectorAll('#wa_home_navbar>p').forEach(k => k.removeAttribute('class'));
    e.target.setAttribute('class', 'wa-home-nav-selected');
}));

document.querySelector('section').addEventListener('scroll', function(e) {
    if(e.target.scrollHeight - e.target.scrollTop - e.target.clientHeight < 200) {
        console.log('loading ...');

        PAGENUM++;
        genPostBody();
        fetch(APIHOST + '/getdata', postBody).then(e => e.json()).then(function(data) {
            let tmp = createTemplate(data);
            let ele = document.querySelector('#wa_home_tablelist');
            ele.innerHTML += tmp;
        });
    }
});

function createTemplate(data) {
    let tmp = '';
    for(let i=0; i< data.length; i++) {//<td>${(data[i].created_date).slice(0,19).replace('T', ' ')}</td>
        let time = new Date(data[i].created_date);
        tmp +=  `<tr>
                    <td>${PAGENUM*30 + i + 1}</td>
                    <td>${dateTransform(time)} ${time.getHours()>9?time.getHours():'0'+time.getHours()}:${time.getMinutes()>9?time.getMinutes():'0'+time.getMinutes()}:${time.getSeconds()>9?time.getSeconds():'0'+time.getSeconds()}</td>
                    <td><a href="${data[i].url}"><img src="${data[i].url}" alt=""></a></td>
                    <td>${categary(data[i].cate)}</td>
                    <td>${Math.floor(data[i].score * 100000)/1000}%</td>
                    <td>${data[i].uid}</td>
                    <td>
                        <a href="${data[i].url}">点击打开</a><br/>`
                        + (isEditor ? `<button onclick='deleteDatum(event)' data-id=${data[i].ID}>点击删除</button>`:'')
                    + `</td>
                </tr>`
    }
    return tmp;
}

function categary(label) {
    switch(label) {
        case 'pulp':
            return '色情';
        default:
            return null;
    }
}

function dateTransform(date) {
    return `${date.getFullYear()}-${date.getMonth()<9 ? '0' + (date.getMonth()+1) : date.getMonth()+1}-${date.getDate()<10 ? '0' + date.getDate() : date.getDate()}`;
}

document.querySelector('#wa_filter_panel_submit').addEventListener('click', (e) => {
    PAGENUM = 0;
    genPostBody();
    fetch(APIHOST + '/getdata', postBody).then(e => e.json()).then(function(data) {
        let tmp = createTemplate(data);
        let ele = document.querySelector('#wa_home_tablelist');

        let theader = `<tr>
                    <th>序号</th>
                    <th>上传日期</th>
                    <th>截图</th>
                    <th>评测结果</th>
                    <th>置信度</th>
                    <th>来源</th>
                    <th>链接</th>
                </tr>`;
        ele.innerHTML = theader + tmp;
    });
})

function genPostBody() {
    let start = document.querySelector('#wa_filter_input_datetime_start').value;
    let end = document.querySelector('#wa_filter_input_datetime_end').value;
    let score = parseFloat(document.querySelector('#wa_filter_input_score_range').value);

    postBody.body = JSON.stringify({
        class: 'pulp',
        page: PAGENUM,
        startdate: start,
        enddate: end,
        score: [score, 1],
        cate: ['pulp']
    });
}

function deleteDatum(event) {
    console.log(event.target.dataset.id);
    postBody.body = JSON.stringify({
        id: event.target.dataset.id,
        table: 'pulp'
    });

    fetch(APIHOST + '/deletedatum', postBody).then(e => {
        console.log(e);
        event.target.parentElement.parentNode.remove();
    });
}