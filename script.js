(() => {
  "use strict";

  // ================================
  // VIDEOLAR
  // ================================
  const VIDEOS = {
    greeting: "Greeting.mp4",
    task: "Task_Prompt.mp4",
    praise: "Praise.mp4",
    encouragement: "Encouragement.mp4"
  };

  // ================================
  // NOTA MP3 LARI
  // ================================
  const NOTE_AUDIO = {
    DO: "C4.mp3",
    RE: "D4.mp3",
    MI: "E4.mp3",
    FA: "F4.mp3",
    SOL: "G4.mp3",
    LA: "A4.mp3",
    SI: "B4.mp3"
  };

  const NOTES = Object.keys(NOTE_AUDIO);

  // ================================
  // HTML ELEMENTLAR
  // ================================
  const video = document.getElementById("aliVideo");

  const instruction =
    document.getElementById("instructionText");

  const noteButtons =
    Array.from(document.querySelectorAll(".note-btn"));

  // ================================
  // O'YIN HOLATI
  // ================================
  let gameStarted = false;
  let currentNote = "";
  let score = 0;
  let question = 0;
  let locked = true;

  // ================================
  // AUDIO
  // ================================
  const audios = {};

  NOTES.forEach(note => {
    audios[note] = new Audio(NOTE_AUDIO[note]);
    audios[note].preload = "auto";
    audios[note].volume = 1;
  });

  // ================================
  // TELEGRAM
  // ================================
  try {
    if (window.Telegram && window.Telegram.WebApp) {
      window.Telegram.WebApp.ready();
      window.Telegram.WebApp.expand();
    }
  } catch (e) {
    console.log(e);
  }

  // ================================
  // YORDAMCHI FUNKSIYA
  // ================================
  function normalize(note) {
    return String(note || "")
      .trim()
      .toUpperCase();
  }

  function message(text) {
    if (instruction) {
      instruction.textContent = text;
    }
  }

  function randomNote() {
    return NOTES[Math.floor(Math.random() * NOTES.length)];
  }

  // ================================
  // BARCHA NOTA OVOZLARINI TO'XTATISH
  // ================================
  function stopAllAudio() {
    NOTES.forEach(note => {
      try {
        audios[note].pause();
        audios[note].currentTime = 0;
      } catch (e) {}
    });
  }

  // ================================
  // NOTA OVOZINI O'YNATISH
  // ================================
  async function playNote(note) {
    note = normalize(note);

    if (!audios[note]) {
      console.log("Nota topilmadi:", note);
      return;
    }

    stopAllAudio();

    try {
      audios[note].currentTime = 0;
      await audios[note].play();
    } catch (e) {
      console.log("Nota ovozi:", e);
    }
  }

  window.playNote = playNote;

  // ================================
  // VIDEO O'YNATISH
  // ================================
  function playVideo(file, finished) {

    if (!video) {
      console.log("aliVideo topilmadi");

      if (finished) {
        finished();
      }

      return;
    }

    video.pause();

    video.onended = null;
    video.onerror = null;

    video.loop = false;
    video.controls = false;

    video.src = file;
    video.load();

    video.onended = () => {

      video.onended = null;

      if (finished) {
        finished();
      }
    };

    video.onerror = () => {

      console.log("Video yuklanmadi:", file);

      video.onerror = null;

      if (finished) {
        finished();
      }
    };

    const promise = video.play();

    if (promise) {
      promise.catch(error => {
        console.log("Video play xatosi:", error);
      });
    }
  }

  window.playVideo = playVideo;

  // ================================
  // TUGMALARNI BLOKIROVKA
  // ================================
  function lockButtons() {

    locked = true;

    noteButtons.forEach(button => {
      button.disabled = true;
    });
  }

  // ================================
  // TUGMALARNI OCHISH
  // ================================
  function unlockButtons() {

    locked = false;

    noteButtons.forEach(button => {
      button.disabled = false;
    });
  }

  // ================================
  // O'YINNI BOSHLASH
  // ================================
  function startGame() {

    if (gameStarted) {
      return;
    }

    gameStarted = true;
    score = 0;
    question = 0;

    lockButtons();

    message(
      "Salom! Notalarni birgalikda o‘rganamiz 🎵"
    );

    // 1. Greeting
    playVideo(VIDEOS.greeting, () => {

      // 2. Greeting tugagach keyingi savol
      nextQuestion();

    });
  }

  window.startGame = startGame;

  // ================================
  // KEYINGI SAVOL
  // ================================
  function nextQuestion() {

    question++;

    // Tasodifiy nota
    currentNote = randomNote();

    lockButtons();

    message(
      `Diqqat bilan tingla! 🎧 Savol ${question}`
    );

    // Task_Prompt videosi
    playVideo(VIDEOS.task, () => {

      message(
        "Ovozni diqqat bilan tingla va notani top 🎵"
      );

      // Kerakli nota ovozi
      playNote(currentNote);

      // Nota ovozi boshlangach tugmalar ochiladi
      setTimeout(() => {
        unlockButtons();
      }, 200);
    });
  }

  // ================================
  // JAVOBNI TEKSHIRISH
  // ================================
  function checkNote(selectedNote) {

    if (!gameStarted) {
      startGame();
      return;
    }

    if (locked) {
      return;
    }

    const selected = normalize(selectedNote);
    const correct = normalize(currentNote);

    if (!selected) {
      return;
    }

    // Tanlangan nota ovozini chiqarish
    playNote(selected);

    // Tugmalarni vaqtincha yopish
    lockButtons();

    // ==============================
    // TO'G'RI JAVOB
    // ==============================
    if (selected === correct) {

      score++;

      message(
        `🎉 BARAKALLA! To‘g‘ri javob — ${correct}! ⭐`
      );

      // Praise video
      playVideo(VIDEOS.praise, () => {

        // Praise tugagach avtomatik yangi savol
        setTimeout(() => {

          nextQuestion();

        }, 400);
      });

    }

    // ==============================
    // XATO JAVOB
    // ==============================
    else {

      message(
        "😊 Hechqisi yo‘q! Yana bir marta urinib ko‘r."
      );

      // Encouragement video
      playVideo(VIDEOS.encouragement, () => {

        setTimeout(() => {

          message(
            "Yana bir marta tingla va to‘g‘ri notani top 🎧"
          );

          // Shu savolning notasini yana eshittirish
          playNote(correct);

          // Tugmalarni yana ochish
          unlockButtons();

        }, 400);
      });
    }
  }

  window.checkNote = checkNote;

  // ================================
  // NOTA TUGMALARI
  // ================================
  noteButtons.forEach(button => {

    // Agar HTML ichida onclick bor bo'lsa,
    // alohida listener qo'shmaymiz.
    if (button.getAttribute("onclick")) {
      return;
    }

    button.addEventListener("click", () => {

      const note =
        button.textContent.trim();

      checkNote(note);

    });
  });

  // ================================
  // BOSHLASH TUGMASINI TOPISH
  // ================================
  const allButtons =
    Array.from(document.querySelectorAll("button"));

  const startButton = allButtons.find(button => {

    const text =
      button.textContent
        .trim()
        .toLowerCase();

    return (
      text.includes("boshlash") ||
      text.includes("o‘yinni boshlash") ||
      text.includes("o'yinni boshlash")
    );
  });

  // ================================
  // BOSHLASH TUGMASIGA ULASH
  // ================================
  if (startButton) {

    startButton.addEventListener("click", () => {

      startGame();

    });

  } else {

    console.log(
      "Boshlash tugmasi topilmadi."
    );
  }

  // ================================
  // BOSHLANG'ICH HOLAT
  // ================================
  lockButtons();

  message(
    "🎵 O‘yinni boshlash tugmasini bosing"
  );

})();
