
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

    const audio = new Audio(AUDIO[note]);

    audio.preload = "auto";

    sounds[note] = audio;
}


/* ================================
   MATN
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


/* ================================
   TUGMALAR
================================ */

function lock() {

    locked = true;

    buttons.forEach(button => {

        button.disabled = true;

        button.classList.remove("correct");
        button.classList.remove("wrong");

    });

}


function unlock() {

    locked = false;

    buttons.forEach(button => {

        button.disabled = false;

    });

}


/* ================================
   YANGI NOTA
================================ */

function newQuestion() {

    const notes = Object.keys(AUDIO);

    let note;

    do {

        note =
            notes[Math.floor(Math.random() * notes.length)];

    } while (
        notes.length > 1 &&
        note === lastNote
    );

    currentNote = note;

    lastNote = note;

}


/* ================================
   NOTA OVOZI
================================ */

function playNote(note, callback) {

    const audio = sounds[note];

    if (!audio) {

        if (callback) {
            callback();
        }

        return;
    }


    audio.pause();

    audio.currentTime = 0;


    let finished = false;


    function done() {

        if (finished) {
            return;
        }

        finished = true;

        audio.onended = null;
        audio.onerror = null;

        if (callback) {
            callback();
        }

    }


    audio.onended = done;

    audio.onerror = done;


    const playPromise = audio.play();


    if (playPromise) {

        playPromise.catch(function() {

            done();

        });

    }


    /*
      Agar MP3 javob bermasa,
      o'yin qotib qolmaydi.
    */

    setTimeout(function() {

        done();

    }, 3000);

}


/* ================================
   ALI VIDEOSI
================================ */

function playAli(file, callback) {

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


    function done() {

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


    video.onended = done;

    video.onerror = done;


    const playPromise = video.play();


    if (playPromise) {

        playPromise.catch(function() {

            /*
              Video autoplay bloklansa ham
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

    if (started) {
        return;
    }


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
      1. Greeting
    */

    playAli(
        VIDEO.greeting,
        function() {

            /*
              2. Task
            */

            startQuestion();

        }
    );

}


/* ================================
   SAVOLNI BOSHLASH
================================ */

function startQuestion() {

    if (!started) {
        return;
    }


    lock();

    message("");


    /*
      Yangi nota
    */

    newQuestion();


    /*
      Task videosi
    */

    playAli(
        VIDEO.task,
        function() {

            /*
              Task tugagach
              nota ovozi
            */

            playNote(
                currentNote,
                function() {

                    if (!started) {
                        return;
                    }

                    /*
                      Javob berish mumkin
                    */

                    unlock();

                }
            );

        }
    );

}


/* ================================
   TO'G'RI JAVOB
================================ */

function rightAnswer(button) {

    button.classList.add("correct");


    score++;

    updateScore();


    message(
        "Barakalla! To'g'ri topdingiz!"
    );


    /*
      Praise videosi
    */

    playAli(
        VIDEO.praise,
        function() {

            /*
              Keyingi savol
            */

            startQuestion();

        }
    );

}


/* ================================
   NOTO'G'RI JAVOB
================================ */

function wrongAnswer(button) {

    button.classList.add("wrong");


    message(
        "Yana urinib ko'ring!"
    );


    /*
      Encouragement videosi
    */

    playAli(
        VIDEO.encouragement,
        function() {

            /*
              Shu savolni qayta eshittirish
            */

            playNote(
                currentNote,
                function() {

                    if (!started) {
                        return;
                    }

                    /*
                      Yana javob berish mumkin
                    */

                    unlock();

                }
            );

        }
    );

}


/* ================================
   NOTA TUGMALARI
================================ */

buttons.forEach(function(button) {

    button.addEventListener(
        "click",
        function() {

            if (!started) {
                return;
            }


            if (locked) {
                return;
            }


            if (!currentNote) {
                return;
            }


            const selected =
                button.getAttribute("data-note");


            if (!selected) {
                return;
            }


            /*
              Javob vaqtida
              tugmalar bloklanadi.
            */

            lock();


            /*
              Bola bosgan notani
              eshittiramiz.
            */

            playNote(
                selected,
                function() {

                    /*
                      Javobni tekshiramiz
                    */

                    if (
                        selected === currentNote
                    ) {

                        rightAnswer(button);

                    } else {

                        wrongAnswer(button);

                    }

                }
            );

        }
    );

});


/* ================================
   BOSHLANG'ICH HOLAT
================================ */

lock();

updateScore();

message("");


if (video) {

    video.controls = false;

    video.preload = "auto";

}


if (startButton) {

    startButton.style.display = "block";

    startButton.textContent = "▶ Boshlash";

}


/* ================================
   START
================================ */

window.startGame = startGame;
