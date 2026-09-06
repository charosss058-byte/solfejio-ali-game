(() => {
  "use strict";

  // =====================================================
  // SOLFEGIO 1-SINF — ALI BILAN NOTALARNI O'RGANAMIZ
  // =====================================================

  // -----------------------------
  // VIDEOLAR
  // -----------------------------
  const VIDEOS = {
    greeting: "Greeting.mp4",
    task: "Task_Prompt.mp4",
    praise: "Praise.mp4",
    encouragement: "Encouragement.mp4"
  };

  // -----------------------------
  // NOTALAR VA MP3 OVOZLARI
  // -----------------------------
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

  // -----------------------------
  // O'YIN HOLATI
  // -----------------------------
  let currentTargetNote = null;
  let score = 0;
  let questionNumber = 0;
  let gameStarted = false;
  let buttonsLocked = true;
  let videoBusy = false;

  // -----------------------------
  // HTML ELEMENTLAR
  // -----------------------------
  const videoPlayer =
    document.getElementById("aliVideo") ||
    document.querySelector("video");

  const instruction =
    document.getElementById("instructionText") ||
    document.querySelector(".instruction-text");

  const feedback =
    document.getElementById("feedbackText") ||
    document.querySelector(".feedback-text");

  const scoreElement =
    document.getElementById("score") ||
    document.querySelector(".score");

  const progressElement =
    document.getElementById("progressText") ||
    document.querySelector(".progress-text");

  const noteButtons = Array.from(
    document.querySelectorAll(".note-btn")
  );

  // =====================================================
  // TELEGRAM WEB APP
  // =====================================================

  try {
    if (window.Telegram && window.Telegram.WebApp) {
      window.Telegram.WebApp.ready();
      window.Telegram.WebApp.expand();
    }
  } catch (error) {
    console.log("Telegram WebApp:", error);
  }

  // =====================================================
  // AUDIO CACHE
  // =====================================================

  const noteAudio = {};

  NOTES.forEach((note) => {
    const audio = new Audio(NOTE_AUDIO[note]);
    audio.preload = "auto";
    audio.volume = 1;
    noteAudio[note] = audio;
  });

  // =====================================================
  // YORDAMCHI FUNKSIYALAR
  // =====================================================

  function normalizeNote(note) {
    if (!note) return "";

    const value = String(note)
      .trim()
      .toUpperCase();

    const aliases = {
      DO: "DO",
      RE: "RE",
      MI: "MI",
      FA: "FA",
      SOL: "SOL",
      SO: "SOL",
      LA: "LA",
      SI: "SI",
      TI: "SI"
    };

    return aliases[value] || value;
  }

  function setInstruction(text) {
    if (instruction) {
      instruction.textContent = text;
    }
  }

  function setFeedback(text) {
    if (feedback) {
      feedback.textContent = text;
    }
  }

  function updateScore() {
    if (scoreElement) {
      scoreElement.textContent = `⭐ ${score}`;
    }

    if (progressElement) {
      progressElement.textContent =
        `Savol: ${questionNumber}`;
    }
  }

  function getRandomNote() {
    const index = Math.floor(Math.random() * NOTES.length);
    return NOTES[index];
  }

  // =====================================================
  // NOTA OVOZINI O'YNATISH
  // =====================================================

  function stopAllNotes() {
    NOTES.forEach((note) => {
      const audio = noteAudio[note];

      if (!audio) return;

      try {
        audio.pause();
        audio.currentTime = 0;
      } catch (error) {
        console.log(error);
      }
    });
  }

  async function playNote(note) {
    const normalized = normalizeNote(note);
    const audio = noteAudio[normalized];

    if (!audio) {
      console.warn("Nota topilmadi:", note);
      return;
    }

    stopAllNotes();

    try {
      audio.currentTime = 0;
      await audio.play();
    } catch (error) {
      console.log("Nota ovozini ijro etib bo'lmadi:", error);
    }
  }

  // Global qilish — HTML ichidagi onclick uchun
  window.playNote = playNote;

  // =====================================================
  // VIDEO O'YNATISH
  // =====================================================

  function setVideo(fileName, onEnded) {
    if (!videoPlayer) {
      console.warn("Video elementi topilmadi.");
      if (typeof onEnded === "function") {
        onEnded();
      }
      return;
    }

    videoBusy = true;

    videoPlayer.pause();

    videoPlayer.onended = null;
    videoPlayer.onerror = null;

    videoPlayer.loop = false;
    videoPlayer.controls = false;

    // Eski videoni to'liq tozalash
    videoPlayer.removeAttribute("src");

    // Yangi video
    videoPlayer.src = fileName;
    videoPlayer.load();

    videoPlayer.onended = () => {
      videoBusy = false;

      if (typeof onEnded === "function") {
        onEnded();
      }
    };

    videoPlayer.onerror = () => {
      console.warn("Video yuklanmadi:", fileName);

      videoBusy = false;

      if (typeof onEnded === "function") {
        onEnded();
      }
    };

    const playPromise = videoPlayer.play();

    if (playPromise && typeof playPromise.catch === "function") {
      playPromise.catch((error) => {
        console.log("Video autoplay bloklandi:", error);

        videoBusy = false;

        // Foydalanuvchi keyinroq bosishi mumkin
        showStartButton();
      });
    }
  }

  // Global qilish
  window.playVideo = setVideo;

  // =====================================================
  // O'YINNI BOSHLASH
  // =====================================================

  function startGame() {
    if (gameStarted) return;

    gameStarted = true;
    score = 0;
    questionNumber = 0;
    currentTargetNote = null;

    buttonsLocked = true;

    updateScore();
    lockNoteButtons();

    hideStartButton();

    setInstruction("Salom! Notalarni birgalikda o‘rganamiz 🎵");
    setFeedback("");

    // Birinchi video
    setVideo(VIDEOS.greeting, () => {
      startNextQuestion();
    });
  }

  window.startGame = startGame;

  // =====================================================
  // KEYINGI SAVOL
  // =====================================================

  function startNextQuestion() {
    if (!gameStarted) return;

    buttonsLocked = true;
    lockNoteButtons();

    questionNumber++;

    // Tasodifiy nota
    currentTargetNote = getRandomNote();

    updateScore();

    setFeedback("");

    setInstruction(
      "Diqqat bilan tingla! Qaysi nota ekanini top-chi? 🎧"
    );

    // Avval savol videosi
    setVideo(VIDEOS.task, () => {

      // Task video tugagach kerakli nota ovozi
      setInstruction(
        "Ovozni tingla va to‘g‘ri notani tanla 🎵"
      );

      playNote(currentTargetNote);

      unlockNoteButtons();
    });
  }

  // =====================================================
  // NOTA TUGMALARINI BLOKIROVKA QILISH
  // =====================================================

  function lockNoteButtons() {
    noteButtons.forEach((button) => {
      button.disabled = true;
      button.classList.add("disabled");
    });
  }

  function unlockNoteButtons() {
    buttonsLocked = false;

    noteButtons.forEach((button) => {
      button.disabled = false;
      button.classList.remove("disabled");
    });
  }

  // =====================================================
  // TANLANGAN NOTANI ANIQLASH
  // =====================================================

  function getButtonNote(button) {
    if (!button) return "";

    // data-note bo'lsa
    if (button.dataset && button.dataset.note) {
      return normalizeNote(button.dataset.note);
    }

    // Tugma matnidan olish
    return normalizeNote(button.textContent);
  }

  // =====================================================
  // JAVOBNI TEKSHIRISH
  // =====================================================

  function checkNote(selectedNote) {
    if (!gameStarted) {
      startGame();
      return;
    }

    if (buttonsLocked) return;

    const selected = normalizeNote(selectedNote);
    const correct = normalizeNote(currentTargetNote);

    if (!selected) return;

    // Tanlangan notaning o'z ovozini chiqarish
    playNote(selected);

    // Tugmalarni vaqtincha bloklash
    buttonsLocked = true;
    lockNoteButtons();

    // -----------------------------------------
    // TO'G'RI JAVOB
    // -----------------------------------------

    if (selected === correct) {

      score++;
      updateScore();

      setInstruction("BARAKALLA! 🎉");
      setFeedback(
        `To‘g‘ri! Bu ${correct} notasi edi. ⭐`
      );

      setVideo(VIDEOS.praise, () => {

        // Praise tugagach yangi savol
        setTimeout(() => {
          startNextQuestion();
        }, 300);
      });

    }

    // -----------------------------------------
    // NOTO'G'RI JAVOB
    // -----------------------------------------

    else {

      setInstruction("Hechqisi yo‘q 😊");
      setFeedback(
        "Yana bir marta urinib ko‘r! 👂🎵"
      );

      setVideo(VIDEOS.encouragement, () => {

        setTimeout(() => {

          setInstruction(
            "Yana bir bor tingla va to‘g‘ri notani top 🎧"
          );

          setFeedback("");

          // O'sha savolni qayta eshittiramiz
          playNote(correct);

          unlockNoteButtons();

        }, 300);
      });
    }
  }

  // Global qilish
  window.checkNote = checkNote;

  // =====================================================
  // NOTE TUGMALARIGA ULASH
  // =====================================================

  noteButtons.forEach((button) => {

    const inlineClick =
      button.getAttribute("onclick");

    // Agar HTML ichida onclick allaqachon bo'lsa,
    // ikkinchi marta event qo'shmaymiz.
    if (inlineClick) return;

    button.addEventListener("click", () => {

      const note = getButtonNote(button);

      checkNote(note);
    });
  });

  // =====================================================
  // START BUTTON
  // =====================================================

  let startButton = document.getElementById("startGameBtn");

  function createStartButton() {

    if (startButton) return startButton;

    startButton = document.createElement("button");

    startButton.id = "startGameBtn";
    startButton.type = "button";
    startButton.textContent = "▶️ O‘yinni boshlash";

    startButton.style.display = "block";
    startButton.style.margin = "15px auto";
    startButton.style.padding = "14px 28px";
    startButton.style.border = "none";
    startButton.style.borderRadius = "14px";
    startButton.style.fontSize = "18px";
    startButton.style.fontWeight = "bold";
    startButton.style.cursor = "pointer";
    startButton.style.background = "#4CAF50";
    startButton.style.color = "#ffffff";
    startButton.style.boxShadow =
      "0 4px 12px rgba(0,0,0,0.15)";

    startButton.addEventListener(
      "click",
      startGame
    );

    // Eng qulay joyga qo'yamiz
    if (videoPlayer && videoPlayer.parentElement) {
      videoPlayer.parentElement.after(startButton);
    } else {
      document.body.prepend(startButton);
    }

    return startButton;
  }

  function showStartButton() {
    const btn = createStartButton();

    if (!gameStarted) {
      btn.style.display = "block";
    }
  }

  function hideStartButton() {
    if (startButton) {
      startButton.style.display = "none";
    }
  }

  // =====================================================
  // BOSHLANG'ICH HOLAT
  // =====================================================

  function initializeGame() {

    lockNoteButtons();

    setInstruction(
      "Ali bilan notalarni o‘rganamiz 🎵"
    );

    setFeedback("");

    updateScore();

    // Tugma mavjud bo'lsa
    if (document.getElementById("startGameBtn")) {

      startButton =
        document.getElementById("startGameBtn");

      startButton.addEventListener(
        "click",
        startGame
      );

    } else {

      // Avval avtomatik boshlashga urinib ko'ramiz.
      // Brauzer ruxsat bermasa Start tugmasi chiqadi.
      startGame();
    }
  }

  // =====================================================
  // DOM TAYYOR BO'LGACH ISHGA TUSHADI
  // =====================================================

  if (document.readyState === "loading") {

    document.addEventListener(
      "DOMContentLoaded",
      initializeGame
    );

  } else {

    initializeGame();

  }

})();
