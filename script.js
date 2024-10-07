const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
let cats = [];
let plants = [];  // Array to hold plant objects
let selectedCat = null;
let textBubbles = [];

// Disable image smoothing for pixel art
ctx.imageSmoothingEnabled = false;  // Prevent smoothing when scaling pixel art

// Set canvas size based on screen size and reduce height
function resizeCanvas() {
    canvas.width = Math.min(window.innerWidth * 0.95, 1200); // 95% of screen width, max 1200px
    canvas.height = Math.min(window.innerHeight * 0.5, 500); // 50% of screen height, max 500px
}

// Resize the canvas on window resize
window.addEventListener("resize", resizeCanvas);
resizeCanvas();

// Music controls
const music = document.getElementById("backgroundMusic");
const musicButton = document.getElementById("toggleMusic");

function toggleMusic() {
    if (music.paused) {
        music.play();
        musicButton.innerText = "⏹️"; // Change to stop icon when playing
    } else {
        music.pause();
        musicButton.innerText = "▶️"; // Change to play icon when paused
    }
}

// Save cats to localStorage
function saveCats() {
    const catsData = cats.map(cat => ({
        name: cat.name,
        x: cat.x,
        y: cat.y,
        hue: cat.hue,
        saturation: cat.saturation,
        brightness: cat.brightness,
        hunger: cat.hunger,
        thirst: cat.thirst,
        affection: cat.affection,
        imgIndex: cat.imgIndex
    }));
    localStorage.setItem('cats', JSON.stringify(catsData));
}

// Load cats from localStorage and center them
function loadCats() {
    const catsData = JSON.parse(localStorage.getItem('cats')) || [];
    const centerX = canvas.width / 2 - 16; // Calculate the center of the canvas
    const centerY = canvas.height / 2 - 16;

    catsData.forEach(data => {
        const catImages = loadCatImages('cat1'); // Assuming all cats are the same type
        const newCat = new Cat(catImages, centerX, centerY, data.name); // Set cats to canvas center
        newCat.hue = data.hue;
        newCat.saturation = data.saturation;
        newCat.brightness = data.brightness;
        newCat.hunger = data.hunger;
        newCat.thirst = data.thirst;
        newCat.affection = data.affection;
        newCat.imgIndex = data.imgIndex;
        cats.push(newCat);
    });
}

// Cat class
class Cat {
    constructor(images, x, y, name = "Unknown") {
        this.images = images;
        this.x = x;
        this.y = y;
        this.frame = 0;
        this.speedX = Math.random() * 2 - 1;
        this.speedY = Math.random() * 2 - 1;
        this.stillCounter = Math.floor(Math.random() * 100);
        this.imgIndex = 0;
        this.name = name;
        this.pats = 0;
        this.feedCount = 0;

        // Generate random values for hue and saturation, and ensure brightness is mostly high
        this.hue = Math.floor(Math.random() * 360); // Random hue from 0 to 360
        this.saturation = Math.floor(Math.random() * 100) + 50; // Random saturation (50-100%)
        this.brightness = Math.floor(Math.random() * 30) + 80; // Brightness always between 80-100%

        // Initialize needs
        this.hunger = 100;
        this.thirst = 100;
        this.affection = 100;

        // Slower depletion with random jumpy behavior
        this.hungerDepletionInterval = Math.floor(Math.random() * 400) + 300; // Jumps between 300 to 700 frames
        this.thirstDepletionInterval = Math.floor(Math.random() * 400) + 300;
        this.affectionDepletionInterval = Math.floor(Math.random() * 400) + 300;

        // Frame counters for each need
        this.hungerFrame = 0;
        this.thirstFrame = 0;
        this.affectionFrame = 0;
    }

