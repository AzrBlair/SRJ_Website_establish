// video click and pop out
document.addEventListener("DOMContentLoaded", () => {
    const videos = document.querySelectorAll(".video-item");
    const modal = document.getElementById("video-modal");
    const modalVideo = document.getElementById("modal-video");
    const closeButton = document.querySelector(".close-button");

    // Open modal when video is clicked
    videos.forEach((video) => {
        video.addEventListener("click", () => {
            const videoSrc = video.querySelector("source").src;
            modalVideo.src = videoSrc; // Set the clicked video source
            modal.style.display = "flex"; // Show modal
        });
    });

    // Close modal
    closeButton.addEventListener("click", () => {
        modal.style.display = "none";
        modalVideo.pause(); // Pause the video
        modalVideo.src = ""; // Clear video source
    });

    // Close modal when clicking outside the video
    modal.addEventListener("click", (e) => {
        if (e.target === modal) {
            modal.style.display = "none";
            modalVideo.pause(); // Pause the video
            modalVideo.src = ""; // Clear video source
        }
    });
});

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
////////image section////////////////////////////////////////////////////////////////////////////////////////////////////////////////
document.addEventListener("DOMContentLoaded", function () {
    const slider = document.querySelector(".image-slider");
    const slides = document.querySelectorAll(".slide");
    const dotsContainer = document.querySelector(".slider-dots");
    const leftArrow = document.querySelector(".left-arrow");
    const rightArrow = document.querySelector(".right-arrow");

    let currentIndex = 0;

    // Create dots dynamically
    slides.forEach((_, index) => {
        const dot = document.createElement("button");
        dot.classList.add("dot");
        if (index === 0) dot.classList.add("active");
        dotsContainer.appendChild(dot);

        dot.addEventListener("click", () => {
            currentIndex = index;
            updateSlider();
        });
    });

    const dots = document.querySelectorAll(".dot");

    function updateSlider() {
        const offset = currentIndex * slider.offsetWidth;
        slider.scrollTo({
            left: offset,
            behavior: "smooth",
        });

        // Update dot state
        dots.forEach((dot, index) => {
            dot.classList.toggle("active", index === currentIndex);
        });
    }

    // Left and Right Arrow Controls
    leftArrow.addEventListener("click", () => {
        currentIndex = (currentIndex - 1 + slides.length) % slides.length;
        updateSlider();
    });

    rightArrow.addEventListener("click", () => {
        currentIndex = (currentIndex + 1) % slides.length;
        updateSlider();
    });

    // Auto-scroll every 5 seconds
    setInterval(() => {
        currentIndex = (currentIndex + 1) % slides.length;
        updateSlider();
    }, 10000); // Adjust timing as needed
    
});

document.addEventListener('DOMContentLoaded', () => {
    const slides = document.querySelectorAll('.slide');

    slides.forEach((slide) => {
        const info = slide.querySelector('.slide-info');
        const top = slide.dataset.top || '50px'; // Default to '50px' if not set
        const left = slide.dataset.left || '20px'; // Default to '20px' if not set

        // Apply the dynamic position
        info.style.top = top;
        info.style.left = left;
    });
});


document.querySelectorAll('.slide').forEach((slide) => {
    const slideInfo = slide.querySelector('.slide-info');
    const top = slide.getAttribute('data-top') || '20px'; // Default value
    const left = slide.getAttribute('data-left') || '20px'; // Default value

    slideInfo.style.top = top;
    slideInfo.style.left = left;
});

///floating text appear after commitment//////////////////////////////////////////////////////////////////////////////////////////////////
document.addEventListener("DOMContentLoaded", () => {
    const floatingText = document.getElementById("floating-text");
    const section = document.querySelector(".commitment-section");

    window.addEventListener("scroll", () => {
        const sectionTop = section.getBoundingClientRect().top;
        const windowHeight = window.innerHeight;

        if (sectionTop < windowHeight - 500) {
            // Add the visible class when the section comes into view
            floatingText.classList.add("visible");
        } else {
            // Optionally remove the visible class when out of view
            floatingText.classList.remove("visible");
        }
    });
});

