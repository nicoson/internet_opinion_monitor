class filterTable {
    constructor(ele,table,APIHOST,isEditor,conf) {
        this.mainEle = ele;
        this.table = table;
        this.PAGENUM = 0;
        this.APIHOST = APIHOST;
        this.isEditor = isEditor;
        this.conf = conf;
        this.sort = 'created_date';
        this.order = 'desc';
        this.isScroll = true;
        // let yesterday = new Date();
        // yesterday = yesterday.setDate(yesterday.getDate() - 1);
        this.headers = new Headers();
        this.headers.append('Content-Type', 'application/json');
        this.postBody = {
            method: 'POST',
            headers: this.headers,
            body: JSON.stringify(
                {
                    class: this.table,
                    page: this.PAGENUM,
                    startdate: this.dateTransform(new Date()),
                    enddate: this.dateTransform(new Date()),
                    score: [0.9, 1],
                    cate: null
                }
            )
        }
    }

    init() {
        this.initTemplate();
        let yesterday = new Date();
        yesterday = yesterday.setDate(yesterday.getDate() - 10);
        document.querySelector('#wa_filter_input_datetime_end').value = this.dateTransform(new Date());
        document.querySelector('#wa_filter_input_datetime_start').value = this.dateTransform(new Date(yesterday));
    
        this.postBody.body = JSON.stringify(
            {
                class: this.table,
                page: this.PAGENUM,
                startdate: this.dateTransform(new Date(yesterday)),
                enddate: this.dateTransform(new Date()),
                score: [0.9, 1],
                cate: null,
                sort: this.sort,
                order: this.order
            }
        );
    
        fetch(this.APIHOST + '/getdata', this.postBody).then(e => e.json()).then(function(data) {
            let ele = document.querySelector('#wa_home_tablelist');
        
            let theader = `<tr>
                            <th>序号</th>
                            <th ${this.sort=='created_date' ? (this.order == 'desc'?'class="wa-filter-header-desc"':'class="wa-filter-header-asc"'):''} data-order="created_date">上传日期</th>
                            <th>截图</th>
                            <th ${this.sort=='cate' ? (this.order == 'desc'?'class="wa-filter-header-desc"':'class="wa-filter-header-asc"'):''} data-order="cate">评测结果</th>
                            <th ${this.sort=='score' ? (this.order == 'desc'?'class="wa-filter-header-desc"':'class="wa-filter-header-asc"'):''} data-order="score">置信度</th>
                            <th ${this.sort=='uid' ? (this.order == 'desc'?'class="wa-filter-header-desc"':'class="wa-filter-header-asc"'):''} data-order="uid">来源</th>
                            <th ${this.sort=='ip' ? (this.order == 'desc'?'class="wa-filter-header-desc"':'class="wa-filter-header-asc"'):''} data-order="ip">IP</th>
                            <th>链接</th>
                        </tr>`;
        
            let tmp = this.createTemplate(data);
            this.PAGENUM++;
            ele.innerHTML = theader + tmp;
            this.addDynamicEvents();
        }.bind(this));

        this.addEvents();
    }

    initTemplate() {
        let option = this.conf.cate.map(e => {
            return `<option value="${e.key}">${e.value}</option>`;
        });
        let tmp = `<div id="wa_filter_panel">
                <fieldset>
                    <legend>日期范围:</legend>
                    <div>从<input id="wa_filter_input_datetime_start" type="date" /></div><br/>
                    <div>到<input id="wa_filter_input_datetime_end" type="date" /></div>
                </fieldset>
                <fieldset>
                    <legend>置信区间:</legend>
                    <form id="wa_filter_input_score_range_form" oninput="wa_range_score.value=parseFloat(wa_range_choose.value)*100">
                        <output for="wa_filter_input_score_range" name='wa_range_score' value="${this.conf.min_score}">${this.conf.min_score}</output>% - 100%
                        <div>
                            ${this.conf.min_score}%<input id="wa_filter_input_score_range" name="wa_range_choose" type="range" min="${this.conf.min_score/100}" max="1" step="0.01" value="${this.conf.min_score/100}" ／>100%
                        </div>
                    </form>
                </fieldset>
                <fieldset>
                    <legend>结果类别:</legend>` +
                    (this.conf.isSelector ? `
                    <select id="wa_filter_cate">
                    <option value="all" selected>全部</option>
                        ${option.join('')}
                    </select>` : `
                    <input id="wa_filter_cate" type="search" />`) +
                `</fieldset>
                <button id="wa_filter_panel_submit" class="wa-btn-success">筛选</button>
            </div>
            <table id="wa_home_tablelist"></table>`;
        this.mainEle.innerHTML = tmp;
    }

    createTemplate(data) {
        let tmp = '';
        for(let i=0; i< data.length; i++) {
            let time = new Date(data[i].created_date);
            tmp +=  `<tr>
                        <td>${this.PAGENUM*50 + i + 1}</td>
                        <td>${this.dateTransform(time)} ${time.getHours()>9?time.getHours():'0'+time.getHours()}:${time.getMinutes()>9?time.getMinutes():'0'+time.getMinutes()}:${time.getSeconds()>9?time.getSeconds():'0'+time.getSeconds()}</td>
                        <td><a href="${data[i].url}"><img src="${data[i].url}" alt=""></a></td>
                        <td>${this.categary(data[i].cate)}</td>
                        <td>${Math.floor(data[i].score * 100000)/1000}%</td>
                        <td>${data[i].uid}</td>
                        <td>${data[i].ip}</td>
                        <td>
                            <a href="${data[i].url}">点击打开</a><br/>`
                            + (this.isEditor ? `<button data-id=${data[i].ID}>点击删除</button>`:'')
                        + `</td>
                    </tr>`
        }
        return tmp;
    }

    addEvents() {
        this.mainEle.addEventListener('scroll', function(e) {
            if(this.isScroll && e.target.scrollHeight - e.target.scrollTop - e.target.clientHeight < 200) {
                console.log('loading ...');
                this.isScroll = false;
        
                this.PAGENUM++;
                this.genPostBody();
                fetch(this.APIHOST + '/getdata', this.postBody).then(e => e.json()).then(function(data) {
                    let tmp = this.createTemplate(data);
                    let ele = document.querySelector('#wa_home_tablelist');
                    ele.innerHTML += tmp;
                    this.isScroll = true;
                    this.addDynamicEvents();
                }.bind(this));
            }
        }.bind(this));

        document.querySelector('#wa_filter_panel_submit').addEventListener('click', (e) => {
            this.PAGENUM = 0;
            this.genPostBody();
            fetch(this.APIHOST + '/getdata', this.postBody).then(e => e.json()).then(function(data) {
                let tmp = this.createTemplate(data);
                let ele = document.querySelector('#wa_home_tablelist');
        
                let theader = `<tr>
                                <th>序号</th>
                                <th ${this.sort=='created_date' ? (this.order == 'desc'?'class="wa-filter-header-desc"':'class="wa-filter-header-asc"'):''} data-order="created_date">上传日期</th>
                                <th>截图</th>
                                <th ${this.sort=='cate' ? (this.order == 'desc'?'class="wa-filter-header-desc"':'class="wa-filter-header-asc"'):''} data-order="cate">评测结果</th>
                                <th ${this.sort=='score' ? (this.order == 'desc'?'class="wa-filter-header-desc"':'class="wa-filter-header-asc"'):''} data-order="score">置信度</th>
                                <th ${this.sort=='uid' ? (this.order == 'desc'?'class="wa-filter-header-desc"':'class="wa-filter-header-asc"'):''} data-order="uid">来源</th>
                                <th ${this.sort=='ip' ? (this.order == 'desc'?'class="wa-filter-header-desc"':'class="wa-filter-header-asc"'):''} data-order="ip">IP</th>
                                <th>链接</th>
                            </tr>`;
                ele.innerHTML = theader + tmp;
                this.addDynamicEvents();
            }.bind(this));
        })
    }

    addDynamicEvents() {
        document.querySelectorAll('#wa_home_tablelist td button').forEach(ele => {
            ele.addEventListener('click', (event) => {
                this.deleteDatum(event);
            })
        });

        document.querySelectorAll('#wa_home_tablelist th').forEach(ele => {
            ele.addEventListener('click', (event) => {
                console.log(event.target.dataset.order);
                if(event.target.dataset.order == undefined) {
                    return;
                } else {
                    this.sort = event.target.dataset.order;
                }

                if(event.target.getAttribute('class') == null) {
                    document.querySelectorAll('#wa_home_tablelist th').forEach(e => {
                        e.removeAttribute('class');
                    });
                    event.target.setAttribute('class', 'wa-filter-header-desc');
                    this.order = 'desc';
                } else if(event.target.getAttribute('class') == 'wa-filter-header-desc') {
                    document.querySelectorAll('#wa_home_tablelist th').forEach(e => {
                        e.removeAttribute('class');
                    });
                    event.target.setAttribute('class', 'wa-filter-header-asc');
                    this.order = 'asc';
                } else {
                    event.target.removeAttribute('class');
                    this.sort = 'created_date';
                    this.order = 'desc';
                }
                document.querySelector('#wa_filter_panel_submit').click();
            })
        });
    }

    genPostBody() {
        let start = document.querySelector('#wa_filter_input_datetime_start').value;
        let end = document.querySelector('#wa_filter_input_datetime_end').value;
        let score = parseFloat(document.querySelector('#wa_filter_input_score_range').value);
        let cate = document.querySelector('#wa_filter_cate').value;
    
        this.postBody.body = JSON.stringify({
            class: this.table,
            page: this.PAGENUM,
            startdate: start,
            enddate: end,
            score: [score, 1],
            cate: cate == 'all' || cate == '' ? null : cate,
            sort: this.sort,
            order: this.order
        });
    }

    deleteDatum(event) {
        console.log(event.target.dataset.id);
        this.postBody.body = JSON.stringify({
            id: event.target.dataset.id,
            table: this.table
        });
    
        fetch(this.APIHOST + '/deletedatum', this.postBody).then(e => {
            console.log(e);
            event.target.parentElement.parentNode.remove();
        });
    }

    dateTransform(date) {
        return `${date.getFullYear()}-${date.getMonth()<9 ? '0' + (date.getMonth()+1) : date.getMonth()+1}-${date.getDate()<10 ? '0' + date.getDate() : date.getDate()}`;
    }

    categary(label) {
        switch(label) {
            case 'pulp':
                return '色情';
            case 'beheaded':
                return '恐怖分子／行刑斩首';
            case 'bomb':
                return '爆炸';
            case 'march':
                return '游行集会';
            case 'fight':
                return '打架斗殴';
            case 'guns':
                return '枪支';
            case 'islamic flag':
                return '伊斯兰';
            case 'knives':
                return '刀具';
            case 'isis flag':
                return 'ISIS';
            case 'bloodiness':
                return '流血事件';
            default:
                return label;
        }
    }
}