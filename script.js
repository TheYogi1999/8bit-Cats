// Global variableshttps://github.com/TheYogi1999/8bit-Cats/blob/main/script.js
let cats = [];
let catColors = ['#FFB6C1', '#87CEEB', '#98FB98', '#FFD700']; // Cute pastel color palette

// Load saved cat data
document.addEventListener('DOMContentLoaded', () => {
    if (localStorage.getItem('cats')) {
        cats = JSON.parse(localStorage.getItem('cats'));
        cats.forEach(cat => createCat(cat.name, cat.color));
    }
});

// Cat constructor
function createCat(name, color) {
    const catElem = document.createElement('div');
    catElem.classList.add('cat');
    catElem.dataset.name = name;
    catElem.dataset.color = color;
    catElem.style.backgroundImage = `url(cat1/cat1_1.png)`;
    catElem.style.filter = `hue-rotate(${Math.random() * 360}deg) saturate(${Math.random() * 1.5})`;

    // Random starting position
    catElem.style.left = `${Math.random() * 80}vw`;
    catElem.style.top = `${Math.random() * 40}vh`;
    document.getElementById('cat-area').appendChild(catElem);

    animateCat(catElem);

    // Store cat in global array
    cats.push({ name, color });

    // Save cats in local storage
    localStorage.setItem('cats', JSON.stringify(cats));
}

// Cat animation (simple frame cycling)
function animateCat(catElem) {
    let frame = 1;
    setInterval(() => {
        frame = (frame % 12) + 1;
        catElem.style.backgroundImage = `url(assets/cat1/cat1_${frame}.png)`;

        // Randomly move or stay still
        if (Math.random() > 0.3) {
            let left = parseFloat(catElem.style.left);
            let top = parseFloat(catElem.style.top);

            catElem.style.left = `${Math.min(80, Math.max(0, left + (Math.random() - 0.5) * 10))}vw`;
            catElem.style.top = `${Math.min(40, Math.max(0, top + (Math.random() - 0.5) * 10))}vh`;

            if (Math.random() > 0.5) {
                catElem.style.transform = `scaleX(-1)`; // Flip left
            } else {
                catElem.style.transform = `scaleX(1)`; // Face right
            }
        }
    }, 300);
}

// Petting the cat, feeding, and playing
document.getElementById('feedBtn').addEventListener('click', () => interactWithCat('eating snacks'));
document.getElementById('toyBtn').addEventListener('click', () => interactWithCat('playing with a toy'));
document.getElementById('petBtn').addEventListener('click', () => interactWithCat('being petted'));

function interactWithCat(action) {
    const catsOnScreen = document.querySelectorAll('.cat');
    catsOnScreen.forEach(cat => {
        const bubble = document.createElement('div');
        bubble.classList.add('bubble');
        bubble.textContent = `${cat.dataset.name} is ${action}!`;
        cat.appendChild(bubble);

        setTimeout(() => bubble.remove(), 2000); // Text bubble disappears
    });
}

// Name your cat
document.getElementById('nameCatBtn').addEventListener('click', () => {
    const catName = document.getElementById('catName').value;
    if (catName) {
        const randomColor = catColors[Math.floor(Math.random() * catColors.length)];
        createCat(catName, randomColor);
        document.getElementById('catName').value = ''; // Clear input
    }
});

// Responsive adjustments for mobile
window.addEventListener('resize', () => {
    const gameArea = document.getElementById('cat-area');
    gameArea.style.width = `${window.innerWidth * 0.9}px`;
    gameArea.style.height = `${window.innerHeight * 0.5}px`;
});
