window.onload = function() {
    if(APIHOST == undefined) window.APIHOST = '';
    refreshList();

    let conf = {
        min_score:  90,
        cate: [{key: "pulp", value: "色情淫秽"}],
        isSelector: true
    }

    let pulp = new filterTable(document.querySelector('#wa_custom_detail_list_container'),'pulp',APIHOST,isEditor,conf);
    pulp.init();
}

function refreshList(data) {
    let tmp = `<tr>
            <th>任务ID</th>
            <th>任务名称</th>
            <th>创建时间</th>
            <th>检测范围</th>
            <th>关键词</th>
            <th>检测类型</th>
            <th>任务状态</th>
            <th>预警</th>
            <th>察看结果</th>
            <th>操作</th>
        </tr>`;
    if(data != undefined) {
        tmp = fillTable(tmp,data);
        document.querySelector('#wa_custom_job_table').innerHTML = tmp;
    } else {
        fetch(APIHOST + '/getjobs').then(e => e.json()).then(data => {
            tmp = fillTable(tmp,data);
            document.querySelector('#wa_custom_job_table').innerHTML = tmp;
            addTableEvent();
        });
    }
}

function fillTable(tmp,data) {
    data.map(datum => {
        tmp += `<tr>
                    <td>${datum.id}</td>
                    <td>${datum.taskname}</td>
                    <td>${datum.created.slice(0,-5).replace('T',' ')}</td>
                    <td>${datum.target}</td>
                    <td>${datum.keywords}</td>
                    <td>${datum.func}</td>
                    <td>${'运行中'}</td>
                    <td>${'30'}</td>
                    <td class="wa-custom-job-table-link" data-id="${datum.id}">${Math.round(Math.random()*100)}</td>
                    <td><button>启动</button><button>删除</button></td>
                </tr>`
    });
    return tmp;
}

function addTableEvent() {
    document.querySelectorAll('#wa_custom_job_table td.wa-custom-job-table-link').forEach(e => {
        e.addEventListener('click', e => {
            console.log(e.target.dataset.id);
            document.querySelector('#wa_custom_frontpage').setAttribute('class', 'wa-hidden');
            document.querySelector('#wa_custom_setpage').setAttribute('class', 'wa-hidden');
            document.querySelector('#wa_custom_detailpage').removeAttribute('class');
        });
    });
}

document.querySelector('#wa_custom_addjob').addEventListener('click', function(e) {
    document.querySelector('#wa_custom_frontpage').setAttribute('class', 'wa-hidden');
    document.querySelector('#wa_custom_setpage').removeAttribute('class');
    document.querySelector('#wa_custom_detailpage').setAttribute('class', 'wa-hidden');
});

document.querySelector('#wa_custom_set_back').addEventListener('click', function(e) {
    document.querySelector('#wa_custom_frontpage').removeAttribute('class');
    document.querySelector('#wa_custom_setpage').setAttribute('class', 'wa-hidden');
    document.querySelector('#wa_custom_detailpage').setAttribute('class', 'wa-hidden');
});

document.querySelector('#wa_custom_detail_back').addEventListener('click', function(e) {
    document.querySelector('#wa_custom_frontpage').removeAttribute('class');
    document.querySelector('#wa_custom_setpage').setAttribute('class', 'wa-hidden');
    document.querySelector('#wa_custom_detailpage').setAttribute('class', 'wa-hidden');
});

document.querySelector('#wa_custom_set_cancel').addEventListener('click', function(e) {
    document.querySelector('#wa_custom_frontpage').removeAttribute('class');
    document.querySelector('#wa_custom_setpage').setAttribute('class', 'wa-hidden');
    document.querySelector('#wa_custom_detailpage').setAttribute('class', 'wa-hidden');
});

document.querySelector('#wa_custom_set_submit').addEventListener('click', function(e) {
    let job = {};
    job.taskname = document.querySelector('#wa_custom_set_taskname').value;
    job.created = new Date();
    job.target = document.querySelector('#wa_custom_set_target input:checked').dataset.target;
    job.keywords = document.querySelector('#wa_custom_set_keyword_input').value;
    job.func = [];
    let inputbox = document.querySelectorAll('#wa_custom_set_func input:checked');
    for(let i=0; i<inputbox.length; i++) {
        job.func.push(inputbox[i].dataset.cate);
    }
    job.period = document.querySelectorAll('#wa_custom_set_settings select')[0].value;
    job.expire = document.querySelectorAll('#wa_custom_set_settings select')[1].value;
    job.trace = document.querySelectorAll('#wa_custom_set_settings select')[2].value;
    job.type = document.querySelectorAll('#wa_custom_set_settings select')[3].value;

    console.log(job);

    let headers = new Headers();
    headers.append('Content-Type', 'application/json');
    let postBody = {
        method: 'POST',
        headers: headers,
        body: JSON.stringify({
            job: job
        })
    };
    fetch(APIHOST + '/newjob', postBody).then(e => e.json()).then(data => {
        console.log(data);
        refreshList(data);
    });
});