// Handle main search button click
document.getElementById('mainSearchButton').addEventListener('click', function() {
    const makeQuery = document.getElementById('makeSearchQuery').value.trim();
    const modelQuery = document.getElementById('modelSearchQuery').value.trim();

    // Determine the URL based on input fields
    let url = `search_result.html?make=${encodeURIComponent(makeQuery)}`;
    if (modelQuery) {
        url += `&model=${encodeURIComponent(modelQuery)}`;
    }

    // Redirect to the search result page with the appropriate parameters
    window.location.href = url;
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

document.getElementById('mainSearchButton').addEventListener('click', function() {
    const makeQuery = document.getElementById('makeSearchQuery').value.trim();
    const modelQuery = document.getElementById('modelSearchQuery').value.trim();

    // Determine the URL based on input fields
    let url = `search_result.html?make=${encodeURIComponent(makeQuery)}`;
    if (modelQuery) {
        url += `&model=${encodeURIComponent(modelQuery)}`;
    }

    // Redirect to the search result page with the appropriate parameters
    window.location.href = url;
});

document.addEventListener("DOMContentLoaded", function () {
    const floatingWindow = document.getElementById("floating-window");
    const minimizeButton = document.getElementById("minimize-button");
    const minimizedBar = document.getElementById("minimized-bar");
    const restoreButton = document.getElementById("restore-button");

    //re submit form
    const formContent = document.getElementById("form-content");
    const confirmationModal = document.getElementById("confirmation-modal");
    const newQuoteButton = document.getElementById("new-quote");

    // Minimize the floating window
    minimizeButton.addEventListener("click", function () {
        floatingWindow.style.transform = "translateX(100%)"; // Move off the screen
        floatingWindow.style.opacity = "0";
        setTimeout(() => {
            floatingWindow.style.display = "none"; // Hide the window
            minimizedBar.style.display = "flex"; // Show the minimized bar
        }, 500);
    });

    // Restore the floating window
    restoreButton.addEventListener("click", function () {
        minimizedBar.style.display = "none"; // Hide the minimized bar
        floatingWindow.style.display = "block"; // Show the window
        setTimeout(() => {
            floatingWindow.style.transform = "translateX(0)"; // Bring it back
            floatingWindow.style.opacity = "1";
        }, 50);
    });
});

//submit form
document.addEventListener("submit", async function (event) {
    event.preventDefault();
    alert("Are you sure to submit the quote?");

    // Gather form data
    const customerName = document.getElementById("customerName").value;
    const email = document.getElementById("email").value;
    const phone = document.getElementById("phone").value;
    const quoteContent = document.getElementById("quoteContent").value;

    // Determine preferred contact method
    const preferPhone = document.getElementById("preferPhone").checked;
    const preferEmail = document.getElementById("preferEmail").checked;
    const preferredContact = [];
    if (preferPhone) preferredContact.push("Phone");
    if (preferEmail) preferredContact.push("Email");

    // make sure all fields being filled
    if (!customerName || !email || !phone || !quoteContent) {
        alert("Please fill out all fields.");
        return;
    }
    // after sent clear the quote content
    document.getElementById("quoteContent").value = "";

    // Send data to server
    //try {   
    const response = await fetch("/api/submitQuote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            customerName,
            email,
            phone,
            preferredContact: preferredContact.join(", "),
            quoteContent,
        }),
        
    });

    //document.getElementById("quoteContent").value = "";

    //     const result = await response.json();
    //     console.log("Server response:", result); // Log the response for debugging

    //     if (response.ok) {
    //         // Hide the form and show the confirmation message
    //         formContent.display = "none";
    //         confirmationModal.display = "block";
    //         alert("trigger display = none");
    //     } else {
    //         const result = await response.json();
    //         alert(`Error: ${result.message}`);
    //     }
    // } catch (error) {
    //     console.error("Submission error:", error);
    //     alert("Something went wrong. Please try again.");
    // }

    // document.getElementById("quoteContent").value = "";
    // // Show the form again
    // confirmationModal.style.display = "none";
    // formContent.style.display = "block";

    // // Reset form when "New Quote" is clicked

});

