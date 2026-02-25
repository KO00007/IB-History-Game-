class Game {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.entities = [];
    this.scrollX = 0;
    this.scrollY = 0;
    this.lastTime = 0;
    this.keys = {};
    this.state = 'PLAYING'; // PLAYING, TRIVIA, GAMEOVER
    
    this.score = 0;
    this.lives = 3;
    this.spawnTimer = 0;
    this.spawnInterval = 5.0;
    this.triviaInterval = null;
    this.triviaTimeLeft = 0;
    this.currentQuestion = null;
    
    this.questionBank = [
      {q:"The primary objective of Truman’s containment policy was to:", choices:["Roll back communism everywhere", "Prevent further expansion of communism", "Destroy the Soviet Union militarily", "End colonialism in Latin America"], correct:"Prevent further expansion of communism"},
      {q:"The Truman Doctrine signaled that the United States would:", choices:["Avoid involvement in foreign conflicts", "Support democratic governments only in Europe", "Provide aid to countries resisting communism", "Recognize Soviet influence in Eastern Europe"], correct:"Provide aid to countries resisting communism"},
      {q:"The United States entered the Korean War primarily to:", choices:["Protect Japanese territory", "Contain communism in Asia", "Expand US territory", "Challenge China directly"], correct:"Contain communism in Asia"},
      {q:"The Korean War ended with:", choices:["Communist victory over all Korea", "Permanent peace treaty", "Armistice maintaining division at the 38th parallel", "Immediate reunification"], correct:"Armistice maintaining division at the 38th parallel"},
      {q:"The 'New Look' relied heavily on:", choices:["Conventional ground forces", "Nuclear deterrence", "Isolationism", "Economic sanctions only"], correct:"Nuclear deterrence"},
      {q:"US involvement escalated significantly after:", choices:["Korean War armistice", "Gulf of Tonkin incident", "Cuban Missile Crisis", "Marshall Plan"], correct:"Gulf of Tonkin incident"},
      {q:"President Jimmy Carter emphasized:", choices:["Massive retaliation", "Human rights in foreign policy", "Isolationism", "Increased covert interventions"], correct:"Human rights in foreign policy"},
      {q:"Canada’s Cold War role is best described as:", choices:["Superpower rival", "Middle power mediator", "Isolationist state", "Revolutionary exporter"], correct:"Middle power mediator"}
    ];
    
    this.setupInput();
    this.reset();
    
    document.getElementById('restartBtn').onclick = () => this.reset();
  }

  reset() {
    this.entities = [];
    this.score = 0;
    this.lives = 3;
    this.spawnInterval = 5.0;
    this.state = 'PLAYING';
    this.keys = {};
    this.updateHUD();
    
    document.getElementById('gameOverModal').classList.add('hidden');
    document.getElementById('triviaModal').classList.add('hidden');
    
    this.player = new Player(this.canvas.width / 2, this.canvas.height / 2);
    this.entities.push(this.player);
    
    for(let i=0; i<4; i++) this.spawnAsteroid();
    this.lastTime = performance.now();
  }

  setupInput() {
    window.addEventListener('keydown', e => {
      this.keys[e.key] = true;
      if (e.key === ' ' && this.state === 'PLAYING' && this.player && this.player.shootCooldown <= 0) {
        this.shoot();
      }
    });
    window.addEventListener('keyup', e => {
      this.keys[e.key] = false;
    });
  }
  
  shoot() {
    const b = new Bullet(this.player.cx + Math.cos(this.player.angle)*15, this.player.cy + Math.sin(this.player.angle)*15, this.player.angle);
    this.entities.push(b);
    this.player.shootCooldown = 0.25;
  }

  spawnAsteroid() {
    let x, y;
    if (Math.random() < 0.5) {
      x = Math.random() < 0.5 ? 0 : this.canvas.width;
      y = Math.random() * this.canvas.height;
    } else {
      x = Math.random() * this.canvas.width;
      y = Math.random() < 0.5 ? 0 : this.canvas.height;
    }
    this.entities.push(new Asteroid(x, y, 3));
  }

  screenToWorld(canvasX, canvasY) {
    return { x: canvasX + this.scrollX, y: canvasY + this.scrollY };
  }

  worldToScreen(worldX, worldY) {
    return { x: worldX - this.scrollX, y: worldY - this.scrollY };
  }

  getObjectAt(canvasX, canvasY) {
    const world = this.screenToWorld(canvasX, canvasY);
    for (const entity of this.entities) {
      const b = entity.getBounds();
      if (world.x >= b.x && world.x <= b.x + b.width &&
          world.y >= b.y && world.y <= b.y + b.height) {
        return entity;
      }
    }
    return null;
  }
  
  circleIntersect(x1, y1, r1, x2, y2, r2) {
    const dx = x1 - x2;
    const dy = y1 - y2;
    const dist = Math.sqrt(dx*dx + dy*dy);
    return dist < (r1 + r2);
  }

  update(dt) {
    if (this.state !== 'PLAYING') return;

    this.spawnTimer += dt;
    if (this.spawnTimer >= this.spawnInterval) {
      this.spawnTimer = 0;
      this.spawnInterval = Math.max(1.5, this.spawnInterval * 0.95);
      this.spawnAsteroid();
    }

    for (let i = this.entities.length - 1; i >= 0; i--) {
      const entity = this.entities[i];
      entity.update(dt, this.canvas, this.keys);
      if (entity.name === 'Bullet' && entity.life <= 0) {
        this.entities.splice(i, 1);
      }
    }

    for (let i = this.entities.length - 1; i >= 0; i--) {
      const a = this.entities[i];
      if (a.name === 'Asteroid') {
        for (let j = this.entities.length - 1; j >= 0; j--) {
          const b = this.entities[j];
          if (b.name === 'Bullet') {
            if (this.circleIntersect(a.cx, a.cy, a.radius, b.x+2, b.y+2, 2)) {
              this.entities.splice(j, 1);
              this.destroyAsteroid(a, i);
              return; 
            }
          }
        }
        if (this.player && this.player.invulnerable <= 0) {
          if (this.circleIntersect(a.cx, a.cy, a.radius, this.player.cx, this.player.cy, 12)) {
            this.loseLife();
          }
        }
      }
    }
  }

  destroyAsteroid(asteroid, index) {
    this.entities.splice(index, 1);
    if (asteroid.size > 1) {
      this.entities.push(new Asteroid(asteroid.cx, asteroid.cy, asteroid.size - 1));
      this.entities.push(new Asteroid(asteroid.cx, asteroid.cy, asteroid.size - 1));
    }
    this.triggerTrivia();
  }

  loseLife() {
    this.lives--;
    this.updateHUD();
    if (this.lives <= 0) {
      this.endGame("Ship Destroyed.");
    } else {
      this.player.cx = this.canvas.width / 2;
      this.player.cy = this.canvas.height / 2;
      this.player.vx = 0;
      this.player.vy = 0;
      this.player.invulnerable = 3.0;
    }
  }

  triggerTrivia() {
    this.state = 'TRIVIA';
    this.keys = {};
    this.currentQuestion = this.questionBank[Math.floor(Math.random() * this.questionBank.length)];
    
    document.getElementById('questionText').innerText = this.currentQuestion.q;
    const choicesDiv = document.getElementById('choices');
    choicesDiv.innerHTML = '';
    
    const shuffled = [...this.currentQuestion.choices].sort(() => Math.random() - 0.5);
    
    shuffled.forEach(choice => {
      const btn = document.createElement('button');
      btn.innerText = choice;
      btn.onclick = () => this.handleAnswer(choice);
      choicesDiv.appendChild(btn);
    });
    
    document.getElementById('triviaModal').classList.remove('hidden');
    this.triviaTimeLeft = 10;
    document.getElementById('timerDisplay').innerText = this.triviaTimeLeft;
    
    this.triviaInterval = setInterval(() => {
      this.triviaTimeLeft--;
      document.getElementById('timerDisplay').innerText = this.triviaTimeLeft;
      if (this.triviaTimeLeft <= 0) {
        clearInterval(this.triviaInterval);
        this.endGame("Time expired.");
      }
    }, 1000);
  }

  handleAnswer(choice) {
    clearInterval(this.triviaInterval);
    document.getElementById('triviaModal').classList.add('hidden');
    
    if (choice === this.currentQuestion.correct) {
      this.score += 100;
      this.updateHUD();
      this.state = 'PLAYING';
      this.lastTime = performance.now();
    } else {
      this.endGame("Incorrect. Knowledge Failure.");
    }
  }

  endGame(reason) {
    this.state = 'GAMEOVER';
    document.getElementById('triviaModal').classList.add('hidden');
    document.getElementById('gameOverReason').innerText = reason;
    document.getElementById('gameOverModal').classList.remove('hidden');
  }

  updateHUD() {
    document.getElementById('scoreDisplay').innerText = `SCORE: ${this.score}`;
    document.getElementById('livesDisplay').innerText = `LIVES: ${this.lives}`;
  }

  draw() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    for (const entity of this.entities) entity.draw(this.ctx);
  }

  start() {
    this.lastTime = performance.now();
    const gameLoop = (timestamp) => {
      const dt = Math.min((timestamp - this.lastTime) / 1000, 0.1);
      this.lastTime = timestamp;
      this.update(dt);
      this.draw();
      requestAnimationFrame(gameLoop);
    };
    requestAnimationFrame(gameLoop);
  }
}
