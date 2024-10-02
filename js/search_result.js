document.addEventListener('DOMContentLoaded', function() {
    // Extract query parameter from the URL
    const urlParams = new URLSearchParams(window.location.search);
    const query = urlParams.get('query');

    if (query) {
        // Fetch models for the selected make (query)
        fetch(`/api/models?make=${encodeURIComponent(query)}`)
            .then(response => response.json())
            .then(data => {
                if (Array.isArray(data) && data.length > 0) {
                    displayModels(data);  // Display models if found
                } else {
                    document.getElementById('models-container').innerHTML = 'No models found';
                }
            })
            .catch(error => console.error('Error fetching models:', error));
    }

    // Function to display models for the selected make
    function displayModels(models) {
        const modelsContainer = document.getElementById('models-container');
        modelsContainer.innerHTML = '';  // Clear previous models

        models.forEach(model => {
            const modelElement = document.createElement('button');
            modelElement.innerText = `Model: ${model.model}`;  // Display model name as a button
            modelElement.classList.add('model-item');
            modelElement.addEventListener('click', function() {
                // Fetch and display sizes for the selected model when clicked
                displaySizes(query, model.model);
            });
            modelsContainer.appendChild(modelElement);
        });
    }

    // Function to display sizes for a specific model
    function displaySizes(make, model) {
        fetch(`/api/sizes?make=${encodeURIComponent(make)}&model=${encodeURIComponent(model)}`)
            .then(response => response.json())
            .then(data => {
                const sizesContainer = document.getElementById('sizes-container');
                sizesContainer.innerHTML = '';  // Clear previous sizes

                if (data.length === 0) {
                    sizesContainer.innerHTML = 'No sizes found';
                }

                data.forEach(size => {
                    const sizeElement = document.createElement('div');
                    sizeElement.innerText = `Size: ${size.size}`;  // Display size
                    sizeElement.classList.add('size-item');
                    sizesContainer.appendChild(sizeElement);
                });
            })
            .catch(error => console.error('Error fetching sizes:', error));
    }
});