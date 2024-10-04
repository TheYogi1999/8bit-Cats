let catCounter = 0;
let selectedCat = null;
let isDragging = false;
let dragStartX = 0;
let dragStartY = 0;
let catStartX = 0;
let catStartY = 0;

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
        const left = catWrapper.style.left;
        const top = catWrapper.style.top;

        cats.push({
            name: catName,
            filter: filter,
            position: {
                left: left,
                top: top,
            },
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
    newCatName.textContent = catName || `Cat ${++catCounter}`;  // Default name

    const newCat = document.createElement('div');
    newCat.classList.add('cat');
    newCat.setAttribute('draggable', 'false'); // Disable built-in dragging
    newCat.setAttribute('data-name', newCatName.textContent);

    // Apply the given filter (hue and saturation)
    if (filter) {
        newCat.style.filter = filter;
    } else {
        const randomHue = Math.random() * 360;
        const randomSaturation = Math.random() * 2 + 0.5;
        newCat.style.filter = `hue-rotate(${randomHue}deg) saturate(${randomSaturation})`;
    }

    // Add event listeners for dragging
    newCat.addEventListener('mousedown', startDrag);
    newCat.addEventListener('touchstart', startDrag, { passive: false });

    window.addEventListener('mouseup', stopDrag);
    window.addEventListener('touchend', stopDrag);
    window.addEventListener('mousemove', drag);
    window.addEventListener('touchmove', drag, { passive: false });

    // Add event listener for selecting
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

// Start dragging
function startDrag(e) {
    e.preventDefault();

    selectedCat = e.target;
    const catWrapper = selectedCat.parentElement;
    const rect = catWrapper.getBoundingClientRect();

    if (e.type === 'touchstart') {
        dragStartX = e.touches[0].clientX;
        dragStartY = e.touches[0].clientY;
    } else {
        dragStartX = e.clientX;
        dragStartY = e.clientY;
    }

    catStartX = rect.left - catContainer.getBoundingClientRect().left;
    catStartY = rect.top - catContainer.getBoundingClientRect().top;

    isDragging = true;
    pauseCatMovement(selectedCat); // Pause movement while dragging
}

// Stop dragging
function stopDrag() {
    isDragging = false;
    if (selectedCat) {
        resumeCatMovement(selectedCat); // Resume movement after dragging
        saveCatsToLocalStorage(); // Save new position
        selectedCat = null;
    }
}

// Handle dragging
function drag(e) {
    if (!isDragging || !selectedCat) return;

    e.preventDefault();

    let currentX, currentY;

    if (e.type === 'touchmove') {
        currentX = e.touches[0].clientX;
        currentY = e.touches[0].clientY;
    } else {
        currentX = e.clientX;
        currentY = e.clientY;
    }

    const deltaX = currentX - dragStartX;
    const deltaY = currentY - dragStartY;

    selectedCat.parentElement.style.left = `${catStartX + deltaX}px`;
    selectedCat.parentElement.style.top = `${catStartY + deltaY}px`;
}

// Select a cat when clicked
function selectCat(e) {
    if (!isDragging) {
        selectedCat = e.target;
        showSpeechBubble(selectedCat, `Selected: ${selectedCat.getAttribute('data-name')}`);
    }
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

// Add a new cat when the "Add Cat" button is clicked
addCatButton.addEventListener('click', () => {
    createCat();
});

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

// Pause movement for the selected cat during dragging
function pauseCatMovement(cat) {
    const catWrapper = cat.parentElement;
    catWrapper.classList.add('pause-movement'); // Add class to pause movement
}

// Resume movement for the selected cat after dragging
function resumeCatMovement(cat) {
    const catWrapper = cat.parentElement;
    catWrapper.classList.remove('pause-movement'); // Remove class to resume movement
}

// Smoothly move cats randomly within the container with pauses and flipping
function moveSmoothly(catWrapper, cat) {
    function moveCat() {
        if (!catWrapper.classList.contains('pause-movement')) {
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
                moveCat(); // Continue moving unless paused
            }, pauseDuration + 8000);
        }
    }

    moveCat();
}

// Load cats from localStorage when the page is loaded
window.addEventListener('load', loadCatsFromLocalStorage);
