
"use strict";

/* =========================================
   SOLFEJIO 1-SINF
   TOZA O'YIN KODI
========================================= */

const VIDEOS = {
    greeting: "Greeting.mp4",
    task: "Task_Prompt.mp4",
    praise: "Praise.mp4",
    encouragement: "Encouragement.mp4"
};

const NOTES = {
    DO: "C4.mp3",
    RE: "D4.mp3",
    MI: "E4.mp3",
    FA: "F4.mp3",
    SOL: "G4.mp3",
    LA: "A4.mp3",
    SI: "B4.mp3"
};


/* =========================================
   ELEMENTLAR
========================================= */

const video = document.getElementById("aliVideo");
const startButton = document.getElementById("startGameBtn");
const scoreElement = document.getElementById("score");
const feedbackElement = document.getElementById("feedbackText");

const noteButtons = Array.from(
    document.querySelectorAll(".note-btn")
);


/* =========================================
   O'YIN HOLATI
========================================= */

let gameStarted = false;
let buttonsLocked = true;

let currentNote = null;
let lastNote = null;

let score = 0;


/* =========================================
   AUDIO FAYLLAR
========================================= */

const audioBank = {};

Object.keys(NOTES).forEach(function(note) {

    const audio = new Audio(NOTES[note]);

    audio.preload = "auto";

    audioBank[note] = audio;

});


/* =========================================
   BALL
========================================= */

function updateScore() {

    if (scoreElement) {
        scoreElement.textContent = score;
    }

}


/* =========================================
   MATN
========================================= */

function showMessage(text) {

    if (feedbackElement) {
        feedbackElement.textContent = text;
    }

}


/* =========================================
   TUGMALARNI BLOKIROVKA
========================================= */

function lockButtons() {

    buttonsLocked = true;

    noteButtons.forEach(function(button) {

        button.disabled = true;

        button.classList.remove("correct");
        button.classList.remove("wrong");

    });

}


function unlockButtons() {

    buttonsLocked = false;

    noteButtons.forEach(function(button) {

        button.disabled = false;

    });

}


/* =========================================
   TASODIFIY NOTA
========================================= */

function chooseNote() {

    const notes = Object.keys(NOTES);

    let newNote;

    do {

        newNote =
            notes[Math.floor(Math.random() * notes.length)];

    } while (
        notes.length > 1 &&
        newNote === lastNote
    );

    lastNote = newNote;

    currentNote = newNote;

}


/* =========================================
   NOTA OVOZINI IJRO ETISH
========================================= */

function playNote(note) {

    return new Promise(function(resolve) {

        const audio = audioBank[note];

        if (!audio) {

            resolve();

            return;
        }


        audio.pause();

        audio.currentTime = 0;


        let finished = false;


        function finish() {

            if (finished) {
                return;
            }

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

        }


        audio.addEventListener(
            "ended",
            finish
        );

        audio.addEventListener(
            "error",
            finish
        );


        const promise = audio.play();


        if (promise) {

            promise.catch(function() {

                finish();

            });

        }

    });

}


/* =========================================
   VIDEO IJRO ETISH
========================================= */

function playVideo(file, callback) {

    if (!video) {

        if (callback) {
            callback();
        }

        return;
    }


    video.pause();

    video.onended = null;

    video.onerror = null;


    video.src = file;

    video.load();


    let finished = false;


    function finish() {

        if (finished) {
            return;
        }

        finished = true;

        video.onended = null;

        video.onerror = null;


        if (callback) {
            callback();
        }

    }


    video.onended = finish;

    video.onerror = finish;


    const promise = video.play();


    if (promise) {

        promise.catch(function() {

            /*
              Brauzer avtomatik video ijrosini
              bloklasa ham o'yin to'xtab qolmaydi.
            */

            finish();

        });

    }

}


/* =========================================
   O'YINNI BOSHLASH
========================================= */

function startGame() {

    if (gameStarted) {
        return;
    }


    gameStarted = true;

    score = 0;

    currentNote = null;

    lastNote = null;


    updateScore();

    showMessage("");

    lockButtons();


    if (startButton) {

        startButton.style.display = "none";

    }


    /*
      1. Greeting
    */

    playVideo(
        VIDEOS.greeting,
        function() {

            /*
              2. Task
            */

            startQuestion();

        }
    );

}


/* =========================================
   YANGI SAVOL
========================================= */

function startQuestion() {

    if (!gameStarted) {
        return;
    }


    lockButtons();

    showMessage("");


    chooseNote();


    /*
      Task videosi
    */

    playVideo(
        VIDEOS.task,
        async function() {

            /*
              Task tugagach nota ovozi
            */

            await playNote(currentNote);


            if (!gameStarted) {
                return;
            }


            /*
              Bola javob tanlaydi
            */

            unlockButtons();

        }
    );

}


/* =========================================
   TO'G'RI JAVOB
========================================= */

async function correctAnswer(button) {

    button.classList.add("correct");


    score++;

    updateScore();


    showMessage(
        "Barakalla! To'g'ri topdingiz!"
    );


    /*
      Praise videosi
    */

    playVideo(
        VIDEOS.praise,
        function() {

            /*
              Keyingi savol
            */

            startQuestion();

        }
    );

}


/* =========================================
   NOTO'G'RI JAVOB
========================================= */

function wrongAnswer() {

    showMessage(
        "Yana urinib ko'ring!"
    );


    /*
      Encouragement videosi
    */

    playVideo(
        VIDEOS.encouragement,
        async function() {

            /*
              Shu savol yana bir marta
              ovoz chiqarib beriladi.
            */

            showMessage("");


            await playNote(currentNote);


            if (!gameStarted) {
                return;
            }


            /*
              Yana javob berish mumkin
            */

            unlockButtons();

        }
    );

}


/* =========================================
   NOTA TUGMALARI
========================================= */

noteButtons.forEach(function(button) {

    button.addEventListener(
        "click",
        async function() {

            if (!gameStarted) {
                return;
            }


            if (buttonsLocked) {
                return;
            }


            if (!currentNote) {
                return;
            }


            const selectedNote =
                button.getAttribute("data-note");


            if (!selectedNote) {
                return;
            }


            /*
              Javob vaqtida boshqa tugmalar
              bosilmaydi.
            */

            lockButtons();


            /*
              Bola tanlagan notani eshittiramiz.
            */

            await playNote(selectedNote);


            /*
              To'g'ri yoki noto'g'ri
            */

            if (selectedNote === currentNote) {

                await correctAnswer(button);

            } else {

                button.classList.add("wrong");

                wrongAnswer();

            }

        }
    );

});


/* =========================================
   BOSHLANG'ICH HOLAT
========================================= */

lockButtons();


if (video) {

    video.pause();

    video.controls = false;

    video.preload = "auto";

}


if (startButton) {

    startButton.style.display = "block";

}


/* =========================================
   GLOBAL START
========================================= */

window.startGame = startGame;
