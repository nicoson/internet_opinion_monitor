window.onload = function() {
    if(APIHOST == undefined) window.APIHOST = '';
    

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