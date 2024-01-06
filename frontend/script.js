function submit() {
    const inputElement1 = document.querySelector('.home-textinput.input');
    const inputElement2 = document.querySelector('.home-textinput1.input');

    const validateEmail = (email) => {
        return email.includes('@');
    };

    const setInputElementStyle = (element, isValid) => {
        element.style.border = isValid ? '0.5px solid #018080' : '0.5px solid red';
    };

    const clearInputElement = (element) => {
        element.value = '';
        element.placeholder = 'invalid email';
    };

    if (validateEmail(inputElement1.value) && validateEmail(inputElement2.value)) {
        setInputElementStyle(inputElement1, true);
        setInputElementStyle(inputElement2, true);

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
        }).then((result) => {
            if (result.isConfirmed) {
                var password = result.value;
                Swal.fire({
                    title: 'Hello, ' + password + '!',
                    text: 'Thank you!.',
                    customClass: {
                        popup: 'popup-class',
                        title: 'popup-title',
                        content: 'popup-content',
                        confirmButton: 'popup-confirm-button',
                        cancelButton: 'popup-cancel-button',
                    },
                });
            }
        });
    } else {
        setInputElementStyle(inputElement1, false);
        setInputElementStyle(inputElement2, false);
        clearInputElement(inputElement1);
        clearInputElement(inputElement2);
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