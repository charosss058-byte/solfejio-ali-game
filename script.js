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
 
 
/*
  VAQTINCHALIK KUZATUV (DEBUG) OYNACHASI:
  Ekranning yuqori chap burchagida kichik yozuv sifatida
  chiqadi — hech qanday HTML/CSS faylga tegmasdan, shu yerda
  JavaScript orqali yaratiladi. Muammo topilgach, shu blokni
  butunlay o'chirib tashlash mumkin.
*/
const debugBox = document.createElement("div");
debugBox.style.position = "fixed";
debugBox.style.top = "4px";
debugBox.style.left = "4px";
debugBox.style.zIndex = "99999";
debugBox.style.background = "rgba(0,0,0,0.75)";
debugBox.style.color = "#0f0";
debugBox.style.fontSize = "12px";
debugBox.style.fontFamily = "monospace";
debugBox.style.padding = "4px 8px";
debugBox.style.borderRadius = "6px";
debugBox.style.whiteSpace = "pre-line";
debugBox.textContent = "DEBUG: kutilmoqda...";
document.body.appendChild(debugBox);
 
 
/* ================================
   O'YIN HOLATI
================================ */
 
let started = false;
let locked = true;
let currentNote = "";
let lastNote = "";
let score = 0;
 
/*
  MUHIM TUZATISH:
  Har bir savolning o'z raqami (token) bor.
  Agar biror video/ovoz kechikib tugasa va shu orada
  savol allaqachon almashgan bo'lsa — eski natija
  E'TIBORGA OLINMAYDI. Aynan shu narsa "to'g'ri javobga
  Yana urinib ko'ring chiqishi" va "o'yin qotib qolishi"
  muammosining oldini oladi.
*/
let questionToken = 0;
 
 
/* ================================
   AUDIO
================================ */
 
const sounds = {};
 
for (const note in AUDIO) {
 
    const audio = new Audio(AUDIO[note]);
 
    audio.preload = "auto";
 
    sounds[note] = audio;
}
 
/*
  MUHIM TUZATISH:
  Har bir audio/video element uchun "joriy chaqiruv raqami".
  Bitta ovoz elementi (masalan DO notasi) ham savol sifatida,
  ham bola bosgan tugma tovushi sifatida ishlatiladi. Agar eski
  chaqiruv kechikib tugasa, u endi YANGI chaqiruvning holatini
  bekor qila olmaydi — chunki raqamlar mos kelmaydi.
*/
let videoCallId = 0;
 
const audioCallIds = {};
 
