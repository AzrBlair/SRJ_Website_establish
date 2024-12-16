// Fetch categories from the database and populate the page
async function fetchCategories() {
    try {
        const response = await fetch('/api/getCategories'); // Replace with your actual API endpoint
        const categories = await response.json();

        const container = document.getElementById('category-container');

        categories.forEach(category => {
            const categoryDiv = document.createElement('div');
            categoryDiv.classList.add('category-item');

            // Placeholder for the image (you can add an <img> tag here in the future)
            const categoryImg = document.createElement('div');
            categoryImg.style.backgroundColor = "#ccc"; // Temporary background color
            categoryImg.style.height = "150px";

            const categoryName = document.createElement('div');
            categoryName.classList.add('category-name');
            categoryName.textContent = category.C_name;

            categoryDiv.appendChild(categoryImg);
            categoryDiv.appendChild(categoryName);

            container.appendChild(categoryDiv);
        });
    } catch (error) {
        console.error("Error fetching categories:", error);
    }
}

// Call the function to populate the categories
fetchCategories();
