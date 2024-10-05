let canvas = document.getElementById("gameCanvas");
let ctx = canvas.getContext("2d");
canvas.width = 400;
canvas.height = 300;

let cats = [];
let catImages = [];
let currentCat = 0;
let catNameInput = document.getElementById("catName");

// Preload cat images
for (let i = 1; i <= 12; i++) {
    let img = new Image();
    img.src = `cat1/cat1_${i}.png`;
    catImages.push(img);
}

// Cat object
class Cat {
    constructor(name, color) {
        this.name = name;
        this.x = Math.random() * (canvas.width - 50);
        this.y = Math.random() * (canvas.height - 50);
        this.frame = 0;
        this.speed = Math.random() * 2 + 1;
        this.direction = 1; // 1 for right, -1 for left
        this.hue = color.hue;
        this.saturation = color.saturation;
    }

    draw() {
        ctx.save();
        ctx.filter = `hue-rotate(${this.hue}deg) saturate(${this.saturation}%)`;
        ctx.translate(this.x, this.y);
        if (this.direction === -1) {
            ctx.scale(-1, 1); // Flip the image for left direction
            ctx.translate(-50, 0); // Translate it back after flipping
        }
        ctx.drawImage(catImages[this.frame], 0, 0, 50, 50);
        ctx.restore();
    }

    update() {
        this.x += this.speed * this.direction;
        if (this.x > canvas.width - 50 || this.x < 0) {
            this.direction *= -1; // Change direction at edges
        }

        // Update frame for animation
        this.frame = (this.frame + 1) % catImages.length;
    }

    showMessage(message) {
        ctx.fillStyle = "#fff";
        ctx.fillRect(this.x, this.y - 20, 80, 20);
        ctx.fillStyle = "#000";
        ctx.fillText(message, this.x, this.y - 5);
    }
}

// Random color generator for cats
function randomColor() {
    return {
        hue: Math.random() * 360,
        saturation: Math.random() * 100 + 50
    };
}

// Create a new cat
function createCat(name) {
    let color = randomColor();
    let newCat = new Cat(name, color);
    cats.push(newCat);
    saveCats(); // Save the cats' data
}

// Save the cat names and colors locally
function saveCats() {
    let catData = cats.map(cat => ({ name: cat.name, hue: cat.hue, saturation: cat.saturation }));
    localStorage.setItem("cats", JSON.stringify(catData));
}

// Load the cats from local storage
function loadCats() {
    let storedCats = localStorage.getItem("cats");
    if (storedCats) {
        let catData = JSON.parse(storedCats);
        catData.forEach(cat => {
            cats.push(new Cat(cat.name, { hue: cat.hue, saturation: cat.saturation }));
        });
    }
}

// Handle feeding, petting, etc.
function handleAction(action) {
    if (cats.length === 0) return;
    cats[currentCat].showMessage(action);
}

// Set up buttons
document.getElementById("feedButton").addEventListener("click", () => handleAction("Fed!"));
document.getElementById("waterButton").addEventListener("click", () => handleAction("Watered!"));
document.getElementById("snackButton").addEventListener("click", () => handleAction("Snack!"));
document.getElementById("toyButton").addEventListener("click", () => handleAction("Played!"));
document.getElementById("petButton").addEventListener("click", () => handleAction("Petted!"));

// Add a new cat with a name and random color
catNameInput.addEventListener("keydown", function (e) {
    if (e.key === "Enter" && catNameInput.value.trim()) {
        createCat(catNameInput.value.trim());
        catNameInput.value = "";
    }
});

// Animation loop
function gameLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    cats.forEach(cat => {
        cat.update();
        cat.draw();
    });
    requestAnimationFrame(gameLoop);
}

// Initialize game
loadCats();
gameLoop();