    // Decrease hunger, thirst, and affection over time, slower and jumpy
    updateNeeds() {
        this.hungerFrame++;
        this.thirstFrame++;
        this.affectionFrame++;

        // Jumpy depletion based on random intervals
        if (this.hungerFrame >= this.hungerDepletionInterval) {
            this.hunger = Math.max(this.hunger - (Math.random() * 5 + 1), 0); // Random jump between 1 and 5
            this.hungerFrame = 0; // Reset frame counter
        }

        if (this.thirstFrame >= this.thirstDepletionInterval) {
            this.thirst = Math.max(this.thirst - (Math.random() * 5 + 1), 0); // Random jump between 1 and 5
            this.thirstFrame = 0; // Reset frame counter
        }

        if (this.affectionFrame >= this.affectionDepletionInterval) {
            this.affection = Math.max(this.affection - (Math.random() * 5 + 1), 0); // Random jump between 1 and 5
            this.affectionFrame = 0; // Reset frame counter
        }

        saveCats(); // Save the cat's state after updating needs
    }

    // Calculate happiness as the average of hunger, thirst, and affection
    getHappiness() {
        return (this.hunger + this.thirst + this.affection) / 3;
    }

    // Move the cat randomly
    move() {
        this.updateNeeds(); // Update the needs every move

        if (this.stillCounter > 0) {
            this.stillCounter--;
        } else {
            this.x += this.speedX;
            this.y += this.speedY;

            if (this.x < 0 || this.x > canvas.width - 32) this.speedX *= -1;
            if (this.y < 0 || this.y > canvas.height - 32) this.speedY *= -1;

            if (Math.random() < 0.01) {
                this.stillCounter = Math.floor(Math.random() * 200);
            }

            // Random chance for the cat to Miau
            if (Math.random() < 0.005) {
                textBubbles.push(new TextBubble("Miau!", this));
            }
        }

        this.frame++;
        if (this.frame % 10 === 0) {
            this.imgIndex = (this.imgIndex + 1) % this.images.length;
        }
    }

    // Draw the cat, flip the image if moving to the left, and apply random hue/saturation/tint
    draw(isSelected) {
        const img = new Image();
        img.src = this.images[this.imgIndex];

        // Save the current context before transformations
        ctx.save();

        // Apply random hue, saturation, and brightness using CSS filter
        ctx.filter = `hue-rotate(${this.hue}deg) saturate(${this.saturation}%) brightness(${this.brightness}%)`;

        // Flip the image if the cat is moving to the left
        if (this.speedX < 0) {
            ctx.scale(-1, 1); // Flip horizontally
            ctx.drawImage(img, -this.x - 32, this.y, 32, 32); // Adjust x because of flipping
        } else {
            ctx.drawImage(img, this.x, this.y, 32, 32); // Draw normally when moving right
        }

        // Restore the original context (non-flipped)
        ctx.restore();

        // Determine the color for the cat's name based on happiness level
        const happiness = this.getHappiness();
        const nameColor = happiness < 10 ? "#808080" : "#FF69B4"; // Gray if happiness < 10, otherwise pink

        // Draw the cat's name above the image
        ctx.font = "16px Comic Sans MS";
        ctx.fillStyle = nameColor; // Use dynamic color
        ctx.textAlign = "center";
        ctx.fillText(this.name, this.x + 16, this.y - 10);

        // Draw selected cat outline or glow effect
        if (isSelected) {
            ctx.strokeStyle = "#FF1E71"; // Pink color for the selection outline
            ctx.lineWidth = 4;
            ctx.strokeRect(this.x - 2, this.y - 2, 36, 36); // Slightly larger than the cat image
        }
    }

    // Check if a point (mouse click or touch) is inside the cat's area
    isClicked(mouseX, mouseY) {
        return mouseX >= this.x && mouseX <= this.x + 32 && mouseY >= this.y && mouseY <= this.y + 32;
    }
}

// Text bubble class for displaying interactions and following the cat
class TextBubble {
    constructor(text, cat) {
        this.text = text;
        this.cat = cat; // The cat that this bubble belongs to
        this.timer = 100; // Lifetime of the bubble in frames
    }

