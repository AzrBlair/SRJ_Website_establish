// Login form submission
document.getElementById('loginForm').addEventListener('submit', function(event) {
    event.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const loginType = document.getElementById('loginType').value;

    // Send login request by POST to the server, specifying the login type
    fetch('/api/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password, loginType }),
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            if (loginType === 'customer') {
                window.location.href = 'customer_p.html';
            } else if (loginType === 'vendor') {
                window.location.href = 'vendor_p.html';
            }
        } else {
            document.getElementById('error-message').innerText = data.message;
        }
    })
    .catch(error => {
        console.error('Error:', error);
    });
});

// Change login type and update the login form title accordingly
document.getElementById('loginType').addEventListener('change', function() {
    const loginType = this.value;
    const loginTitle = document.querySelector('.login-container h2');
    if (loginType === 'customer') {
        loginTitle.innerText = 'Customer Login';
    } else if (loginType === 'vendor') {
        loginTitle.innerText = 'Vendor Login';
    }
});

// Sign Up Modal
const signUpButton = document.getElementById('signUpButton');
const signUpModal = document.getElementById('signUpModal');
const signUpClose = document.querySelector('#signUpModal .close');

signUpButton.addEventListener('click', function() {
    signUpModal.style.display = 'block';
});

signUpClose.addEventListener('click', function() {
    signUpModal.style.display = 'none';
});

// Handle sign-up form submission
document.getElementById('signUpForm').addEventListener('submit', function(event) {
    event.preventDefault();
    const newUsername = document.getElementById('newUsername').value;
    const newPassword = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    const loginType = document.getElementById('loginType').value;  // Use the selected login type for sign-up

    if (newPassword !== confirmPassword) {
        document.getElementById('signUpErrorMessage').innerText = 'Passwords do not match';
        return;
    }

    // Send sign-up request by POST to the server, specifying the user type
    fetch('/api/signup', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ newUsername, newPassword, loginType }),
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            signUpModal.style.display = 'none';
            document.getElementById('successModal').style.display = 'block';
        } else {
            document.getElementById('signUpErrorMessage').innerText = data.message;
        }
    })
    .catch(error => {
        console.error('Error:', error);
    });
});

// Password matching validation
const newPasswordInput = document.getElementById('newPassword');
const confirmPasswordInput = document.getElementById('confirmPassword');
const signUpErrorMessage = document.getElementById('signUpErrorMessage');

newPasswordInput.addEventListener('input', checkPasswords);
confirmPasswordInput.addEventListener('input', checkPasswords);

function checkPasswords() {
    if (newPasswordInput.value === confirmPasswordInput.value) {
        signUpErrorMessage.innerText = '';
    } else {
        signUpErrorMessage.innerText = 'Passwords do not match';
    }
}

// Success Modal handling
const successModal = document.getElementById('successModal');
const successClose = document.querySelector('#successModal .close');

successClose.addEventListener('click', function() {
    successModal.style.display = 'none';
});

window.addEventListener('click', function(event) {
    if (event.target === successModal) {
        successModal.style.display = 'none';
    }
});