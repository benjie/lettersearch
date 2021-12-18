const formEl = document.getElementById("form");
const guessEl = document.getElementById("guess");
const logEl = document.getElementById("log");

const LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
/** The letter to replace a match with; must not be in `LETTERS` */
const MATCHED = "_";

const MATCH = "X";
const PARTIAL_MATCH = "/";
const NO_MATCH = "_";

/** @type {boolean} */
const repeats = false;
/** @type {number} */
const colours = 6;
/** @type {number} */
const width = 4;
/** @type {boolean} */
const blacksInRightPlace = true;
/** @type {number} */
const turnLimit = 30;

let pattern = "";
let attempts = 0;
let allowedLetters = "";

function log(message) {
  logEl.value = message + "\n" + logEl.value;
}

function startGame() {
  // First; check the settings are valid
  if (width < 2) {
    throw new Error("Not wide enough");
  }
  if (colours < 2) {
    throw new Error("Too few colours");
  }
  if (!repeats && colours < width) {
    throw new Error(
      "There's not enough colours for this width without repeats"
    );
  }
  if (colours > LETTERS.length) {
    throw new Error("Too many colours");
  }

  // Now reset
  logEl.value = "";
  guessEl.value = "";
  allowedLetters = "";
  pattern = "";
  attempts = 0;
  guessEl.focus();

  // Come up with a pattern
  allowedLetters = LETTERS.substring(0, colours);
  let remainingLetters = allowedLetters;
  for (let i = 0; i < width; i++) {
    const index = Math.floor(Math.random() * remainingLetters.length);
    pattern = pattern + remainingLetters[index];
    if (!repeats) {
      // Remove this letter from remainingLetters
      remainingLetters =
        remainingLetters.substring(0, index) +
        remainingLetters.substring(index + 1);
    }
  }

  guessEl.placeholder = allowedLetters[0].repeat(width);

  log(
    `Rules: colours = ${allowedLetters}; ${
      !repeats ? "no repeats" : "repeats allowed"
    }; width ${width}`
  );
  log(`Pattern generated; take your guess:${" _".repeat(width)}`);
}

function submitGuess(event) {
  event.preventDefault();

  // Tidy up their guess
  const guess = guessEl.value.toUpperCase().replace(/\s+/g, "");

  // Check the guess is valid
  if (guess.length !== width) {
    // Invalid
    log(`Your guess should be exactly ${width} letters from ${allowedLetters}`);
    return;
  }
  for (let i = 0; i < width; i++) {
    if (!allowedLetters.includes(guess[i])) {
      // Invalid
      log(
        `${guess[i]} is not an allowed letter; your letters must be in this list: ${allowedLetters}`
      );
      return;
    }
  }

  // It's valid; increase attempts
  attempts++;

  // We want to be able to replace letters with _ once consumed, so turn it
  // into an array.
  let remainingPattern = pattern.split("");

  // Analyze their guess; first the "right colour right position":
  let correctColourAndPosition = [];
  for (let i = 0; i < width; i++) {
    if (guess[i] === remainingPattern[i]) {
      remainingPattern[i] = MATCHED;
      correctColourAndPosition.push(true);
    } else {
      correctColourAndPosition.push(false);
    }
  }
  // Now the remaining correct positions:
  let correctColourOnly = [];
  for (let i = 0; i < width; i++) {
    let matches = false;
    for (let j = 0; j < width; j++) {
      if (guess[i] === remainingPattern[j]) {
        remainingPattern[j] = MATCHED;
        matches = true;
        break;
      }
    }
    correctColourOnly.push(matches);
  }

  // Now render the output
  const result = [];
  for (let i = 0; i < width; i++) {
    const letter = correctColourAndPosition[i]
      ? MATCH
      : correctColourOnly[i]
      ? PARTIAL_MATCH
      : NO_MATCH;
    result.push(letter);
  }

  if (result.every((r) => r === MATCH)) {
    // They won!
    log(`You won! And in ${attempts} attempts! Reload page to start again.`);
    return;
  }

  if (!blacksInRightPlace) {
    // Sort the output
    result.sort();
  }

  log(`${attempts}. You guessed: ${guess}; result: ${result.join(" ")}`);
}

formEl.onsubmit = submitGuess;
startGame();