    draw() {
        if (this.timer > 0) {
            const x = this.cat.x + 16; // Center above the cat
            const y = this.cat.y - 20; // A bit above the cat's head

            // Draw rounded speech bubble
            ctx.fillStyle = "#F4ACB7"; // Pastel pink for the bubble
            ctx.strokeStyle = "#FFCAD4"; // Soft border color
            ctx.lineWidth = 2;

            // Rounded rectangle (speech bubble body)
            ctx.beginPath();
            ctx.moveTo(x - 50, y - 30);
            ctx.quadraticCurveTo(x - 50, y - 50, x - 30, y - 50);
            ctx.lineTo(x + 30, y - 50);
            ctx.quadraticCurveTo(x + 50, y - 50, x + 50, y - 30);
            ctx.lineTo(x + 50, y - 20);
            ctx.quadraticCurveTo(x + 50, y, x + 40, y);
            ctx.lineTo(x - 40, y);
            ctx.quadraticCurveTo(x - 50, y, x - 50, y - 20);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();

            // Triangle (speech bubble pointer)
            ctx.beginPath();
            ctx.moveTo(x - 10, y);
            ctx.lineTo(x + 10, y);
            ctx.lineTo(x, y + 10);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();

            // Draw text inside the bubble
            ctx.fillStyle = "#000000";
            ctx.font = "14px Comic Sans MS";
            ctx.textAlign = "center";
            ctx.fillText(this.text, x, y - 25);

            this.timer--;
        }
    }
}

// Load cat images
function loadCatImages(catFolder) {
    const catImages = [];
    for (let i = 1; i <= 12; i++) {
        catImages.push(`./${catFolder}/cat1_${i}.png`);
    }
    return catImages;
}

// Load plant images
function loadPlantImages() {
    const plantImages = [];
    for (let i = 1; i <= 12; i++) {  // Increased number of plants to 12
        plantImages.push(`./plants/plant${i}.png`);
    }
    return plantImages;
}

// Add a cat to the canvas
function addCat(catType) {
    const catImages = loadCatImages(catType);
    const newCat = new Cat(catImages, Math.random() * canvas.width, Math.random() * canvas.height);
    cats.push(newCat);
    saveCats(); // Save the cats after adding
}

// Add plants to the canvas
function addPlants() {
    const plantImages = loadPlantImages();
    const plantCount = 40; // 5 times more plants
    const scaleFactor = 0.2; // Make the plants 0.2 times smaller (1/5 the size)

    for (let i = 0; i < plantCount; i++) {
        const randomPlant = new Image();
        randomPlant.src = plantImages[Math.floor(Math.random() * plantImages.length)];
        const plantX = Math.random() * (canvas.width - 50); // Random x position
        const plantY = Math.random() * (canvas.height - 50); // Random y position
        randomPlant.onload = function () {
            const width = randomPlant.width * scaleFactor;  // Scale width down to 0.2 times
            const height = randomPlant.height * scaleFactor;  // Scale height down to 0.2 times
            plants.push({ img: randomPlant, x: plantX, y: plantY, width, height });
        };
    }
}

// Handle canvas click/touch to select cat
canvas.addEventListener("click", handleCatInteraction);
canvas.addEventListener("touchstart", handleCatInteraction);

function handleCatInteraction(event) {
    event.preventDefault();
    const rect = canvas.getBoundingClientRect();
    const mouseX = (event.touches ? event.touches[0].clientX : event.clientX) - rect.left;
    const mouseY = (event.touches ? event.touches[0].clientY : event.clientY) - rect.top;

    // Loop through all cats to check if one was clicked
    cats.forEach(cat => {
        if (cat.isClicked(mouseX, mouseY)) {
            selectedCat = cat;
            document.getElementById("cat-name").innerText = `Cat Name: ${cat.name}`;
            document.getElementById("cat-menu").style.display = "block";
            updateProgressBars(); // Update progress bars for selected cat
        }
    });
}

