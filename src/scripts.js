function setLang(lang) {
  const de = document.getElementById("btn-de");
  const en = document.getElementById("btn-en");
  const label = document.getElementById("label");

  if (lang === "de") {
    de.className =
      "px-4.5 py-1.5 rounded-full text-sm font-bold tracking-wide transition-all duration-200 bg-white text-gray-900 border border-gray-700 cursor-pointer";
    en.className =
      "px-4.5 py-1.5 rounded-full text-sm font-bold tracking-wide transition-all duration-200 text-red-700 bg-transparent border-none cursor-pointer";
    label.textContent = "Deutsch";
  } else {
    en.className =
      "px-4.5 py-1.5 rounded-full text-sm font-bold tracking-wide transition-all duration-200 bg-white text-gray-900 border border-gray-700 cursor-pointer";
    de.className =
      "px-4.5 py-1.5 rounded-full text-sm font-bold tracking-wide transition-all duration-200 text-red-700 bg-transparent border-none cursor-pointer";
    label.textContent = "English";
  }
}

let KEY_SPACE = false;
let KEY_UP = false;
let KEY_DOWN = false;

let backgroundImage = new Image();
let canvas = document.getElementById("canvas");
let ctx;

let ufos = [];
let bullets = [];
let score = 0;
let gameOver = false;
let gameRunning = false;
let animationId = null;
let ufoInterval = null;

let lastShot = 0;
let shotCooldown = 300;

let rocket = {
  x: 30,
  y: 200,
  width: 150,
  height: 60,
  src: "assets/mongames-ship-1414820_1920.png",
  img: new Image(),
};

document.addEventListener("keydown", function (e) {
  const key = e.key.toLowerCase();

  if (e.code === "Space") KEY_SPACE = true;
  if (key === "arrowup" || key === "w") KEY_UP = true;
  if (key === "arrowdown" || key === "s") KEY_DOWN = true;
  if (e.keyCode == 32) KEY_SPACE = true;
  if (e.keyCode == 38) KEY_UP = true;
  if (e.keyCode == 40) KEY_DOWN = true;
});

document.addEventListener("keyup", function (e) {
  const key = e.key.toLowerCase();

  if (e.code === "Space") KEY_SPACE = false;
  if (key === "arrowup" || key === "w") KEY_UP = false;
  if (key === "arrowdown" || key === "s") KEY_DOWN = false;
  if (e.keyCode == 32) KEY_SPACE = false;
  if (e.keyCode == 38) KEY_UP = false;
  if (e.keyCode == 40) KEY_DOWN = false;
});

function initGame() {
  ctx = canvas.getContext("2d");
  loadImages();
  setupMobileControls();
  drawStartScreen();
}

function loadImages() {
  backgroundImage.src = "assets/spacebg.jpg";
  rocket.img.src = rocket.src;
}

function resetGameState() {
  ufos = [];
  bullets = [];
  score = 0;
  gameOver = false;
  gameRunning = true;
  lastShot = 0;

  rocket.x = 30;
  rocket.y = 200;
  rocket.img.src = rocket.src;
}

function startGame() {
  if (gameRunning) return;

  resetGameState();

  const startBtn = document.getElementById("start-btn");
  const restartBtn = document.getElementById("restart-btn");

  if (startBtn) startBtn.classList.add("hidden");
  if (restartBtn) restartBtn.classList.add("hidden");

  if (ufoInterval) {
    clearInterval(ufoInterval);
  }

  ufoInterval = setInterval(createUfo, 2000);
  gameLoop();
}

function restartGame() {
  stopGameLoop();
  startGame();
}

function stopGameLoop() {
  gameRunning = false;

  if (animationId) {
    cancelAnimationFrame(animationId);
    animationId = null;
  }

  if (ufoInterval) {
    clearInterval(ufoInterval);
    ufoInterval = null;
  }
}

function gameLoop() {
  if (!gameRunning) return;

  update();
  checkCollisions();
  draw();

  if (gameOver) {
    stopGameLoop();
    drawGameOver();

    const restartBtn = document.getElementById("restart-btn");
    if (restartBtn) restartBtn.classList.remove("hidden");
    return;
  }

  animationId = requestAnimationFrame(gameLoop);
}

