let catCounter = 0;
let selectedCat = null;

const catContainer = document.getElementById('cat-container');
const addCatButton = document.getElementById('add-cat');
const feedCatButton = document.getElementById('feed-cat');
const petCatButton = document.getElementById('pet-cat');
const renameCatButton = document.getElementById('rename-cat');
const removeCatButton = document.getElementById('remove-cat');

// Function to save cats data to localStorage
function saveCatsToLocalStorage() {
    const cats = [];
    document.querySelectorAll('.cat-wrapper').forEach((catWrapper) => {
        const catElement = catWrapper.querySelector('.cat');
        const catName = catWrapper.querySelector('.cat-name').textContent;
        const filter = catElement.style.filter; // Get hue and saturation
        cats.push({
            name: catName,
            filter: filter,
            position: {
                left: catWrapper.style.left,
                top: catWrapper.style.top,
            }
        });
    });
    localStorage.setItem('cats', JSON.stringify(cats));
}

// Function to load cats data from localStorage
function loadCatsFromLocalStorage() {
    const savedCats = JSON.parse(localStorage.getItem('cats'));
    if (savedCats) {
        savedCats.forEach((catData) => {
            createCat(catData.name, catData.filter, catData.position.left, catData.position.top);
        });
    }
}

// Function to create and add a cat to the game area
function createCat(catName, filter, left, top) {
    const newCatWrapper = document.createElement('div');
    newCatWrapper.classList.add('cat-wrapper');
    newCatWrapper.style.left = left || `${Math.random() * (catContainer.offsetWidth - 50)}px`;
    newCatWrapper.style.top = top || `${Math.random() * (catContainer.offsetHeight - 50)}px`;

    const newCatName = document.createElement('div');
    newCatName.classList.add('cat-name');
    newCatName.textContent = catName;

    const newCat = document.createElement('div');
    newCat.classList.add('cat');
    newCat.draggable = true;
    newCat.setAttribute('data-name', catName);

    // Apply the given filter (hue and saturation)
    if (filter) {
        newCat.style.filter = filter;
    } else {
        // Generate random hue and saturation if not provided
        const randomHue = Math.random() * 360;
        const randomSaturation = Math.random() * 2 + 0.5;
        newCat.style.filter = `hue-rotate(${randomHue}deg) saturate(${randomSaturation})`;
    }

    // Add event listeners
    newCat.addEventListener('dragstart', dragStart);
    newCat.addEventListener('click', selectCat);

    // Attach the name and cat to the wrapper
    newCatWrapper.appendChild(newCatName);
    newCatWrapper.appendChild(newCat);
    catContainer.appendChild(newCatWrapper);

    // Save to localStorage
    saveCatsToLocalStorage();

    // Start random movement
    moveSmoothly(newCatWrapper, newCat);
}

// Add a new cat when the "Add Cat" button is clicked
addCatButton.addEventListener('click', () => {
    const catName = document.getElementById('cat-name').value || `Cat ${++catCounter}`;
    createCat(catName);
    document.getElementById('cat-name').value = '';  // Clear input
});

// Drag and drop functionality
function dragStart(e) {
    selectedCat = e.target;
    e.dataTransfer.setData('text/plain', null);
}

// Set the position of the cat on drag end
catContainer.addEventListener('dragover', (e) => {
    e.preventDefault();
});

catContainer.addEventListener('drop', (e) => {
    const rect = catContainer.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    selectedCat.parentElement.style.left = `${x}px`;
    selectedCat.parentElement.style.top = `${y}px`;

    // Save new position to localStorage
    saveCatsToLocalStorage();
});

// Select a cat when clicked
function selectCat(e) {
    selectedCat = e.target;
    showSpeechBubble(selectedCat, `Selected: ${selectedCat.getAttribute('data-name')}`);
}

// Show a speech bubble near the cat with a custom message
function showSpeechBubble(cat, message) {
    const bubble = document.createElement('div');
    bubble.classList.add('speech-bubble');
    bubble.textContent = message;

    cat.parentElement.appendChild(bubble);

    setTimeout(() => {
        bubble.remove();
    }, 3000);
}

// Feed the selected cat
feedCatButton.addEventListener('click', () => {
    if (selectedCat) {
        showSpeechBubble(selectedCat, `${selectedCat.getAttribute('data-name')} is eating!`);
    } else {
        alert('Select a cat to feed!');
    }
});

// Pet the selected cat
petCatButton.addEventListener('click', () => {
    if (selectedCat) {
        showSpeechBubble(selectedCat, `You pet ${selectedCat.getAttribute('data-name')}!`);
        selectedCat.style.transform = 'scale(1.1)';
        setTimeout(() => {
            selectedCat.style.transform = 'scale(1)';
        }, 500);
    } else {
        alert('Select a cat to pet!');
    }
});

// Rename the selected cat
renameCatButton.addEventListener('click', () => {
    if (selectedCat) {
        const newName = prompt('Enter a new name for your cat:', selectedCat.getAttribute('data-name'));
        if (newName) {
            selectedCat.setAttribute('data-name', newName);
            selectedCat.parentElement.querySelector('.cat-name').textContent = newName;
            showSpeechBubble(selectedCat, `Renamed to ${newName}`);
            saveCatsToLocalStorage();
        }
    } else {
        alert('Select a cat to rename!');
    }
});

// Remove the selected cat
removeCatButton.addEventListener('click', () => {
    if (selectedCat) {
        selectedCat.parentElement.remove();
        selectedCat = null;
        saveCatsToLocalStorage(); // Update storage after removal
    } else {
        alert('Select a cat to remove!');
    }
});

// Smoothly move cats randomly within the container with pauses and flipping
function moveSmoothly(catWrapper, cat) {
    function moveCat() {
        const maxX = catContainer.offsetWidth - catWrapper.offsetWidth;
        const maxY = catContainer.offsetHeight - catWrapper.offsetHeight;

        const currentX = parseFloat(catWrapper.style.left);
        const newX = Math.random() * maxX;
        const newY = Math.random() * maxY;

        if (newX < currentX) {
            cat.style.transform = 'scaleX(-1)';
        } else {
            cat.style.transform = 'scaleX(1)';
        }

        cat.classList.add('walking');
        catWrapper.style.left = `${newX}px`;
        catWrapper.style.top = `${newY}px`;

        const pauseDuration = Math.random() * 3000 + 4000;

        setTimeout(() => {
            cat.classList.remove('walking');
            moveCat();
        }, pauseDuration + 8000);
    }

    moveCat();
}

// Load cats from localStorage when the page is loaded
window.addEventListener('load', loadCatsFromLocalStorage);
