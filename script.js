"use strict";

/* ================================
   SOLFEJIO 1-SINF
================================ */

const VIDEO = {
    greeting: "Greeting.mp4",
    task: "Task_Prompt.mp4",
    praise: "Praise.mp4",
    encouragement: "Encouragement.mp4"
};

const AUDIO = {
    DO: "C4.mp3",
    RE: "D4.mp3",
    MI: "E4.mp3",
    FA: "F4.mp3",
    SOL: "G4.mp3",
    LA: "A4.mp3",
    SI: "B4.mp3"
};


/* ================================
   ELEMENTLAR
================================ */

const video = document.getElementById("aliVideo");
const startButton = document.getElementById("startGameBtn");
const scoreText = document.getElementById("score");
const feedback = document.getElementById("feedbackText");
const buttons = [...document.querySelectorAll(".note-btn")];


/* ================================
   O'YIN HOLATI
================================ */

let started = false;
let locked = true;
let currentNote = "";
let lastNote = "";
let score = 0;


/* ================================
   AUDIO
================================ */

const sounds = {};

for (const note in AUDIO) {
    sounds[note] = new Audio(AUDIO[note]);
    sounds[note].preload = "auto";
}


/* ================================
   YORDAMCHI FUNKSIYALAR
================================ */

function message(text) {
    if (feedback) {
        feedback.textContent = text;
    }
}


function updateScore() {
    if (scoreText) {
        scoreText.textContent = score;
    }
}


function lock() {
    locked = true;

    buttons.forEach(button => {
        button.disabled = true;
        button.classList.remove("correct", "wrong");
    });
}


function unlock() {
    locked = false;

    buttons.forEach(button => {
        button.disabled = false;
    });
}


/* ================================
   NOTA TANLASH
================================ */

function newQuestion() {
    const notes = Object.keys(AUDIO);

    let note;

    do {
        note = notes[Math.floor(Math.random() * notes.length)];
    } while (notes.length > 1 && note === lastNote);

    currentNote = note;
    lastNote = note;
}


/* ================================
   NOTA OVOZI
================================ */

function playNote(note) {
    return new Promise(resolve => {

        const audio = sounds[note];

        if (!audio) {
            resolve();
            return;
        }

        audio.pause();
        audio.currentTime = 0;

        const done = () => {
            audio.removeEventListener("ended", done);
            audio.removeEventListener("error", done);
            resolve();
        };

        audio.addEventListener("ended", done);
        audio.addEventListener("error", done);

        const play = audio.play();

        if (play) {
            play.catch(done);
        }
    });
}


/* ================================
   ALI VIDEOSI
================================ */

function playAli(file, next) {

    if (!video) {
        if (next) next();
        return;
    }

    video.pause();

    video.src = file;
    video.load();

    video.onended = null;
    video.onerror = null;

    let finished = false;

    function done() {

        if (finished) return;

        finished = true;

        video.onended = null;
        video.onerror = null;

        if (next) {
            next();
        }
    }

    video.onended = done;
    video.onerror = done;

    const play = video.play();

    if (play) {
        play.catch(() => {
            /*
              Video brauzer tomonidan bloklansa,
              o'yin to'xtab qolmaydi.
            */
            done();
        });
    }
}


/* ================================
   O'YINNI BOSHLASH
================================ */

function startGame() {

    if (started) return;

    started = true;
    score = 0;
    currentNote = "";
    lastNote = "";

    updateScore();
    message("");
    lock();

    if (startButton) {
        startButton.style.display = "none";
    }

    /*
      Greeting
    */
    playAli(VIDEO.greeting, () => {

        /*
          Task
        */
        startQuestion();

    });
}


/* ================================
   SAVOL
================================ */

function startQuestion() {

    if (!started) return;

    lock();
    message("");

    newQuestion();

    /*
      Task_Prompt
    */
    playAli(VIDEO.task, async () => {

        /*
          Task tugagach,
          nota eshittiriladi
        */
        await playNote(currentNote);

        if (!started) return;

        /*
          Javob berish mumkin
        */
        unlock();
    });
}


/* ================================
   TO'G'RI JAVOB
================================ */

async function rightAnswer(button) {

    button.classList.add("correct");

    score++;
    updateScore();

    message("Barakalla! To'g'ri topdingiz!");

    /*
      Praise
    */
    playAli(VIDEO.praise, () => {

        /*
          Keyingi savol
        */
        startQuestion();

    });
}


/* ================================
   NOTO'G'RI JAVOB
================================ */

async function wrongAnswer(button) {

    button.classList.add("wrong");

    message("Yana urinib ko'ring!");

    /*
      Encouragement
    */
    playAli(VIDEO.encouragement, async () => {

        /*
          Xuddi shu savolni
          qaytadan eshittiramiz
        */
        await playNote(currentNote);

        if (!started) return;

        unlock();

    });
}


/* ================================
   NOTA TUGMALARI
================================ */

buttons.forEach(button => {

    button.addEventListener("click", async () => {

        if (!started) return;
        if (locked) return;
        if (!currentNote) return;

        const selected =
            button.getAttribute("data-note");

        if (!selected) return;

        lock();

        /*
          Bola bosgan nota ovozi
        */
        await playNote(selected);

        /*
          Javobni tekshirish
        */
        if (selected === currentNote) {

            await rightAnswer(button);

        } else {

            await wrongAnswer(button);

        }

    });

});


/* ================================
   BOSHLANG'ICH HOLAT
================================ */

lock();

if (video) {
    video.controls = false;
    video.preload = "auto";
}

if (startButton) {
    startButton.style.display = "block";
}


/* ================================
   START BUTTON
================================ */

window.startGame = startGame;
