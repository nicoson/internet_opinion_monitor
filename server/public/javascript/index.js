document.querySelector('#wa_login_submit').addEventListener('click', function(e) {
    // if(document.querySelector('#wa_login_username').value.trim().length != 0 && document.querySelector('#wa_login_psd').value.trim().length != 0) {
    if(document.querySelector('#wa_login_username').value.trim() == 'admin' 
    && document.querySelector('#wa_login_psd').value.trim() == 'admin') {
        sessionStorage.setItem('islogin','true');
        sessionStorage.setItem('isEditor', 'false');
        location.href = '/home.html';
    } else if(document.querySelector('#wa_login_username').value.trim() == 'editor' 
    && document.querySelector('#wa_login_psd').value.trim() == 'editor') {
        sessionStorage.setItem('islogin','true');
        sessionStorage.setItem('isEditor', 'true');
        location.href = '/home.html';
    } else {
        document.querySelector('#wa_login_alert').removeAttribute('class');
    }
});