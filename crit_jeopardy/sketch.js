

let rows = 6; // heater plus clues
let cols = 5; //5 categories
let cellWidth;
let cellHeight;
let currentClue = null; //keeps track of the current clue
let dailyDoubleReady = false;

//tiemr controls
let gameStartTime = 0;
let finalJeopardyTime = 6.5 * 60 * 1000;
let gameDuration = 8 * 60 * 1000;
let gameOver = false;
let finalJeopardy = false;
let finalJeopardySequence;

//for smooth transitons
let transitionProgress = 0;
let isTransitioning = false;
//manages the game state
let gameState = "board";

//array of categories
let categories = [];

//sounds
let jeopardyTheme;
let dailyDoubleSound;
let timeUpSound;

function preload () {
  jeopardyTheme = loadSound("data/Theme.mp3");
  dailyDoubleSound = loadSound("data/DailyDouble.mp3");
  timeUpSound = loadSound("data/TimesUp.mp3")
}
function setup() {
  createCanvas(innerWidth, innerHeight); //sets the canvas to the size of the window

  //scales the width and height of the cells to be porportional to the size of the screen
  cellWidth = width / cols;
  cellHeight = height / rows;


  //create all the categories and clues and add them to the categories array
  categories.push(
    new Category("POMO Music", [
      new Clue(
        200,
        "This band collapsed high and low culture by writing Master of Puppets in Sonata Allegro form",
        "Who are Metallica?"
      ),
      new Clue(
        400,
        "Taylor Swift is a master at creating these types of events that, “come about because someone has planned, planted, or incited it.”",
        "What are pseudo-events?"
      ),
      new Clue(
        600,
        "Western music theory can be considered this, or an overarching account or interpretation of events and circumstances that provides a pattern or structure for people’s beliefs and gives meaning to their experiences.",
        "What is a metanarrative?"
      ),
      new Clue(
        800,
        "Covering a song is a form of this, meaning a work imitates a previous work",
        "What is Pastiche?"
      ),
      new Clue(1000, "Name that tune!", "What is 4'33?"),
    ]),

    new Category("Semiotics and Structurism", [
      new Clue(
        200,
        "This of a red solo cup is a massive quintessential college party is about to happen",
        "What is myth?"
      ),
      new Clue(
        400,
        "For every preferred reading, there is one of these.",
        "What is an oppositional reading?"
      ),
      new Clue(
        600,
        "Punks, Ravers, and Mods are different types of these",
        "What are subcultures?"
      ),
      new Clue(
        800,
        "Barth’s theory of language and myth suggests SIGNIFIER + SIGNIFIED = this",
        "What is sign?"
      ),
      new Clue(
        1000,
        "This vocab word means a form of dominance that seeks to simultaneously permit and suppress oppositional voices",
        "What is Hegemony?"
      ),
    ]),
    new Category("[Redacted]", [
      new Clue(
        200,
        "Masculinity is in crisis because of [redacted], or in simple terms, the belief that all genders should be equal",
        "What is feminism?"
      ),
      new Clue(
        400,
        "American media heavily influencing the rest of the world is an example of cultural [redacted] which we did not discuss because of its ties to the other kind of [redacted]",
        "What is imperialism?"
      ),
      new Clue(
        600,
        "[Redacted] is known for the communist manifesto and offering a lens that we DEFINITELY DID NOT EXPLORE this semester",
        "Who is Karl Marx?"
      ),
      new Clue(
        800,
        "Hall’s “Grammar of [redacted]” argument highlights how [redacted] tendencies lead to gross misrepresentations of minority groups",
        "What is race/racism?"
      ),
      new Clue(
        1000,
        "[Redacted] is the assertion that masculine and feminine can be liberated from social norms by being enacted as performances that blur traditional lines",
        "What is gender trouble?"
      ),
    ]),
    new Category("Consumerism", [
      new Clue(
        200,
        "This silly term refers to the degradation of platforms over time, and was word of the year in 2023!",
        "What is enshittification?"
      ),
      new Clue(
        400,
        "By scrolling on your phone while watching TV, you become this type of audience member.",
        "What is a diffused audience?"
      ),
      new Clue(
        600,
        "According to Bourdieu, college students have low economic capital but high this",
        "What is Cultural Capital?"
      ),
      new Clue(
        800,
        "Social media platforms have enabled many consumers to also become these, which is a school of thought followed by Jenkins, Silverstone, Abercrombie and Longhurst",
        "What are producers?"
      ),
      new Clue(
        1000,
        "I engage in this French term when I do homework in my office hours",
        "What is la perrugue?"
      ),
    ]),

    new Category("Name that Theorist!", [
      new Clue(
        200,
        "He postulated the medium is the message",
        "Who is McLuhan?"
      ),
      new Clue(
        400,
        "He brought us the theory of discourse in relation to panopticism",
        "Who is Focault?"
      ),
      new Clue(
        600,
        "She brought us the theory of the male gaze",
        "Who is Mulvey?"
      ),
      new Clue(
        800,
        "These two brought us Manufacturing Consent",
        "Who are Herman and Chomsky?"
      ),
      new Clue(1000, "He brought us the theory of Orientalism", "Who is Said?"),
    ])
  );

  let allClues = [];
  for (let category of categories) {
    for (let clue of category.clues) {
      allClues.push(clue);
    }
  }
  let potentialDailyDouble = allClues.filter((clue) => clue.value > 400);
  let dailyDouble = random(potentialDailyDouble);
  dailyDouble.isDailyDouble = true;

  finalJeopardySequence = new FinalJeopardy("UT life and traditions", "Has everyone in your team completed the CIS for this class?")
  gameStartTime = millis();
}

