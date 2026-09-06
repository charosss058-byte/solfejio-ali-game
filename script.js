"use strict";

/* =========================================================
   SOLFEJIO 1-SINF — PROFESSIONAL GAME ENGINE
   ========================================================= */

/* -----------------------------
   1. VIDEO FILES
----------------------------- */

const VIDEOS = {
    greeting: "Greeting.mp4",
    task: "Task_Prompt.mp4",
    praise: "Praise.mp4",
    encouragement: "Encouragement.mp4"
};


/* -----------------------------
   2. NOTE AUDIO FILES
----------------------------- */

const NOTE_AUDIO = {
    DO: "C4.mp3",
    RE: "D4.mp3",
    MI: "E4.mp3",
    FA: "F4.mp3",
    SOL: "G4.mp3",
    LA: "A4.mp3",
    SI: "B4.mp3"
};


/* -----------------------------
   3. GAME ELEMENTS
----------------------------- */

const video = document.getElementById("aliVideo");
const startButton = document.getElementById("startGameBtn");
const scoreElement = document.getElementById("score");
const feedbackElement = document.getElementById("feedbackText");
const noteButtons = Array.from(document.querySelectorAll(".note-btn"));


/* -----------------------------
   4. GAME STATE
----------------------------- */

let gameStarted = false;
let gameLocked = true;
let currentNote = null;
let previousNote = null;
let score = 0;
let videoSequence = 0;


/* -----------------------------
   5. PRELOAD NOTE AUDIO
----------------------------- */

const audioBank = {};

Object.keys(NOTE_AUDIO).forEach((note) => {
    const audio = new Audio(NOTE_AUDIO[note]);
    audio.preload = "auto";
    audioBank[note] = audio;
});


/* -----------------------------
   6. BASIC UI
----------------------------- */

function lockNoteButtons() {
    gameLocked = true;

    noteButtons.forEach((button) => {
        button.disabled = true;
        button.classList.remove("correct");
        button.classList.remove("wrong");
    });
}


function unlockNoteButtons() {
    gameLocked = false;

    noteButtons.forEach((button) => {
        button.disabled = false;
    });
}


function updateScore() {
    scoreElement.textContent = score;
}


function setFeedback(text) {
    feedbackElement.textContent = text;
}


/* -----------------------------
   7. CHOOSE RANDOM NOTE
----------------------------- */

function chooseNextNote() {

    const notes = Object.keys(NOTE_AUDIO);

    let newNote;

    do {
        newNote = notes[Math.floor(Math.random() * notes.length)];
    } while (notes.length > 1 && newNote === previousNote);

    previousNote = newNote;
    currentNote = newNote;
}


/* -----------------------------
   8. PLAY NOTE AUDIO
----------------------------- */

function playNote(note) {

    return new Promise((resolve) => {

        const audio = audioBank[note];

        if (!audio) {
            resolve();
            return;
        }

        try {
            audio.pause();
            audio.currentTime = 0;

            let finished = false;

            const finish = () => {
                if (finished) return;

                finished = true;

                audio.removeEventListener("ended", finish);
                audio.removeEventListener("error", finish);

                resolve();
            };

            audio.addEventListener("ended", finish);
            audio.addEventListener("error", finish);

            const promise = audio.play();

            if (promise && typeof promise.catch === "function") {
                promise.catch(() => {
                    finish();
                });
            }

        } catch (error) {
            resolve();
        }
    });
}


/* -----------------------------
   9. PLAY VIDEO
----------------------------- */

function playVideo(fileName, onFinished) {

    const sequence = ++videoSequence;

    lockNoteButtons();

    video.pause();

    video.onended = null;
    video.onerror = null;

    video.src = fileName;
    video.load();

    video.onended = () => {

        if (sequence !== videoSequence) return;

        video.onended = null;
        video.onerror = null;

        if (typeof onFinished === "function") {
            onFinished();
        }
    };

    video.onerror = () => {

        if (sequence !== videoSequence) return;

        video.onended = null;
        video.onerror = null;

        if (typeof onFinished === "function") {
            onFinished();
        }
    };

    video.currentTime = 0;

    const playPromise = video.play();

    if (playPromise && typeof playPromise.catch === "function") {

        playPromise.catch(() => {

            /*
             * The first click is already a user action,
             * so normally the video will play.
             * If the browser blocks it, the game remains stable.
             */
        });
    }
}


/* -----------------------------
   10. START GAME
----------------------------- */

function startGame() {

    if (gameStarted) return;

    gameStarted = true;
    score = 0;
    previousNote = null;
    currentNote = null;

    updateScore();
    setFeedback("");

    lockNoteButtons();

    startButton.style.display = "none";

    /*
     * First video:
     * GREETING
     */

    playVideo(VIDEOS.greeting, () => {

        /*
         * After Greeting:
         * choose a question
         */

        startNextQuestion();

    });
}


/* -----------------------------
   11. START NEXT QUESTION
----------------------------- */

function startNextQuestion() {

    if (!gameStarted) return;

    lockNoteButtons();

    setFeedback("");

    chooseNextNote();

    /*
     * First show Task_Prompt.
     */

    playVideo(VIDEOS.task, async () => {

        /*
         * After question video:
         * play the correct note audio.
         */

        await playNote(currentNote);

        /*
         * Now the child can answer.
         */

        if (gameStarted) {
            unlockNoteButtons();
        }
    });
}


/* -----------------------------
   12. HANDLE NOTE CLICK
----------------------------- */

async function handleNoteClick(selectedNote, button) {

    if (!gameStarted) return;
    if (gameLocked) return;
    if (!currentNote) return;

    /*
     * Immediately lock all buttons.
     * This prevents multiple clicks.
     */

    lockNoteButtons();

    /*
     * Play the note that the child selected.
     */

    await playNote(selectedNote);


    /* -------------------------
       CORRECT ANSWER
    ------------------------- */

    if (selectedNote === currentNote) {

        button.classList.add("correct");

        score++;
        updateScore();

        setFeedback("Баракалла! Тўғри топдингиз!");

        /*
         * Praise video
         */

        playVideo(VIDEOS.praise, () => {

            /*
             * Automatically continue
             * with a new question.
             */

            startNextQuestion();

        });

        return;
    }


    /* -------------------------
       WRONG ANSWER
    ------------------------- */

    button.classList.add("wrong");

    setFeedback("Яна уриниб кўринг!");

    /*
     * Encouragement video.
     * IMPORTANT:
     * currentNote DOES NOT change.
     */

    playVideo(VIDEOS.encouragement, async () => {

        /*
         * Repeat the SAME question.
         */

        setFeedback("Яна бир марта тингланг!");

        await playNote(currentNote);

        /*
         * Let the child try again.
         */

        if (gameStarted) {
            unlockNoteButtons();
        }
    });
}


/* -----------------------------
   13. CONNECT NOTE BUTTONS
----------------------------- */

noteButtons.forEach((button) => {

    button.addEventListener("click", () => {

        const selectedNote = button.getAttribute("data-note");

        if (!selectedNote) return;

        handleNoteClick(selectedNote, button);

    });

});


/* -----------------------------
   14. INITIAL STATE
----------------------------- */

lockNoteButtons();

if (video) {
    video.pause();
    video.controls = false;
    video.preload = "auto";
}

if (startButton) {
    startButton.style.display = "block";
}


/* -----------------------------
   15. GLOBAL START FUNCTION
----------------------------- */

/*
 * index.html uses:
 *
 * onclick="startGame()"
 *
 * Therefore startGame must be available globally.
 */

window.startGame = startGame;
