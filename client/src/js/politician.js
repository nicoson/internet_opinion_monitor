window.onload = function() {
    APIHOST = (typeof(APIHOST) == 'undefined') ? '' : APIHOST;

    let conf = {
        min_score:  90,
        cate: [],
        isSelector: false
    }

    let politician = new filterTable(document.querySelector('section'),'politician',APIHOST,isEditor,conf);
    politician.init();
}
