window.onload = function() {
    APIHOST = (typeof(APIHOST) == 'undefined') ? '' : APIHOST;

    let conf = {
        min_score:  90,
        cate: [{key: "pulp", value: "色情淫秽"}],
        isSelector: true
    }

    let pulp = new filterTable(document.querySelector('section'),'pulp',APIHOST,isEditor,conf);
    pulp.init();
}