// Update progress bars for hunger, thirst, affection, and happiness
function updateProgressBars() {
    if (selectedCat) {
        document.getElementById("hunger-fill").style.width = selectedCat.hunger + "%";
        document.getElementById("thirst-fill").style.width = selectedCat.thirst + "%";
        document.getElementById("affection-fill").style.width = selectedCat.affection + "%";
        document.getElementById("happiness-fill").style.width = selectedCat.getHappiness() + "%"; // Update happiness bar
    }
}

// Update and draw all cats, plants, and text bubbles
function updateGame() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw all plants with the same pixel size (scaled down by 0.2 times)
    plants.forEach(plant => {
        ctx.drawImage(plant.img, plant.x, plant.y, plant.width, plant.height); // Draw each plant
    });

    cats.forEach(cat => {
        const isSelected = cat === selectedCat;  // Check if this is the selected cat
        cat.move();
        cat.draw(isSelected);  // Draw the cat with indication if selected
    });

    textBubbles.forEach((bubble, index) => {
        bubble.draw();
        if (bubble.timer <= 0) {
            textBubbles.splice(index, 1); // Remove expired bubbles
        }
    });

    updateProgressBars(); // Continuously update the progress bars

    requestAnimationFrame(updateGame);
}

// Pat the selected cat
function patCat() {
    if (selectedCat) {
        selectedCat.pats++;
        selectedCat.affection = Math.min(selectedCat.affection + 20, 100); // Increase affection
        textBubbles.push(new TextBubble(`Patted!`, selectedCat));
        saveCats(); // Save the updated state
    }
}

// Feed the selected cat
function feedCat() {
    if (selectedCat) {
        selectedCat.feedCount++;
        selectedCat.hunger = Math.min(selectedCat.hunger + 30, 100); // Increase hunger
        textBubbles.push(new TextBubble(`Fed!`, selectedCat));
        saveCats(); // Save the updated state
    }
}

// Give water to the selected cat
function giveWater() {
    if (selectedCat) {
        selectedCat.thirst = Math.min(selectedCat.thirst + 30, 100); // Increase thirst
        textBubbles.push(new TextBubble(`Water!`, selectedCat));
        saveCats(); // Save the updated state
    }
}

// Give a toy to the selected cat
function giveToy() {
    if (selectedCat) {
        textBubbles.push(new TextBubble(`Toy!`, selectedCat));
        saveCats(); // Save the updated state
    }
}

// Give a snack to the selected cat
function giveSnack() {
    if (selectedCat) {
        selectedCat.hunger = Math.min(selectedCat.hunger + 10, 100); // Increase hunger slightly
        textBubbles.push(new TextBubble(`Snack!`, selectedCat));
        saveCats(); // Save the updated state
    }
}

// Remove the selected cat from the canvas
function removeCat() {
    if (selectedCat) {
        // Remove the selected cat from the cats array
        const index = cats.indexOf(selectedCat);
        if (index > -1) {
            cats.splice(index, 1); // Remove the cat from the array
        }

        // Hide the menu and clear the selection
        selectedCat = null;
        document.getElementById("cat-menu").style.display = "none";
        saveCats(); // Save the updated state
    }
}

// Rename the selected cat
function renameCat() {
    if (selectedCat) {
        const newName = prompt("Enter a new name for the cat:", selectedCat.name);
        if (newName) {
            selectedCat.name = newName;
            document.getElementById("cat-name").innerText = `Cat Name: ${newName}`;
            saveCats(); // Save the updated state
        }
    }
}

// Start the game loop
updateGame();

// Load cats and add plants on page load
window.onload = function() {
    loadCats();
    addPlants();  // Add plants to the canvas on load
    music.play();  // Optionally start music automatically when the game loads
    musicButton.innerText = "⏹️"; // Set to stop icon when music is playing
}
