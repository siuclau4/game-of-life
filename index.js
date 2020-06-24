//define variables
let cellWidth; //cell Width and height
let columns; //number of columns
let rows; //number of rows
let board; //board
let next; //next frame
let difficulty = "";
let gameStarted = false;
let startTime;
let gameTime = 0;
let gameAnimation = "";
let growthRate = 4;
let growthRule = 4;
let cleanPadX = 0; //x-axis of cleaning pad
let cleanPadY = 0; //y-axis of cleaning pad
let padSize = 1;
let padActive = false;
let bg = "transparent";
let score = 0;
let feverEn = 0;

//determine a variable to control the cells growth instead of vary the frame rate
let accumGrowthRate = 0;

const playerRecord = function (difficulty, name, time, score) {
  this.difficulty = difficulty;
  this.name = name;
  this.time = time;
  this.score = score;
};

function setup() {
  //determine Canvas box width and height
  let cnv = createCanvas(480, 480);
  cnv.style.curser = "none";
  cnv.parent("cnv-div");

  //set frame rate
  frameRate(60);

  // Calculate columns and rows
  cellWidth = 24;
  columns = floor(width / cellWidth);
  rows = floor(height / cellWidth);

  // make a 2D array
  board = new Array(columns);
  for (let i = 0; i < columns; i++) {
    board[i] = new Array(rows);
  }

  // Going to use multiple 2D arrays and swap them
  next = new Array(columns);
  for (i = 0; i < columns; i++) {
    next[i] = new Array(rows);
  }
  // init();
}

function draw() {
  background(bg);

  //if control figure more than 10, generate, otherwise stop generate
  if (accumGrowthRate <= 10) {
    accumGrowthRate += growthRate;
  } else {
    background(bg);
    generate();
    accumGrowthRate = 0;
  }

  if (gameStarted) {
    gameTime = Math.floor((new Date() - startTime) / 1000);
  }

  document.querySelector("#time>p").innerHTML = "Time: " + gameTime + " s";

  document.querySelector("#score>p").innerHTML = "Score: " + score;

  if (feverEn > 3000) {
    document.querySelector("#main-container").style.animation =
      "feverColor 0.5s infinite alternate";
    padSize = 2;
    setTimeout(() => {
      document.querySelector("#main-container").style.animation = "none";
      feverEn = 0;
      padSize = 1;
    }, 5000);
  }

  for (let i = 0; i < columns; i++) {
    for (let j = 0; j < rows; j++) {
      if (board[i][j] == 1) {
        fill("#555555");
      } else {
        fill(255);
      }
      stroke(bg);
      rect(i * cellWidth, j * cellWidth, cellWidth, cellWidth, 30);
    }
  }

  //active when mouse pressed / dragged
  if (padActive) {
    fill("#fae");
    rect(
      (cleanPadX - padSize) * cellWidth,
      (cleanPadY - padSize) * cellWidth,
      cellWidth + 2 * padSize * cellWidth,
      cellWidth + 2 * padSize * cellWidth,
      10
    );
  }

  if (checkWin() && gameStarted) {
    noLoop();

    //display win text after 0.5s
    setTimeout(function () {
      document.querySelector("#win").style.display = "flex";
    }, 500);

    //update records in local storage
    document.querySelector("#submit").addEventListener("click", updateRecords);

    // document
    //   .querySelector("#submit")
    //   .removeEventListener("click", updateRecords);
  }
}

// Fill board randomly
function init() {
  for (let i = 0; i < columns; i++) {
    for (let j = 0; j < rows; j++) {
      //   // Filling randomly
      board[i][j] = Math.floor(random(2));
    }
  }

  //define start time
  startTime = new Date();

  //reset score and fever energy
  score = 0;
  feverEn = 0;

  //add class if difficulty is insane
  if (difficulty === "Insane") {
    document.querySelector("#cnv-div").classList.add("turn");
  }

  gameStarted = true;

  document.querySelector("#reset").innerHTML = "Reset";

  loop();
}

// The process of creating the new generation
function generate() {
  // Loop through every spot in our 2D array and check spots neighbors
  for (let x = 0; x < columns; x++) {
    for (let y = 0; y < rows; y++) {
      // Add up all the states in a 3x3 surrounding grid
      let neighbors = 0;
      for (let i = -1; i <= 1; i++) {
        if (x + i != -1 && x + i < columns) {
          for (let j = -1; j <= 1; j++) {
            if (y + j != -1 && y + j < rows) {
              neighbors += board[x + i][y + j];
            }
          }
        }
      }

      //Calculate neighbors and minus self life
      neighbors -= board[x][y];
      // Rules of Life
      if (board[x][y] == 1 && neighbors < 2) {
        next[x][y] = 0;
      }
      // Loneliness
      else if (board[x][y] == 1 && neighbors > growthRule) {
        next[x][y] = 0;
      }
      //Overpopulation
      else if (
        board[x][y] == 0 &&
        (neighbors == 3 || neighbors == growthRule)
      ) {
        next[x][y] = 1;
      }
      // Reproduction
      else {
        next[x][y] = board[x][y];
      } // Stasis
    }
  }

  // Swap
  let temp = board;
  board = next;
  next = temp;
}

