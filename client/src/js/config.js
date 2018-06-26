const APIHOST = 'http://0.0.0.0:3000';
// const APIHOST = '';

let isEditor = sessionStorage.isEditor == undefined ? false : (sessionStorage.isEditor == 'true' ? true : false);

if(sessionStorage.islogin == undefined || sessionStorage.islogin != 'true') {
    location.href = '/index.html';
} else {
    document.querySelector('section').removeAttribute('class');
}

// initiate navbar
let page = {
    home:           '综合信息平台',
    pulp:           '涉黄信息',
    terror:         '涉暴信息',
    terrordetect:   '涉暴信息(检测)',
    politician:     '涉政信息',
    custom:         '定制服务',
    check:          '内部审核'
};
let navbartmp = '';
for(let i in page) {
    navbartmp += `<a href="/${i}.html" ${location.pathname.indexOf(i+'.html')>0?'class="wa-home-nav-selected"':''} target="_self">${page[i]}</a>`;
}
document.querySelector("#wa_home_navbar").innerHTML = navbartmp;