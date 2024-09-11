document.getElementById('searchForm').addEventListener('submit', function(event) {
    event.preventDefault();
    const query = document.getElementById('searchQuery').value;

    fetch(/api/search?query=${query})
        .then(response => response.json())
        .then(data => {
            const resultsContainer = document.getElementById('search-results');
            resultsContainer.innerHTML = '';

            if (data.length === 0) {
                resultsContainer.innerHTML = '<p>No results found</p>';
            } else {
                data.forEach(result => {
                    const resultElement = document.createElement('div');
                    resultElement.innerText = result.name; // Adjust according to your data structure
                    resultsContainer.appendChild(resultElement);
                });
            }
        })
        .catch(error => {
            console.error('Error:', error);
        });
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