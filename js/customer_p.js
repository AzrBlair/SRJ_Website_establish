document.addEventListener('DOMContentLoaded', function() {
    const sections = document.querySelectorAll('main > section');
    const tabContents = document.querySelectorAll('.tabcontent');

    // Function to show a section and hide others
    function showSection(id) {
        sections.forEach(section => section.style.display = section.id === id ? 'block' : 'none');
    }

    // Function to open a tab within a section
    function openTab(evt, tabName) {
        tabContents.forEach(content => content.style.display = 'none');
        document.getElementById(tabName).style.display = 'block';
        evt.currentTarget.className += ' active';
    }

    // Add click event listeners to the main menu items
    const menuItems = document.querySelectorAll('.sidebar ul li a');
    menuItems.forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href').substring(1);
            showSection(targetId);
        });
    });

    // Show the first section (Dashboard) by default
    showSection('dashboard');

    // Fetch customer info when the page loads
    const userId = localStorage.getItem('userId'); // Get the user ID from local storage

    if (userId) {
        fetch(`/api/customer-info/${userId}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => {
                if (data.success === false) {
                    document.getElementById('infoDisplay').innerText = data.message;
                } else {
                    // Display the customer info
                    const infoDisplay = document.getElementById('infoDisplay');
                    infoDisplay.innerHTML = `
                        <p>Name: ${data.name}</p>
                        <p>Email: ${data.email}</p>
                        <p>Phone: ${data.phone}</p>
                        <p>Address: ${data.address}</p>
                    `;
                }
            })
            .catch(error => {
                console.error('Error fetching customer info:', error);
                document.getElementById('infoDisplay').innerText = 'Error fetching customer info.';
            });
    } else {
        document.getElementById('infoDisplay').innerText = 'No user ID found.';
    }
});

// Additional functionality for tabs and other UI interactions can be added below
function openTab(evt, tabName) {
    var i, tabcontent, tablinks;
    
    // Hide all tab content
    tabcontent = document.getElementsByClassName("tabcontent");
    for (i = 0; i < tabcontent.length; i++) {
        tabcontent[i].style.display = "none";
    }
    
    // Remove the active class from all buttons
    tablinks = document.getElementsByClassName("tablinks");
    for (i = 0; i < tablinks.length; i++) {
        tablinks[i].className = tablinks[i].className.replace(" active", "");
    }
    
    // Show the current tab and add an active class to the button that opened it
    document.getElementById(tabName).style.display = "block";
    evt.currentTarget.className += " active";
}