function update() {
  if (KEY_UP) {
    rocket.y -= 5;
  }

  if (KEY_DOWN) {
    rocket.y += 5;
  }

  if (rocket.y < 0) {
    rocket.y = 0;
  }

  if (rocket.y + rocket.height > canvas.height) {
    rocket.y = canvas.height - rocket.height;
  }

  if (KEY_SPACE) {
    shoot();
  }

  ufos.forEach(function (ufo) {
    if (!ufo.isExploding) {
      ufo.x -= ufo.speed;
    }
  });

  bullets.forEach(function (bullet) {
    bullet.x += bullet.speed;
  });

  ufos = ufos.filter(function (ufo) {
    if (ufo.isExploding) {
      return Date.now() - ufo.explosionTime < 300;
    }
    return ufo.x + ufo.width > 0;
  });

  bullets = bullets.filter(function (bullet) {
    return bullet.x < canvas.width;
  });
}

function setupMobileControls() {
  const btnUp = document.getElementById("btn-up");
  const btnDown = document.getElementById("btn-down");
  const btnShoot = document.getElementById("btn-shoot");

  if (!btnUp || !btnDown || !btnShoot) return;

  btnUp.addEventListener("touchstart", function (e) {
    e.preventDefault();
    KEY_UP = true;
  });

  btnUp.addEventListener("touchend", function (e) {
    e.preventDefault();
    KEY_UP = false;
  });

  btnDown.addEventListener("touchstart", function (e) {
    e.preventDefault();
    KEY_DOWN = true;
  });

  btnDown.addEventListener("touchend", function (e) {
    e.preventDefault();
    KEY_DOWN = false;
  });

  btnShoot.addEventListener("touchstart", function (e) {
    e.preventDefault();
    KEY_SPACE = true;
  });

  btnShoot.addEventListener("touchend", function (e) {
    e.preventDefault();
    KEY_SPACE = false;
  });
}

function shoot() {
  let now = Date.now();

  if (now - lastShot > shotCooldown) {
    let bullet = {
      x: rocket.x + rocket.width - 10,
      y: rocket.y + rocket.height / 2 - 5,
      width: 20,
      height: 10,
      speed: 10,
      color: "yellow",
    };

    bullets.push(bullet);
    lastShot = now;
  }
}

function createUfo() {
  let ufo = {
    x: canvas.width,
    y: Math.random() * (canvas.height - 80),
    width: 120,
    height: 70,
    speed: 3 + Math.random() * 3,
    src: "assets/alien.png",
    img: new Image(),
    isExploding: false,
    explosionTime: 0,
  };

  ufo.img.src = ufo.src;
  ufos.push(ufo);
}

function checkCollisions() {
  ufos.forEach(function (ufo) {
    if (!ufo.isExploding && isColliding(rocket, ufo)) {
      rocket.img.src = "assets/boom.png";
      gameOver = true;
    }
  });

  bullets.forEach(function (bullet) {
    ufos.forEach(function (ufo) {
      if (!ufo.isExploding && isColliding(bullet, ufo)) {
        bullets = bullets.filter(function (b) {
          return b != bullet;
        });

        ufo.img.src = "assets/boom.png";
        ufo.isExploding = true;
        ufo.explosionTime = Date.now();

        score++;
      }
    });
  });
}

function isColliding(a, b) {
  return (
    a.x < b.x + b.width &&
    a.x + a.width > b.x &&
    a.y < b.y + b.height &&
    a.y + a.height > b.y
  );
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(backgroundImage, 0, 0, canvas.width, canvas.height);
  ctx.drawImage(rocket.img, rocket.x, rocket.y, rocket.width, rocket.height);

  ufos.forEach(function (ufo) {
    ctx.drawImage(ufo.img, ufo.x, ufo.y, ufo.width, ufo.height);
  });

  bullets.forEach(function (bullet) {
    ctx.fillStyle = bullet.color;
    ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
  });

  ctx.fillStyle = "white";
  ctx.font = "30px Arial";
  ctx.fillText("Score: " + score, 20, 40);
}

function drawStartScreen() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(backgroundImage, 0, 0, canvas.width, canvas.height);

  ctx.fillStyle = "rgba(0, 0, 0, 0.55)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = "white";
  ctx.font = "50px Arial";
  ctx.fillText("SPACE ATTACK", 190, 170);

  ctx.font = "24px Arial";
  ctx.fillText("Steuerung:", 290, 230);
  ctx.fillText("Pfeil hoch (W) / runter (S) = bewegen", 195, 270);
  ctx.fillText("Leertaste = schießen", 245, 310);
  ctx.fillText("Drücke Start", 280, 360);
}

function drawGameOver() {
  draw();

  ctx.fillStyle = "rgba(0, 0, 0, 0.6)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = "red";
  ctx.font = "60px Arial";
  ctx.fillText("GAME OVER", 170, 220);

  ctx.fillStyle = "white";
  ctx.font = "30px Arial";
  ctx.fillText("Score: " + score, 285, 280);
}

window.onload = initGame;
