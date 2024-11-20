document.addEventListener('DOMContentLoaded', () => {
    const makeDropdown = document.getElementById('makeDropdown');
    const modelDropdown = document.getElementById('modelDropdown');
    const makeSuggestions = document.getElementById('makeSuggestions');
    const modelSuggestions = document.getElementById('modelSuggestions');
    const sizeList = document.getElementById('sizeList');

    // Parse URL parameters for initial search
    const urlParams = new URLSearchParams(window.location.search);
    const initialMake = urlParams.get('make');
    const initialModel = urlParams.get('model');

    // If a make and/or model are provided, display results immediately
    if (initialMake) {
        makeDropdown.value = initialMake;
        if (initialModel) {
            modelDropdown.value = initialModel;
            fetchSizes(initialMake, initialModel);
        } else {
            fetchModels(initialMake);
        }
    }

    // Set up event listeners for the dropdown focus and input
    makeDropdown.addEventListener('focus', () => {
        fetchSuggestions(makeDropdown.value, 'MMake', makeSuggestions);
        setPosition(makeSuggestions, makeDropdown);
        makeSuggestions.style.display = 'block';
    });

    modelDropdown.addEventListener('focus', () => {
        if (makeDropdown.value) {
            fetchSuggestions(modelDropdown.value, 'MModel', modelSuggestions, makeDropdown.value);
            setPosition(modelSuggestions, modelDropdown);
            modelSuggestions.style.display = 'block';
        }
    });

    // Fetch suggestions for make when typing
    makeDropdown.addEventListener('input', () => {
        fetchSuggestions(makeDropdown.value, 'MMake', makeSuggestions);
        setPosition(makeSuggestions, makeDropdown);
        makeSuggestions.style.display = 'block';
    });

    // Fetch suggestions for model when typing
    modelDropdown.addEventListener('input', () => {
        if (makeDropdown.value) {
            fetchSuggestions(modelDropdown.value, 'MModel', modelSuggestions, makeDropdown.value);
            setPosition(modelSuggestions, modelDropdown);
            modelSuggestions.style.display = 'block';
        }
    });

    // Update size list dynamically based on make and model selections
    makeDropdown.addEventListener('change', handleMakeModelChange);
    modelDropdown.addEventListener('change', handleMakeModelChange);

    function handleMakeModelChange() {
        const selectedMake = makeDropdown.value;
        const selectedModel = modelDropdown.value;

        if (selectedMake && selectedModel) {
            fetchSizes(selectedMake, selectedModel);
        } else if (selectedMake) {
            fetchModels(selectedMake);
        }
    }

    // Toggle suggestions dropdown visibility
    window.toggleSuggestions = function(suggestionsDivId, inputElement) {
        const suggestionsDiv = document.getElementById(suggestionsDivId);
        if (suggestionsDiv.style.display === 'block') {
            suggestionsDiv.style.display = 'none';
        } else {
            fetchSuggestions(inputElement.value, inputElement.id === 'makeDropdown' ? 'MMake' : 'MModel', suggestionsDiv);
            setPosition(suggestionsDiv, inputElement);
            suggestionsDiv.style.display = 'block';
        }
    }

    // Fetch models for a specific make
    function fetchModels(make) {
        sizeList.innerHTML = '';
        fetch(`/api/models?make=${encodeURIComponent(make)}`)
            .then(response => response.json())
            .then(data => displayModels(data))
            .catch(error => console.error('Error fetching models:', error));
    }

    // Display all models in a dropdown-like structure
    function displayModels(models) {
        modelSuggestions.innerHTML = '';
        models.forEach((item) => {
            const modelItem = document.createElement('div');
            modelItem.classList.add('suggestion-item');
            modelItem.innerText = item.model;
            modelItem.addEventListener('click', () => {
                fetchSizes(makeDropdown.value, item.model);
                modelDropdown.value = item.model;
                modelSuggestions.style.display = 'none';
            });
            modelSuggestions.appendChild(modelItem);
        });
        modelSuggestions.style.display = 'block';
    }

    // Fetch sizes for a specific make and model
    function fetchSizes(make, model) {
        sizeList.innerHTML = '';
        fetch(`/api/sizes?make=${encodeURIComponent(make)}&model=${encodeURIComponent(model)}`)
            .then(response => response.json())
            .then(data => displaySizes(data))
            .catch(error => console.error('Error fetching sizes:', error));
    }

    // Display sizes in the right section
    function displaySizes(sizes) {
        sizeList.innerHTML = '';
        if (sizes.length === 0) {
            sizeList.innerHTML = '<p>No sizes available for the selected model.</p>';
        } else {
            sizes.forEach((item) => {
                const sizeItem = document.createElement('div');
                sizeItem.classList.add('size-item');
    
                const sizeText = document.createElement('div');
                sizeText.classList.add('size-text');
                sizeText.innerText = item.size;
    
                const sizeImg = document.createElement('div');
                sizeImg.classList.add('size-img');
                sizeImg.innerText = 'img'; // Placeholder for image
    
                // Make size item clickable
                sizeItem.addEventListener('click', () => {
                    const make = makeDropdown.value;
                    const model = modelDropdown.value;
                    const selectedSize = item.size;
    
                    // Pass all sizes for the selected model
                    const sizeListQuery = sizes.map(sizeObj => encodeURIComponent(sizeObj.size)).join(',');
                    const url = `/result_item.html?make=${encodeURIComponent(make)}&model=${encodeURIComponent(model)}&size=${encodeURIComponent(selectedSize)}&sizes=${sizeListQuery}`;
                    window.location.href = url;
                });
    
                sizeItem.appendChild(sizeText);
                sizeItem.appendChild(sizeImg);
                sizeList.appendChild(sizeItem);
            });
        }
    }

    // Fetch suggestions from the server based on input
    function fetchSuggestions(query, field, suggestionsDiv, make = null) {
    let url = `/api/search-suggestions?field=${field}`;
    if (make) url += `&make=${encodeURIComponent(make)}`;
    if (query) url += `&query=${encodeURIComponent(query)}`;

    fetch(url)
        .then(response => response.json())
        .then(data => displaySuggestions(data, suggestionsDiv, field))
        .catch(error => console.error('Error fetching suggestions:', error));
}

    // Display fetched suggestions in the dropdown
    function displaySuggestions(data, suggestionsDiv, field) {
        suggestionsDiv.innerHTML = '';
        data.forEach(item => {
            const suggestion = document.createElement('div');
            suggestion.classList.add('suggestion-item');
            suggestion.innerText = item.name;
            suggestion.addEventListener('click', () => {
                if (field === 'MMake') {
                    makeDropdown.value = item.name;
                    modelDropdown.value = ''; // Clear model if make is changed
                    fetchModels(item.name);
                } else {
                    modelDropdown.value = item.name;
                    fetchSizes(makeDropdown.value, item.name);
                }
                suggestionsDiv.style.display = 'none';
            });
            suggestionsDiv.appendChild(suggestion);
        });
        suggestionsDiv.style.display = 'block';
    }

    // Position suggestions below the input field
    function setPosition(suggestionsDiv, inputElement) {
        const rect = inputElement.getBoundingClientRect();
        suggestionsDiv.style.top = `${rect.bottom + window.scrollY}px`;
        suggestionsDiv.style.left = `${rect.left + window.scrollX}px`;
        suggestionsDiv.style.width = `${rect.width}px`;
    }

    // Hide suggestions when clicking outside
    document.addEventListener('click', (e) => {
        if (!makeDropdown.contains(e.target) && !e.target.classList.contains('dropdown-button')) {
            makeSuggestions.style.display = 'none';
        }
        if (!modelDropdown.contains(e.target) && !e.target.classList.contains('dropdown-button')) {
            modelSuggestions.style.display = 'none';
        }
    });
    
});

document.addEventListener('click', (e) => {
    if (!makeDropdown.contains(e.target) && !e.target.classList.contains('dropdown-button')) {
        makeSuggestions.style.display = 'none';
    }
    if (!modelDropdown.contains(e.target) && !e.target.classList.contains('dropdown-button')) {
        modelSuggestions.style.display = 'none';
    }
});

