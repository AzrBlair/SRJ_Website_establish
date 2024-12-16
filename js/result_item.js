document.addEventListener("DOMContentLoaded", async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const make = urlParams.get('make');
    const model = urlParams.get('model');
    const size = urlParams.get('size');
    let imageLinks = urlParams.get('imageLink'); // Expecting comma-separated links
    const sizes = urlParams.get('sizes') ? urlParams.get('sizes').split(',') : [];

    // Fetch image links if not provided in the URL
    if (!imageLinks) {
        const response = await fetch(`/api/getImageLink?make=${encodeURIComponent(make)}&model=${encodeURIComponent(model)}&size=${encodeURIComponent(size)}`);
        if (response.ok) {
            const data = await response.json();
            imageLinks = data.imageLink; // Comma-separated links from the database
        }
    }

    // Update placeholders with dynamic data
    document.getElementById("dynamic-make").innerText = make || "Unknown Make";
    document.getElementById("dynamic-model").innerText = model || "Unknown Model";
    document.getElementById("dynamic-size").innerText = size || "Unknown Size";
    document.getElementById("dynamic-description").innerText = 
        `Short description of the ${make || "Make"} ${model || "Model"} (${size || "Size"}) goes here.`;
    document.getElementById("dynamic-details").innerText = 
        `Detailed description of the ${make || "Make"} ${model || "Model"} (${size || "Size"}) goes here.`;

    // Populate the image slider
    const productImagesContainer = document.getElementById("product-images");
    const dotsContainer = document.createElement("div"); // For navigation dots
    dotsContainer.classList.add("dots");
    productImagesContainer.innerHTML = ""; // Clear any existing images
    let currentIndex = 0;

    if (imageLinks) {
        const images = imageLinks.split(","); // Split the comma-separated links

        // Add images and dots
        images.forEach((link, index) => {
            // Add image to slider
            const img = document.createElement("img");
            img.src = decodeURIComponent(link.trim());
            img.alt = `${make || "Make"} ${model || "Model"} Image`;
            img.style.display = index === 0 ? "block" : "none"; // Show only the first image initially
            productImagesContainer.appendChild(img);

            // Add dot for each image
            const dot = document.createElement("span");
            dot.className = "dot";
            if (index === 0) dot.classList.add("active");
            dot.setAttribute("data-index", index);
            dot.addEventListener("click", () => {
                showSlide(index);
                resetAutoSlide(); // Reset auto-slide timer when manually navigating
            });
            dotsContainer.appendChild(dot);
        });
        productImagesContainer.parentElement.appendChild(dotsContainer); // Append dots below the slider
        showSlide(0); // Show the first slide
    } else {
        // Fallback to placeholder if no images are available
        const placeholder = document.createElement("img");
        placeholder.src = "placeholder.jpg"; // Replace with your placeholder image URL
        placeholder.alt = "No image available";
        productImagesContainer.appendChild(placeholder);
    }

    // Auto-slide functionality
    const totalSlides = imageLinks ? imageLinks.split(",").length : 0;
    let autoSlideTimer = setInterval(() => {
        showSlide((currentIndex + 1) % totalSlides);
    }, 3000); // Change every 3 seconds

    // Function to show a specific slide
    function showSlide(index) {
        currentIndex = index;
        const images = document.querySelectorAll("#product-images img");
        const dots = document.querySelectorAll(".dot");

        // Show the selected image and update active dot
        images.forEach((img, i) => (img.style.display = i === index ? "block" : "none"));
        dots.forEach((dot, i) => dot.classList.toggle("active", i === index));
    }

    // Function to reset auto-slide timer
    function resetAutoSlide() {
        clearInterval(autoSlideTimer);
        autoSlideTimer = setInterval(() => {
            showSlide((currentIndex + 1) % totalSlides);
        }, 3000);
    }

    // Populate size list in the sidebar
    const sizeList = document.getElementById("size-list");
    sizeList.innerHTML = ""; // Clear the list
    sizes.forEach((sizeItem) => {
        const listItem = document.createElement("li");
        listItem.innerText = decodeURIComponent(sizeItem);
        listItem.addEventListener("click", () => {
            // Redirect to the same page with the selected size
            const url = `result_item.html?make=${encodeURIComponent(make)}&model=${encodeURIComponent(model)}&size=${encodeURIComponent(sizeItem)}&sizes=${sizes.join(',')}`;
            window.location.href = url;
        });
        sizeList.appendChild(listItem);
    });

    // Update the "Back to Search Results" link
    const backToSearch = document.getElementById("back-to-search");
    if (make && model) {
        backToSearch.href = `search_result.html?make=${encodeURIComponent(make)}&model=${encodeURIComponent(model)}`;
    } else {
        backToSearch.href = "search_result.html";
    }
});
