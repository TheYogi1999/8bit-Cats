// Store cats in local storage
let cats = JSON.parse(localStorage.getItem('cats')) || [];

const addCatBtn = document.getElementById('add-cat-btn');
const catList = document.getElementById('cat-list');
const catDetails = document.getElementById('cat-details');
const catNameElem = document.getElementById('cat-name');
const catFeedback = document.getElementById('cat-feedback');
const catCanvas = document.getElementById('cat-canvas');

// Initialize canvas context
let ctx = catCanvas.getContext('2d');
let currentCat = null;
let catImages = [];
let currentFrame = 0;
let direction = 1; // 1 for right, -1 for left
let isWalking = false;

for (let i = 1; i <= 12; i++) {
    let img = new Image();
    img.src = `images/cat1/cat1_${i}.png`;
    catImages.push(img);
}

// Add new cat
addCatBtn.addEventListener('click', () => {
    const catName = prompt("Name your new cat:");
    if (catName) {
        const newCat = {
            name: catName,
            color: getRandomColor(),
            hunger: 100,
            happiness: 100
        };
        cats.push(newCat);
        saveCats();
        displayCats();
    }
});

// Save cats to localStorage
function saveCats() {
    localStorage.setItem('cats', JSON.stringify(cats));
}

// Display list of cats
function displayCats() {
    catList.innerHTML = "";
    cats.forEach((cat, index) => {
        let catDiv = document.createElement('div');
        catDiv.textContent = cat.name;
        catDiv.style.backgroundColor = cat.color;
        catDiv.addEventListener('click', () => selectCat(index));
        catList.appendChild(catDiv);
    });
}

function selectCat(index) {
    currentCat = cats[index];
    catDetails.style.display = 'block';
    catNameElem.textContent = currentCat.name;
    startCatAnimation();
    showCatFeedback(`${currentCat.name} is here!`);
}

// Randomize cat color
function getRandomColor() {
    return `hsl(${Math.random() * 360}, 70%, 80%)`;
}

// Animate cat
function startCatAnimation() {
    currentFrame = 0;
    isWalking = false;
    ctx.clearRect(0, 0, catCanvas.width, catCanvas.height);
    drawCat();
}

// Draw the cat on the canvas
function drawCat() {
    ctx.clearRect(0, 0, catCanvas.width, catCanvas.height);
    ctx.save();
    if (direction === -1) {
        ctx.scale(-1, 1); // Flip the image for walking left
        ctx.drawImage(catImages[currentFrame], -catCanvas.width, 0, catCanvas.width, catCanvas.height);
    } else {
        ctx.drawImage(catImages[currentFrame], 0, 0, catCanvas.width, catCanvas.height);
    }
    ctx.restore();
}

// Move cat (change direction)
function moveCat() {
    direction = Math.random() > 0.5 ? 1 : -1;
    isWalking = true;
    updateCatFrame();
}

function updateCatFrame() {
    if (isWalking) {
        currentFrame = (currentFrame + 1) % catImages.length;
        drawCat();
        setTimeout(updateCatFrame, 200);
    }
}

// Show cat feedback
function showCatFeedback(text) {
    catFeedback.textContent = text;
    setTimeout(() => {
        catFeedback.textContent = '';
    }, 3000);
}

// Cat actions
document.getElementById('feed-cat-btn').addEventListener('click', () => {
    if (currentCat) {
        currentCat.hunger = Math.min(currentCat.hunger + 10, 100);
        showCatFeedback(`${currentCat.name} is happily eating!`);
    }
});

document.getElementById('give-toy-btn').addEventListener('click', () => {
    if (currentCat) {
        currentCat.happiness = Math.min(currentCat.happiness + 10, 100);
        showCatFeedback(`${currentCat.name} is playing with the toy!`);
    }
});

document.getElementById('pet-cat-btn').addEventListener('click', () => {
    if (currentCat) {
        showCatFeedback(`${currentCat.name} purrs happily!`);
    }
});

// Initialize the game
displayCats();
