// Function to fetch unique Machine Makes when the Machine Make dropdown is clicked
document.getElementById('makeDropdownButton').addEventListener('click', function() {
    fetchUniqueValues('MMake', 'makeSuggestions');
});

// Function to fetch all Machine Models when the Machine Model dropdown is clicked
document.getElementById('modelDropdownButton').addEventListener('click', function() {
    fetchUniqueValues('MModel', 'modelSuggestions');
});

// Function to fetch unique values from the database based on the field (MMake or MModel)
function fetchUniqueValues(field, suggestionsDivId) {
    fetch(`/api/search?field=${field}`)
        .then(response => {
            if (!response.ok) throw new Error(`Failed to fetch ${field}`);
            return response.json();
        })
        .then(data => displaySuggestions(data, suggestionsDivId, field))
        .catch(error => console.error('Error fetching suggestions:', error));
}

// Function to display unique values as suggestions
function displaySuggestions(data, suggestionsDivId, field) {
    const suggestionsDiv = document.getElementById(suggestionsDivId);
    suggestionsDiv.innerHTML = '';  // Clear previous suggestions

    if (data.length === 0) {
        // If no suggestions are found, hide the suggestions div
        suggestionsDiv.style.display = 'none';
        return;
    }

    // Populate suggestions dropdown
    data.forEach(item => {
        const suggestion = document.createElement('div');
        suggestion.classList.add('suggestion-item');
        suggestion.innerText = item[field];
        suggestion.addEventListener('click', function() {
            // Set the input value to the selected suggestion
            document.getElementById(field === 'MMake' ? 'makeSearchQuery' : 'modelSearchQuery').value = item[field];
            suggestionsDiv.style.display = 'none'; // Hide suggestions on selection
        });
        suggestionsDiv.appendChild(suggestion);
    });

    // Show the suggestions dropdown
    suggestionsDiv.style.display = 'block';
}

// Handle main search button click
document.getElementById('mainSearchButton').addEventListener('click', function() {
    const makeQuery = document.getElementById('makeSearchQuery').value.trim();
    const modelQuery = document.getElementById('modelSearchQuery').value.trim();

    // Redirect to search result based on the provided input
    if (makeQuery) {
        window.location.href = `search_result.html?make=${encodeURIComponent(makeQuery)}`;
    } else if (modelQuery) {
        window.location.href = `search_result.html?model=${encodeURIComponent(modelQuery)}`;
    } else {
        alert('Please enter a Machine Make or Machine Model to search.');
    }
});

// Hide suggestions when clicking outside of the search bar
document.addEventListener('click', function(event) {
    if (!event.target.closest('.search-bar')) {
        document.getElementById('makeSuggestions').style.display = 'none';
        document.getElementById('modelSuggestions').style.display = 'none';
    }
});

/////////////git for video click

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