function draw() {
  background(0, 0, 204);

  let timeElapsed = millis() - gameStartTime;
  if (
    !finalJeopardy && (timeElapsed >= finalJeopardyTime ||
    allCluesAnswered())
  ) {

    

    finalJeopardy = true;
    finalJeopardySequence.start()
    gameState = "finalJeopardy";
    
  }

  if (!gameOver && timeElapsed >= gameDuration) {
    gameOver = true;
    gameState = "gameOver";
    gameOverScreen();
    return;
  }
  if (gameState === "board") {
    drawGrid();
  } else if (gameState === "question" && currentClue) {
    drawFullScreen(currentClue.question);
  } else if (gameState === "dailyDoubleReveal") {
    drawDailyDoubleReveal();
  } else if (gameState === "answer" && currentClue) {
    drawFullScreen(currentClue.answer);
  } else if (gameState.startsWith("transition")) {
    handleTransition();
  }
  else if(gameState === "finalJeopardy"){
    finalJeopardySequence.update();
    finalJeopardySequence.draw();
  }
  else if(gameState ==="gameOver"){
    gameOverScreen();
  }
}

function drawGrid() {
  //aligns text, sets text to wrap, and sets text size
  textAlign(CENTER, CENTER);
  textWrap(WORD);
  textSize(36);

  //iterates through all the categories
  for (let i = 0; i < categories.length; i++) {
    let x = i * cellWidth; //this is used to calculate the x value

    //header
    fill(0, 0, 204); //jeopardy blue
    strokeWeight(5); //thicker stroke to emulate the jeopardy feel
    rect(x, 0, cellWidth, cellHeight); //rectangles are drawn at the x position

    //text
    fill(255);
    text(categories[i].name, x + 5, 5, cellWidth - 10, cellHeight - 10);

    //iterates through all clues in a cetegory
    for (let j = 0; j < categories[i].clues.length; j++) {
      let y = (j + 1) * cellHeight;
      let clue = categories[i].clues[j]; //gets the current clue

      fill(0, 0, 204);
      rect(x, y, cellWidth, cellHeight);

      fill(255);
      textAlign(CENTER, CENTER);
      textWrap(WORD);

      if (!clue.revealed) {
        text(clue.value, x, y, cellWidth, cellHeight); //
      }
    }
  }
}

function mousePressed() {
  userStartAudio();
  if(gameState === "finalJeopardy"){
    finalJeopardySequence.next();
    return;
  }
  if (gameState === "dailyDoubleReveal") {
    if (dailyDoubleReady) {
      gameState = "transitionToQuestion";
      isTransitioning = true;
      transitionProgress = 0;
      dailyDoubleReady = false;
    }
    return;
  }
  if (gameState === "board") {
    let col = floor(mouseX / cellWidth);
    let row = floor(mouseY / cellHeight);

    if (col < 0 || col >= categories.length) {
      return;
    }
    if (row <= 0 || row > categories[col].clues.length) {
      return;
    }

    currentClue = categories[col].clues[row - 1];

    if (currentClue.isDailyDouble) {
      gameState = "dailyDoubleReveal";
      dailyDoubleReady = true;

      if(!dailyDoubleSound.isPlaying()){
        dailyDoubleSound.play();
      }
    } else {
      gameState = "transitionToQuestion";
    }
    isTransitioning = true;
    transitionProgress = 0;
  } else if (gameState === "question") {
    gameState = "transitionToAnswer";
    isTransitioning = true;
    transitionProgress = 0;
  } else if (gameState == "answer") {
    currentClue.revealed = true;
    gameState = "transitionToBoard";
    isTransitioning = true;
    transitionProgress = 0;
  }
}

