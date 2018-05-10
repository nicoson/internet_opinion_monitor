let isEditor = sessionStorage.isEditor == undefined ? false : (sessionStorage.isEditor == 'true' ? true : false);

if(sessionStorage.islogin == undefined || sessionStorage.islogin != 'true') {
    location.href = '/index.html';
} else {
    document.querySelector('section').removeAttribute('class');
}

window.onload = function() {
    if(APIHOST == undefined) window.APIHOST = '';

    let conf = {
        min_score:  90,
        cate: [{key: "pulp", value: "色情淫秽"}],
        isSelector: true
    }

    let pulp = new filterTable(document.querySelector('section'),'pulp',APIHOST,isEditor,conf);
    pulp.init();
}