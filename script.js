"use strict";

/* ==========================================
   SOLFEJIO 1-SINF
   GAME ENGINE
========================================== */


/* ==========================================
   VIDEO FILES
========================================== */

const VIDEOS = {
    greeting: "Greeting.mp4",
    task: "Task_Prompt.mp4",
    praise: "Praise.mp4",
    encouragement: "Encouragement.mp4"
};


/* ==========================================
   NOTE AUDIO FILES
========================================== */

const NOTE_AUDIO = {
    DO: "C4.mp3",
    RE: "D4.mp3",
    MI: "E4.mp3",
    FA: "F4.mp3",
    SOL: "G4.mp3",
    LA: "A4.mp3",
    SI: "B4.mp3"
};


/* ==========================================
   ELEMENTS
========================================== */

const video = document.getElementById("aliVideo");
const startButton = document.getElementById("startGameBtn");
const scoreElement = document.getElementById("score");
const feedbackElement = document.getElementById("feedbackText");

const noteButtons = Array.from(
    document.querySelectorAll(".note-btn")
);


/* ==========================================
   GAME STATE
========================================== */

let gameStarted = false;
let gameLocked = true;

let currentNote = null;
let previousNote = null;

let score = 0;

let videoRequest = 0;


/* ==========================================
   AUDIO BANK
========================================== */

const audioBank = {};

Object.keys(NOTE_AUDIO).forEach((note) => {

    const audio = new Audio(NOTE_AUDIO[note]);

    audio.preload = "auto";

    audioBank[note] = audio;

});


/* ==========================================
   LOCK BUTTONS
========================================== */

function lockButtons() {

    gameLocked = true;

    noteButtons.forEach((button) => {

        button.disabled = true;

        button.classList.remove("correct");
        button.classList.remove("wrong");

    });

}


/* ==========================================
   UNLOCK BUTTONS
========================================== */

function unlockButtons() {

    gameLocked = false;

    noteButtons.forEach((button) => {

        button.disabled = false;

    });

}


/* ==========================================
   MESSAGE
========================================== */

function showMessage(text) {

    if (feedbackElement) {

        feedbackElement.textContent = text;

    }

}


/* ==========================================
   SCORE
========================================== */

function updateScore() {

    if (scoreElement) {

        scoreElement.textContent = score;

    }

}


/* ==========================================
   CHOOSE RANDOM NOTE
========================================== */

function chooseNextNote() {

    const notes = Object.keys(NOTE_AUDIO);

    let newNote;

    do {

        newNote =
            notes[Math.floor(Math.random() * notes.length)];

    } while (
        notes.length > 1 &&
        newNote === previousNote
    );

    previousNote = newNote;

    currentNote = newNote;

}


/* ==========================================
   PLAY NOTE
========================================== */

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

                audio.removeEventListener(
                    "ended",
                    finish
                );

                audio.removeEventListener(
                    "error",
                    finish
                );

                resolve();

            };

            audio.addEventListener(
                "ended",
                finish
            );

            audio.addEventListener(
                "error",
                finish
            );

            const playPromise = audio.play();

            if (playPromise) {

                playPromise.catch(() => {

                    finish();

                });

            }

        } catch (error) {

            resolve();

        }

    });

}


/* ==========================================
   PLAY VIDEO
========================================== */

function playVideo(fileName, afterVideo) {

    if (!video) return;

    const request = ++videoRequest;

    lockButtons();

    video.pause();

    video.onended = null;
    video.onerror = null;

    video.src = fileName;

    video.load();

    let finished = false;

    const finishVideo = () => {

        if (finished) return;

        if (request !== videoRequest) return;

        finished = true;

        video.onended = null;
        video.onerror = null;

        if (typeof afterVideo === "function") {

            afterVideo();

        }

    };

    video.onended = finishVideo;

    video.onerror = finishVideo;

    const playPromise = video.play();

    if (playPromise) {

        playPromise.catch(() => {

            /*
             * Video playback can be restricted
             * by the browser.
             */

        });

    }

}


/* ==========================================
   START GAME
========================================== */

function startGame() {

    if (gameStarted) return;

    gameStarted = true;

    score = 0;

    currentNote = null;
    previousNote = null;

    updateScore();

    showMessage("");

    lockButtons();

    if (startButton) {

        startButton.style.display = "none";

    }


    /* --------------------------------------
       1. GREETING
    -------------------------------------- */

    playVideo(
        VIDEOS.greeting,
        () => {

            /* --------------------------------
               2. FIRST QUESTION
            -------------------------------- */

            startQuestion();

        }
    );

}


/* ==========================================
   START QUESTION
========================================== */

function startQuestion() {

    if (!gameStarted) return;

    lockButtons();

    showMessage("");

    chooseNextNote();


    /* --------------------------------------
       TASK VIDEO
    -------------------------------------- */

    playVideo(
        VIDEOS.task,
        async () => {

            /* -------------------------------
               PLAY CORRECT NOTE
            ------------------------------- */

            await playNote(currentNote);


            /* -------------------------------
               ENABLE ANSWERS
            ------------------------------- */

            if (gameStarted) {

                unlockButtons();

            }

        }
    );

}


/* ==========================================
   HANDLE NOTE
========================================== */

async function handleNote(
    selectedNote,
    clickedButton
) {

    if (!gameStarted) return;

    if (gameLocked) return;

    if (!currentNote) return;


    /* --------------------------------------
       LOCK ALL BUTTONS
    -------------------------------------- */

    lockButtons();


    /* --------------------------------------
       PLAY SELECTED NOTE
    -------------------------------------- */

    await playNote(selectedNote);


    /* ======================================
       CORRECT ANSWER
    ====================================== */

    if (selectedNote === currentNote) {

        clickedButton.classList.add("correct");

        score++;

        updateScore();

        showMessage(
            "Баракалла! Тўғри топдингиз!"
        );


        /* ----------------------------------
           ALI PRAISE
        ---------------------------------- */

        playVideo(
            VIDEOS.praise,
            () => {

                /* --------------------------
                   NEW QUESTION
                -------------------------- */

                startQuestion();

            }
        );

        return;

    }


    /* ======================================
       WRONG ANSWER
    ====================================== */

    clickedButton.classList.add("wrong");

    showMessage(
        "Яна уриниб кўринг!"
    );


    /* --------------------------------------
       ALI ENCOURAGEMENT
    -------------------------------------- */

    playVideo(
        VIDEOS.encouragement,
        async () => {

            /*
             * IMPORTANT:
             * currentNote DOES NOT CHANGE.
             *
             * The child gets another chance
             * at the SAME question.
             */

            showMessage(
                "Яна бир марта тингланг!"
            );

            await playNote(currentNote);


            /* ------------------------------
               TRY AGAIN
            ------------------------------ */

            if (gameStarted) {

                unlockButtons();

            }

        }
    );

}


/* ==========================================
   CONNECT NOTE BUTTONS
========================================== */

noteButtons.forEach((button) => {

    button.addEventListener(
        "click",
        () => {

            const selectedNote =
                button.getAttribute("data-note");

            if (!selectedNote) return;

            handleNote(
                selectedNote,
                button
            );

        }
    );

});


/* ==========================================
   INITIAL STATE
========================================== */

lockButtons();


if (video) {

    video.pause();

    video.controls = false;

    video.preload = "auto";

}


if (startButton) {

    startButton.style.display = "block";

}


/* ==========================================
   GLOBAL START FUNCTION
========================================== */

window.startGame = startGame;
