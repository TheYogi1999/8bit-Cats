const catCanvas = document.getElementById('cat-canvas');
const addCatButton = document.getElementById('add-cat');
const renameCatButton = document.getElementById('rename-cat');
const removeCatButton = document.getElementById('remove-cat');
const feedCatButton = document.getElementById('feed-cat');
const giveToyButton = document.getElementById('give-toy');
const petCatButton = document.getElementById('pet-cat');

let cats = [];
let catCount = 0;

// Add a new cat to the canvas
addCatButton.addEventListener('click', () => {
    const cat = createCat();
    cats.push(cat);
    catCanvas.appendChild(cat.element);
    saveCats();
});

// Create a cat object
function createCat() {
    const catElement = document.createElement('div');
    catElement.classList.add('cat');
    const img = document.createElement('img');
    img.src = `cat1/cat1_1.png`;
    img.dataset.frame = 1;
    catElement.appendChild(img);

    const textBubble = document.createElement('div');
    textBubble.classList.add('text-bubble');
    textBubble.innerText = 'Hello!';
    catElement.appendChild(textBubble);

    const cat = {
        id: catCount++,
        name: `Cat ${catCount}`,
        color: randomColor(),
        element: catElement,
        frame: 1,
        direction: 1, // 1 for right, -1 for left
        walking: true
    };

    applyColor(cat, cat.color);
    moveCat(cat);
    catNoise(cat);

    catElement.addEventListener('click', () => {
        showText(cat, 'Meow!');
    });

    return cat;
}

// Change cat color
function applyColor(cat, color) {
    cat.element.style.filter = `hue-rotate(${color.hue}deg) saturate(${color.saturation}%)`;
}

// Generate a random color for the cat
function randomColor() {
    return {
        hue: Math.random() * 360,
        saturation: Math.random() * 50 + 50
    };
}

// Animate the cat moving around the canvas
function moveCat(cat) {
    const catElement = cat.element;
    const img = catElement.querySelector('img');

    setInterval(() => {
        if (cat.walking) {
            cat.frame = (cat.frame % 12) + 1;
            img.src = `cat1/cat1_${cat.frame}.png`;

            let x = catElement.offsetLeft + (cat.direction * 2);
            if (x < 0 || x > catCanvas.offsetWidth - catElement.offsetWidth) {
                cat.direction *= -1;
                img.style.transform = cat.direction === 1 ? 'scaleX(1)' : 'scaleX(-1)';
            }
            catElement.style.left = `${x}px`;
        }

        // Cat randomly stops or starts walking
        if (Math.random() < 0.01) {
            cat.walking = !cat.walking;
        }
    }, 100);
}

// Show a text bubble with feedback
function showText(cat, text) {
    const textBubble = cat.element.querySelector('.text-bubble');
    textBubble.innerText = text;
    textBubble.style.display = 'block';
    setTimeout(() => {
        textBubble.style.display = 'none';
    }, 2000);
}

// Cat occasionally makes a noise
function catNoise(cat) {
    setInterval(() => {
        if (Math.random() < 0.1) {
            showText(cat, 'Purr...');
        }
    }, 5000);
}

// Save cat data locally in the browser
function saveCats() {
    const savedCats = cats.map(cat => ({
        name: cat.name,
        color: cat.color
    }));
    localStorage.setItem('cats', JSON.stringify(savedCats));
}

// Load saved cats from local storage
function loadCats() {
    const savedCats = JSON.parse(localStorage.getItem('cats') || '[]');
    savedCats.forEach(savedCat => {
        const cat = createCat();
        cat.name = savedCat.name;
        cat.color = savedCat.color;
        applyColor(cat, cat.color);
        cats.push(cat);
        catCanvas.appendChild(cat.element);
    });
}

// Initialize the game with saved cats
window.onload = () => {
    loadCats();
};
