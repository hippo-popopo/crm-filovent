const levels = {
  easy: { min: 1, max: 9 },
  medium: { min: 2, max: 24 },
  hard: { min: 5, max: 75 },
};

const state = {
  sequence: [],
  answer: 0,
  index: 0,
  timer: null,
  playing: false,
  round: 0,
  correct: 0,
  streak: 0,
  bestStreak: 0,
  history: [],
};

const els = {
  levelSelect: document.querySelector("#levelSelect"),
  lengthInput: document.querySelector("#lengthInput"),
  lengthValue: document.querySelector("#lengthValue"),
  speedInput: document.querySelector("#speedInput"),
  speedValue: document.querySelector("#speedValue"),
  negativeToggle: document.querySelector("#negativeToggle"),
  settingsButton: document.querySelector("#settingsButton"),
  notebookButton: document.querySelector("#notebookButton"),
  settingsDrawer: document.querySelector("#settingsDrawer"),
  notebookDrawer: document.querySelector("#notebookDrawer"),
  startButton: document.querySelector("#startButton"),
  statusText: document.querySelector("#statusText"),
  progressText: document.querySelector("#progressText"),
  currentNumber: document.querySelector("#currentNumber"),
  answerForm: document.querySelector("#answerForm"),
  answerInput: document.querySelector("#answerInput"),
  checkButton: document.querySelector("#checkButton"),
  resultSlate: document.querySelector("#resultSlate"),
  resultValue: document.querySelector("#resultValue"),
  resultMessage: document.querySelector("#resultMessage"),
  roundCount: document.querySelector("#roundCount"),
  correctCount: document.querySelector("#correctCount"),
  bestStreak: document.querySelector("#bestStreak"),
  lastTotal: document.querySelector("#lastTotal"),
  historyList: document.querySelector("#historyList"),
};

function closeDrawer(drawer, button) {
  drawer.hidden = true;
  button.setAttribute("aria-expanded", "false");
}

function toggleDrawer(drawer, button, otherDrawer, otherButton) {
  const willOpen = drawer.hidden;
  closeDrawer(otherDrawer, otherButton);
  drawer.hidden = !willOpen;
  button.setAttribute("aria-expanded", String(willOpen));
}

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateSequence() {
  const level = levels[els.levelSelect.value];
  const length = Number(els.lengthInput.value);
  const allowNegative = els.negativeToggle.checked;

  return Array.from({ length }, () => {
    const value = randomInt(level.min, level.max);
    if (!allowNegative) return value;
    return Math.random() < 0.32 ? -value : value;
  });
}

function updateSettingsLabels() {
  els.lengthValue.textContent = els.lengthInput.value;
  els.speedValue.textContent = `${(Number(els.speedInput.value) / 1000).toFixed(1)} s`;
}

function setPlaying(isPlaying) {
  state.playing = isPlaying;
  els.startButton.disabled = isPlaying;
  els.levelSelect.disabled = isPlaying;
  els.lengthInput.disabled = isPlaying;
  els.speedInput.disabled = isPlaying;
  els.negativeToggle.disabled = isPlaying;
}

function showNumber(value) {
  els.currentNumber.classList.remove("pop");
  void els.currentNumber.offsetWidth;
  els.currentNumber.textContent = value > 0 ? `+${value}` : value;
  els.currentNumber.classList.add("pop");
}

function showEntryMode() {
  setPlaying(false);
  els.currentNumber.textContent = "?";
  els.statusText.textContent = "À toi de jouer.";
  els.progressText.textContent = `${state.sequence.length} / ${state.sequence.length}`;
  els.answerInput.disabled = false;
  els.checkButton.disabled = false;
  els.answerInput.value = "";
  els.answerInput.focus();
}

function tickSequence() {
  if (state.index >= state.sequence.length) {
    window.clearInterval(state.timer);
    state.timer = null;
    showEntryMode();
    return;
  }

  const value = state.sequence[state.index];
  showNumber(value);
  els.statusText.textContent = "Additionne dans ta tête...";
  els.progressText.textContent = `${state.index + 1} / ${state.sequence.length}`;
  state.index += 1;
}

function startRound() {
  window.clearInterval(state.timer);
  state.sequence = generateSequence();
  state.answer = state.sequence.reduce((sum, value) => sum + value, 0);
  state.index = 0;
  state.round += 1;

  els.resultSlate.hidden = true;
  els.answerInput.disabled = true;
  els.checkButton.disabled = true;
  els.answerInput.value = "";
  els.roundCount.textContent = state.round;
  setPlaying(true);
  tickSequence();
  state.timer = window.setInterval(tickSequence, Number(els.speedInput.value));
}

function addHistory(isCorrect, guess) {
  state.history.unshift({
    isCorrect,
    guess,
    answer: state.answer,
    sequence: state.sequence.join(" "),
  });
  state.history = state.history.slice(0, 5);

  els.historyList.innerHTML = "";
  state.history.forEach((item) => {
    const li = document.createElement("li");
    li.className = item.isCorrect ? "good" : "miss";
    li.textContent = item.isCorrect
      ? `Juste: ${item.answer}`
      : `Ta réponse: ${item.guess || "vide"} - total: ${item.answer}`;
    li.title = item.sequence;
    els.historyList.append(li);
  });
}

function updateStats(isCorrect) {
  if (isCorrect) {
    state.correct += 1;
    state.streak += 1;
    state.bestStreak = Math.max(state.bestStreak, state.streak);
  } else {
    state.streak = 0;
  }

  els.correctCount.textContent = state.correct;
  els.bestStreak.textContent = state.bestStreak;
  els.lastTotal.textContent = state.answer;
}

function checkAnswer(event) {
  event.preventDefault();
  if (els.answerInput.disabled) return;

  const guess = Number(els.answerInput.value);
  const isCorrect = els.answerInput.value.trim() !== "" && guess === state.answer;

  els.resultSlate.hidden = false;
  els.resultValue.textContent = state.answer;
  els.resultMessage.textContent = isCorrect
    ? "Bravo, la somme est exacte."
    : "Presque. Rejoue la suite avec un rythme plus posé.";

  els.statusText.textContent = isCorrect ? "Réponse validée." : "Correction révélée.";
  els.answerInput.disabled = true;
  els.checkButton.disabled = true;

  updateStats(isCorrect);
  addHistory(isCorrect, els.answerInput.value.trim());
}

els.lengthInput.addEventListener("input", updateSettingsLabels);
els.speedInput.addEventListener("input", updateSettingsLabels);
els.startButton.addEventListener("click", startRound);
els.answerForm.addEventListener("submit", checkAnswer);
els.settingsButton.addEventListener("click", () => {
  toggleDrawer(els.settingsDrawer, els.settingsButton, els.notebookDrawer, els.notebookButton);
});
els.notebookButton.addEventListener("click", () => {
  toggleDrawer(els.notebookDrawer, els.notebookButton, els.settingsDrawer, els.settingsButton);
});
document.addEventListener("keydown", (event) => {
  if (event.key !== "Escape") return;
  closeDrawer(els.settingsDrawer, els.settingsButton);
  closeDrawer(els.notebookDrawer, els.notebookButton);
});

updateSettingsLabels();
