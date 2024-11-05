// Fetch suggestions for Machine Make
document.getElementById('makeSearchQuery').addEventListener('input', function() {
    fetchSuggestions(this.value, 'MMake', 'makeSuggestions');
});

// Fetch suggestions for Machine Model
document.getElementById('modelSearchQuery').addEventListener('input', function() {
    fetchSuggestions(this.value, 'MModel', 'modelSuggestions');
});

// Handle dropdown button click for Machine Make
document.getElementById('makeDropdownButton').addEventListener('click', function() {
    fetchSuggestions('', 'MMake', 'makeSuggestions'); // Empty string to fetch all makes
});

// Handle dropdown button click for Machine Model
document.getElementById('modelDropdownButton').addEventListener('click', function() {
    fetchSuggestions('', 'MModel', 'modelSuggestions'); // Empty string to fetch all models
});

// Fetch suggestions from the database
function fetchSuggestions(query, field, suggestionsDivId) {
    fetch(`/api/search?field=${field}&query=${encodeURIComponent(query)}`)
        .then(response => response.json())
        .then(data => displaySuggestions(data, suggestionsDivId, field))
        .catch(error => console.error('Error:', error));
}

// Display suggestions for either Machine Make or Machine Model
function displaySuggestions(data, suggestionsDivId, field) {
    const suggestionsDiv = document.getElementById(suggestionsDivId);
    suggestionsDiv.innerHTML = '';  // Clear previous suggestions

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

    suggestionsDiv.style.display = 'block'; // Show suggestions
}

// Hide suggestions when clicking outside of the search bar
document.addEventListener('click', function(event) {
    if (!event.target.closest('.search-bar')) {
        document.getElementById('makeSuggestions').style.display = 'none';
        document.getElementById('modelSuggestions').style.display = 'none';
    }
});