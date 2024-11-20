document.addEventListener("DOMContentLoaded", () => {
    // Get URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const make = urlParams.get('make');
    const model = urlParams.get('model');
    const size = urlParams.get('size');
    const sizes = urlParams.get('sizes') ? urlParams.get('sizes').split(',') : [];

    // Update item page with dynamic content
    document.querySelector('h1').innerText = `SRJ, Inc. - ${make}`;
    document.querySelector('.item-name').innerText = `Item: ${model}`;
    document.querySelector('.model-info').innerText = `Model: ${model}`;
    document.querySelector('.size-info').innerText = `Size: ${size}`;

    // Placeholder for product description
    const shortDescription = `Short description of the ${make} ${model} (${size}) goes here.`;
    document.querySelector('.short-description').innerText = shortDescription;

    // Add event listener for the "Add to Quote" button
    const addQuoteButton = document.getElementById("addQuoteButton");
    addQuoteButton.addEventListener("click", () => {
        alert(`Added ${make} ${model} (${size}) to quote!`);
    });
    
});
