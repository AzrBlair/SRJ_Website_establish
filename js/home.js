// Function to fetch search suggestions dynamically as the user types
document.getElementById('searchQuery').addEventListener('input', function() {
    const query = this.value.trim();

    if (query.length > 0) {
        fetch(`/api/search?query=${encodeURIComponent(query)}`)
            .then(response => {
                if (!response.ok) {  // Check if the response status is OK (200)
                    throw new Error(`Error: ${response.statusText}`);
                }
                return response.json();  // Try to parse JSON response
            })
            .then(data => {
                if (Array.isArray(data) && data.length > 0) {
                    displaySuggestions(data);
                } else {
                    clearSuggestions();  // Clear suggestions if none are found
                }
            })
            .catch(error => {
                console.error('Error:', error);
                clearSuggestions();  // Clear suggestions on error
            });
    } else {
        clearSuggestions();  // Clear suggestions if the input is empty
    }
});

// Function to display search suggestions in real time
function displaySuggestions(data) {
    const suggestionsDiv = document.getElementById('suggestions');
    suggestionsDiv.innerHTML = '';  // Clear previous suggestions

    data.forEach(result => {
        const suggestion = document.createElement('div');
        suggestion.classList.add('suggestion-item');
        suggestion.innerText = result.make_brand;  // Assuming 'make_brand' is the suggestion text
        suggestion.addEventListener('click', function() {
            // Redirect to search result page with the selected make
            window.location.href = `search_result.html?query=${encodeURIComponent(result.make_brand)}`;
        });
        suggestionsDiv.appendChild(suggestion);
    });

    suggestionsDiv.style.display = 'block';  // Show suggestions
}

// Function to clear suggestions
function clearSuggestions() {
    const suggestionsDiv = document.getElementById('suggestions');
    suggestionsDiv.innerHTML = '';
    suggestionsDiv.style.display = 'none';  // Hide suggestions
}

// Handle form submission to go to the search result page
document.getElementById('searchForm').addEventListener('submit', function(event) {
    event.preventDefault();  // Prevent form submission

    const query = document.getElementById('searchQuery').value.trim();
    if (query.length > 0) {
        window.location.href = `search_result.html?query=${encodeURIComponent(query)}`;
    }
});


document.addEventListener('DOMContentLoaded', function() {
    const gifLinks = document.querySelectorAll('.gif-link');
    const popups = document.querySelectorAll('.video-popup');
    const closeButtons = document.querySelectorAll('.close');

    gifLinks.forEach(link => {
        link.addEventListener('click', function(event) {
            event.preventDefault();
            const target = this.getAttribute('href');
            const popup = document.querySelector(target);
            popup.style.display = 'flex';

            // Start video playback when pop-up is shown
            const video = popup.querySelector('video');
            video.play();
        });
    });

    closeButtons.forEach(button => {
        button.addEventListener('click', function() {
            const popup = this.closest('.video-popup');
            popup.style.display = 'none';

            // Pause video playback when pop-up is closed
            const video = popup.querySelector('video');
            video.pause();
        });
    });

    window.addEventListener('click', function(event) {
        popups.forEach(popup => {
            if (event.target == popup) {
                popup.style.display = 'none';

                // Pause video playback when clicking outside the video
                const video = popup.querySelector('video');
                video.pause();
            }
        });
    });
});