function drawFullScreen(textContent) {
  background(0, 0, 204);
  let scaleAmount = lerp(0.8, 1, transitionProgress);

  push();
  translate(width / 2, height / 2);
  scale(scaleAmount);

  fill(255);
  textAlign(CENTER, CENTER);
  textSize(36);
  textWrap(WORD);

  text(textContent, -width * 0.4, height * -0.3, width * 0.8, height * 0.6);
  pop();
}

function handleTransition() {
  transitionProgress += 0.05;
  if (gameState === "transitionToQuestion") {
    drawGrid();
  } else if (gameState === "transitionToAnswer") {
    drawFullScreen(currentClue.question);
  } else if (gameState === "transitionToBoard") {
    drawFullScreen(currentClue.answer);
  }

  fill(0, 0, 0, transitionProgress * 255);
  rect(0, 0, width, height);

  if (transitionProgress >= 1) {
    if (gameState === "transitionToQuestion") {
      gameState = "question";
    } else if (gameState === "transitionToAnswer") {
      gameState = "answer";
    } else if (gameState === "transitionToBoard") {
      gameState = "board";
      currentClue = null;
    }
    isTransitioning = false;
  }
}

function drawDailyDoubleReveal() {
  background(0, 0, 204);

  fill(255, 204, 0);
  textAlign(CENTER, CENTER);
  textSize(60);
  text("DAILY DOUBLE!", width / 2, height / 2 - 50);

  fill(255);
  textSize(24);
  text("Get ready...", width / 2, height / 2 - 130);
}

function allCluesAnswered() {
  for (let category of categories) {
    for (let clue of category.clues) {
      if (!clue.revealed) {
        return false;
      }
    }
  }
  return true;
}

function gameOverScreen(){
  if(!jeopardyTheme.isPlaying()){
    jeopardyTheme.loop();
  }
  background(0, 0, 240);

  textAlign(CENTER, CENTER)
  textSize(60);
  fill(255, 204, 0);
  text("Thanks for playing!", width / 2, height / 2);
}

class Clue {
  /*
  a class for clues 
  has a constructor for clues that have a value, question, and answer
  has a constructor for clues that have a value, question, answer, and audio 
  is daily double?? - stretch goal
  */

  constructor(value, question, answer, audio = null) {
    //clues with audio
    this.value = value;
    this.question = question;
    this.answer = answer;
    this.audio = audio;
    this.revealed = false;

    this.isDailyDouble = false;
  }
}

class Category {
  //Category takes in a name and an array of clues
  constructor(name, clues) {
    this.name = name;
    this.clues = clues;
  }
}

class FinalJeopardy {
  constructor(category, clue) {
    this.category = category;
    this.clue = clue;

    this.state = "intro";
    this.transition = 0;
    this.active = false;
  }

  start() {
    this.active = true;
    this.state = "intro";
    this.transition = 0;
  }

  update() {
    if (!this.active) {return;}
    this.transition = min(this.transition + 0.02 , 1)

  }
  draw(){
    if (!this.active) {
      return;
    }
    if(this.state === "intro"){ this.drawIntro();}
    else if(this.state === "category"){this.drawCategory();}
    else if(this.state ==="question"){this.drawQuestion();}
  }

  drawIntro(){
    background(0, 0, 240);
    let zoom = lerp(1.5, 1, this.transition);

    push();
    translate(width /2, height /2);
    scale(zoom);
    translate(-width / 2, -height / 2);

    fill(255, 204, 0);
    textAlign(CENTER, CENTER);
    textSize(60);
    text("FINAL JEOPARDY", width / 2, height / 2 - 40);
    pop();

    fill(0, 255 - this.transition * 255);
    rect(0, 0, width, height);
  }

  drawCategory() {
    background(0, 0, 204);
    fill(255);
    textAlign(CENTER, CENTER);
    textSize(36);
    textWrap(WORD);
    let w = width * 0.8;
    let h = height * 0.6;
    text(this.category, width / 2 - w / 2, height / 2 - h / 2, w, h)

    fill(0, 255 - this.transition * 255);
    rect(0, 0, width, height);
  }

  drawQuestion() {
    background(0, 0, 204);
    fill(255);
    textAlign(CENTER, CENTER);
    textSize(36);
    textWrap(WORD);
    let w = width * 0.8;
    let h = height * 0.6;
    text(this.clue, width / 2 - w / 2, height / 2 - h / 2, w, h)

    fill(0, 255 - this.transition * 255);
    rect(0, 0, width, height);

    if(!jeopardyTheme.isPlaying()){
      jeopardyTheme.play();
    }
  }

  next() {
    if(this.state === "intro"){
      this.state = "category";
      this.transition = 0
    }
   else if(this.state === "category"){
      this.state = "question";
      this.transition = 0
    }
    else if(this.state === "question"){
      gameOver = true;
      gameState = "gameOver"
      this.transition = 0;
    }

  }

}
