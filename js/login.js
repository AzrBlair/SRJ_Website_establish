// Login form submission
document.getElementById('loginForm').addEventListener('submit', function(event) {
    event.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    // Send login request by POST to the server
    fetch('/api/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            localStorage.setItem('userId', data.userId); // Store user ID
            window.location.href = 'customer_p.html'; // Redirect to customer portal
        } else {
            document.getElementById('error-message').innerText = data.message;
        }
    })
    .catch(error => {
        console.error('Error:', error);
    });
});

// Sign Up Modal handling
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

    if (newPassword !== confirmPassword) {
        document.getElementById('signUpErrorMessage').innerText = 'Passwords do not match';
        return;
    }

    // Send sign-up request by POST to the server
    fetch('/api/signup', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ newUsername, newPassword }),
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            // Show success message and countdown
            const successMessage = document.getElementById('successMessage');
            successMessage.innerText = 'Sign up successful! Redirecting to customer portal in 3 seconds...';
            document.getElementById('successModal').style.display = 'block';

            // Redirect after 3 seconds
            setTimeout(() => {
                window.location.href = 'customer_p.html'; // Redirect to customer portal
            }, 3000);
        } else {
            document.getElementById('signUpErrorMessage').innerText = data.message;
        }
    })
    .catch(error => {
        console.error('Error:', error);
    });
});