for (const note in AUDIO) {
    audioCallIds[note] = 0;
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
 
    /*
      Yangi savol boshlandi — eski (kechikib qolishi
      mumkin bo'lgan) javoblarni endi hisobga olmaymiz.
    */
    questionToken++;
 
    /*
      VAQTINCHALIK KUZATUV (DEBUG):
      Dastur aslida qaysi notani kutayotganini konsolga
      va ekranga chiqaramiz. Muammoni topgach, buni olib
      tashlash mumkin.
    */
    console.log("[DEBUG] Yangi savol — kutilayotgan nota:", currentNote);
 
    debugBox.textContent = "DEBUG\nKutilayotgan nota: " + currentNote;
 
    return questionToken;
 
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
 
    /*
      Shu audio elementga tegishli oldingi chaqiruvni
      "eskirgan" deb belgilaymiz.
    */
    audioCallIds[note] = (audioCallIds[note] || 0) + 1;
    const callId = audioCallIds[note];
 
    audio.pause();
 
    audio.currentTime = 0;
 
 
    let finished = false;
    let timerId = null;
 
 
    function done() {
 
        /*
          Agar shu orada boshqa playNote() aynan shu
          audio ustida ishga tushgan bo'lsa — bu eski
          chaqiruv endi hech narsaga aralashmasligi kerak.
        */
        if (callId !== audioCallIds[note]) {
            return;
        }
 
        if (finished) {
            return;
        }
 
        finished = true;
 
        if (timerId !== null) {
            clearTimeout(timerId);
            timerId = null;
        }
 
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
      Agar MP3 hech qanday sababga ko'ra javob bermasa,
      o'yin abadiy kutib qolmasin.
    */
 
    timerId = setTimeout(function() {
 
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
 
    /*
      Shu videoga tegishli oldingi chaqiruvni
      "eskirgan" deb belgilaymiz.
    */
    videoCallId++;
    const callId = videoCallId;
 
    video.pause();
 
    video.onended = null;
    video.onerror = null;
 
 
    video.src = file;
 
    video.load();
 
 
    let finished = false;
    let timerId = null;
 
 
    function done() {
 
        if (callId !== videoCallId) {
            return;
        }
 
        if (finished) {
            return;
        }
 
        finished = true;
 
        if (timerId !== null) {
            clearTimeout(timerId);
            timerId = null;
        }
 
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
 
 
    /*
      MUHIM TUZATISH:
      Zaxira vaqtni videoning HAQIQIY davomiyligiga
      moslab qo'yamiz (video "loadedmetadata" bergach
      buni bilib olamiz). Agar biror sababga ko'ra
      davomiylikni bilib bo'lmasa, 12 soniyalik
      xavfsiz chegara ishlatiladi. Bu videoning o'zi
      bilan zaxira taymer bir vaqtda "to'qnashib"
      qolishining oldini oladi.
    */
 
    function scheduleFallback(seconds) {
 
        if (timerId !== null) {
            clearTimeout(timerId);
        }
 
        timerId = setTimeout(function() {
 
            done();
 
        }, seconds * 1000);
 
    }
 
 
    scheduleFallback(12);
 
    video.addEventListener(
        "loadedmetadata",
        function onMeta() {
 
            video.removeEventListener("loadedmetadata", onMeta);
 
            if (callId !== videoCallId) {
                return;
            }
 
            if (
                video.duration &&
                isFinite(video.duration) &&
                video.duration > 0
            ) {
 
                scheduleFallback(video.duration + 2);
 
            }
 
        }
    );
 
}
 
 
/* ================================
   MEDIANI "OCHISH"
================================ */
 
/*
  MUHIM TUZATISH:
  Ko'p mobil brauzerlar (ayniqsa Telegram ichidagi brauzer)
  faqat FOYDALANUVCHI bevosita bosgan tugma orqali birinchi
  video/ovozni ishga tushirishga ruxsat beradi. Keyingi
  videolar (Task, Praise, Encouragement) esa dastur tomonidan
  AVTOMATIK ishga tushiriladi — va ko'pincha shu joyda
  bloklanib, o'yin "to'xtab qoladi".
 
  Yechim: "Boshlash" tugmasi bosilgan ONING O'ZIDA (hali
  foydalanuvchi harakati "yangi" hisoblanadigan paytda) barcha
  video/audio elementlarni bir zumga ishga tushirib, darhol
  to'xtatib qo'yamiz. Bu ko'zga ko'rinmaydi, lekin shu orqali
  brauzer ularning barchasiga shu sessiya davomida avtomatik
  ishga tushirishga ruxsat beradi.
*/
function unlockMedia() {
 
    const mediaElements = [video, ...Object.values(sounds)];
 
    mediaElements.forEach(function(el) {
 
        if (!el) {
            return;
        }
 
        const p = el.play();
 
        if (p && p.catch) {
            p.catch(function() {});
        }
 
        el.pause();
 
        try {
            el.currentTime = 0;
        } catch (e) {
            /* e'tiborsiz qoldiramiz */
        }
 
    });
 
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
 
 
    /*
      Mediani "ochish" — eng birinchi ish, hali
      foydalanuvchi bosishining "yangi" hisoblanadigan
      lahzasida bo'lishi kerak.
    */
    unlockMedia();
 
 
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
      Yangi nota + yangi token
    */
 
    const token = newQuestion();
 
 
    /*
      Task videosi
    */
 
    playAli(
        VIDEO.task,
        function() {
 
            /*
              Shu orada savol allaqachon
              almashib ketgan bo'lishi mumkin —
              tekshiramiz.
            */
            if (!started || token !== questionToken) {
                return;
            }
 
            /*
              Task tugagach nota ovozi
            */
 
            playNote(
                currentNote,
                function() {
 
                    if (!started || token !== questionToken) {
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
 
function rightAnswer(button, token) {
 
    /*
      Bu javob hali ham amaldagi savolga
      tegishlimi — tekshiramiz.
    */
    if (token !== questionToken) {
        return;
    }
 
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
 
            if (!started || token !== questionToken) {
                return;
            }
 
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
 
function wrongAnswer(button, token) {
 
    if (token !== questionToken) {
        return;
    }
 
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
 
            if (!started || token !== questionToken) {
                return;
            }
 
            /*
              Shu savolni qayta eshittirish
            */
 
            playNote(
                currentNote,
                function() {
 
                    if (!started || token !== questionToken) {
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
              MUHIM TUZATISH:
              Bola aynan QAYSI savolga va QAYSI notaga
              javob berayotganini HOZIR (bosilgan paytda)
              eslab qolamiz. Keyinchalik currentNote
              o'zgarib ketsa ham, bu javob hali ham
              to'g'ri notaga solishtiriladi.
            */
            const token = questionToken;
            const expectedNote = currentNote;
 
 
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
                      Agar shu orada savol allaqachon
                      almashib ketgan bo'lsa, bu javob
                      endi ahamiyatsiz.
                    */
                    if (!started || token !== questionToken) {
                        console.log(
                            "[DEBUG] Bu javob eskirgan, e'tiborga olinmadi. Bosilgan:",
                            selected,
                            "| O'sha paytdagi kutilgan:",
                            expectedNote
                        );
                        return;
                    }
 
                    /*
                      Javobni tekshiramiz
                    */
 
                    console.log(
                        "[DEBUG] Bosilgan nota:",
                        selected,
                        "| Kutilgan nota:",
                        expectedNote,
                        "| Natija:",
                        (selected === expectedNote) ? "TO'G'RI" : "NOTO'G'RI"
                    );
 
                    debugBox.textContent =
                        "DEBUG\nBosilgan: " + selected +
                        "\nKutilgan: " + expectedNote +
                        "\nNatija: " + ((selected === expectedNote) ? "TO'G'RI" : "NOTO'G'RI");
 
                    if (
                        selected === expectedNote
                    ) {
 
                        rightAnswer(button, token);
 
                    } else {
 
                        wrongAnswer(button, token);
 
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
 
