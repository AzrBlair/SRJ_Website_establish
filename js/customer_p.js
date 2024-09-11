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

    // Set the default tab open for "Quote" if you want
    if (document.getElementById('quote').style.display === 'block') {
        document.getElementById('create').style.display = 'block';  // Show default tab content
    }
});

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

// Default tab open
document.getElementsByClassName("tablinks")[0].click();

function showQuoteDetails(type, id) {
    var detailsBox = document.getElementById("quote-details");
    detailsBox.innerHTML = `<h3>${type.charAt(0).toUpperCase() + type.slice(1)} Quote #${id} Details</h3>
                            <p>Details about ${type} quote #${id} will be displayed here.</p>`;
}

document.getElementById("createQuoteButton").addEventListener("click", function() {
    openTab(event, 'quote-draft');
    document.getElementById("new-quote-box").style.display = "block";
});