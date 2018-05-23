window.onload = function() {
    if(APIHOST == undefined) window.APIHOST = '';

    let conf = {
        min_score:  90,
        cate: [
            {key: "beheaded",       value: "恐怖分子／行刑斩首"},
            {key: "bomb",           value: "爆炸"},
            {key: "march",          value: "游行集会"},
            {key: "fight",          value: "打架斗殴"},
            {key: "guns",           value: "枪支"},
            {key: "islamic flag",   value: "伊斯兰"},
            {key: "knives",         value: "刀具"},
            {key: "isis",           value: "ISIS"},
            {key: "bloodiness",     value: "流血事件"}
        ],
        isSelector: true
    }

    terror = new filterTable(document.querySelector('section'),'terror',APIHOST,isEditor,conf);
    terror.init();
}