function mousePressed() {
  if (
    mouseX < width &&
    mouseY < height &&
    mouseX >= 0 &&
    mouseY >= 0 &&
    gameStarted
  ) {
    clean();
  }
}

function mouseDragged() {
  if (
    mouseX < width &&
    mouseY < height &&
    mouseX >= 0 &&
    mouseY >= 0 &&
    gameStarted
  ) {
    clean();
  }
}

function clean() {
  document.querySelector("canvas").classList.add("no-cursor");

  cleanPadX = Math.floor(mouseX / cellWidth);
  cleanPadY = Math.floor(mouseY / cellWidth);

  for (let i = -padSize; i <= padSize; i++) {
    if (cleanPadX + i >= 0 && cleanPadX + i < columns) {
      for (let j = -padSize; j <= padSize; j++) {
        if (cleanPadY + j >= 0 && cleanPadY + j < rows) {
          if (board[cleanPadX + i][cleanPadY + j] === 1) {
            board[cleanPadX + i][cleanPadY + j] = 0;
            score++;
            feverEn++;
          }
        }
      }
    }
  }

  padActive = true;
}

function mouseReleased() {
  document.querySelector("canvas").classList.remove("no-cursor");
  padActive = false;
}

function checkWin() {
  for (let i = 0; i < columns; i++) {
    for (let j = 0; j < rows; j++) {
      if (board[i][j] == 1) {
        return false;
      }
    }
  }
  return true;
}

document.querySelector("#reset").addEventListener("click", function () {
  if (!gameStarted) {
    init();
  } else {
    gameStarted = false;

    init();
  }
});

let difficulties = document.querySelectorAll(".dropdown-item");
for (let item of difficulties) {
  item.addEventListener("click", function () {
    noLoop();
    gameStarted = false;
    difficulty = item.innerHTML;
    if (difficulty === "Easy") {
      growthRate = 3;
      growthRule = 3;
    } else if (difficulty === "Medium") {
      growthRate = 3;
      growthRule = 4;
    } else if (difficulty === "Hard") {
      growthRate = 4;
      growthRule = 4;
    } else if (difficulty === "Extreme" || difficulty === "Insane") {
      growthRate = 10;
      growthRule = 4;
    }

    //remove class if not insane
    if (difficulty !== "Insane") {
      document.querySelector("#cnv-div").classList.remove("turn");
    }

    document.querySelector("#reset").disabled = false;
  });
}

//fill in High Score
function fillInHighScore() {
  let jsonRecord = localStorage.getItem("game-of-life-records");

  table1 = JSON.parse(jsonRecord);

  //show top 10 only
  for (let i = 0; i < Math.min(table1.length, 10); i++) {
    let tr = document.createElement("tr");
    let keys = Object.keys(table1[0]);
    let th = document.createElement("th");
    th.appendChild(document.createTextNode(i + 1));
    th.scope = "row";
    tr.appendChild(th);
    for (let key of keys) {
      let td = document.createElement("td");

      td.appendChild(document.createTextNode(table1[i][key]));

      tr.appendChild(td);
    }
    document.querySelector("#high-score tbody").appendChild(tr);
  }
}

//show high score
document
  .querySelector("#high-score-btn")
  .addEventListener("click", function () {
    fillInHighScore();
    document.querySelector("#table-div").style.display = "flex";
  });

//back button onclick
document.querySelector("#back-btn").addEventListener("click", function () {
  document.querySelector("#table-div").style.display = "none";

  //replace tbody by empty tbody
  document.querySelector("#high-score tbody").innerHTML = "";
  // let tbody = document.querySelector("#high-score tbody");
  // let new_tbody = document.createElement("tbody");
  // document
  //   .querySelector("#high-score tbody")
  //   .parentNode.replaceChild(new_tbody, tbody);
});

function updateRecords() {
  console.log("submit called");
  if (document.querySelector("#input-name").value !== "") {
    let newPlayerRecord = new playerRecord(
      difficulty,
      document.querySelector("#input-name").value,
      gameTime,
      score
    );

    let records = JSON.parse(localStorage.getItem("game-of-life-records"));
    if (records === null) {
      records = [newPlayerRecord];
    } else {
      records.push(newPlayerRecord);
    }

    records.sort((a, b) => {
      let order = ["Insane", "Extreme", "Hard", "Medium", "Easy"];
      if (a.difficulty !== b.difficulty && a.time !== b.time) {
        return order.indexOf(a.difficulty) - order.indexOf(b.difficulty);
      } else if (a.time !== b.time) {
        return a.time - b.time;
      } else {
        return b.score - a.score;
      }
    });

    let jsonRecord = JSON.stringify(records);
    localStorage.setItem("game-of-life-records", jsonRecord);
  }
  document.querySelector("#win").style.display = "none";
  document.querySelector("#input-name").value = "";
  gameStarted = false;
}
