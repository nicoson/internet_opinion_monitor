window.onload = function() {
    if(APIHOST == undefined) window.APIHOST = '';

    let conf = {
        min_score:  90,
        cate: [
            {key: "guns",           value: "枪支"},
            {key: "islamic flag",   value: "伊斯兰"},
            {key: "knives",         value: "刀具"},
            {key: "isis",           value: "ISIS"},
            {key: "bloodiness",     value: "流血事件"}
        ],
        isSelector: true
    }

    let terror = new filterTable(document.querySelector('section'),'detection',APIHOST,isEditor,conf);
    terror.init();
}