
    (() => {
  "use strict";

  // =========================
  // VIDEOLAR
  // =========================
  const VIDEOS = {
    greeting: "Greeting.mp4",
    task: "Task_Prompt.mp4",
    praise: "Praise.mp4",
    encouragement: "Encouragement.mp4"
  };

  // =========================
  // NOTALAR VA ULARNING OVOZLARI
  // =========================
  const NOTES = [
    { name: "DO",  frequency: 261.63 },
    { name: "RE",  frequency: 293.66 },
    { name: "MI",  frequency: 329.63 },
    { name: "FA",  frequency: 349.23 },
    { name: "SOL", frequency: 392.00 },
    { name: "LA",  frequency: 440.00 },
    { name: "SI",  frequency: 493.88 }
  ];

  // =========================
  // ELEMENTLAR
  // =========================
  const video = document.getElementById("aliVideo");
  const videoMessage = document.getElementById("videoMessage");

  const instructionText =
    document.getElementById("instructionText");

  const helperText =
    document.getElementById("helperText");

  const feedbackText =
    document.getElementById("feedbackText");

  const statusPill =
    document.getElementById("statusPill");

  const progressText =
    document.getElementById("progressText");

  const scoreText =
    document.getElementById("scoreText");

  const notesGrid =
    document.getElementById("notesGrid");

  const startBtn =
    document.getElementById("startBtn");

  const restartBtn =
    document.getElementById("restartBtn");

  const resultCard =
    document.getElementById("resultCard");

  const resultText =
    document.getElementById("resultText");

  const resultRestartBtn =
    document.getElementById("resultRestartBtn");


  // =========================
  // O'YIN HOLATI
  // =========================
  let audioContext = null;

  let currentRound = 0;

  let score = 0;

  let currentTarget = null;

  let gameStarted = false;

  let canAnswer = false;

  let timer = null;


  // =========================
  // TELEGRAM
  // =========================
  function initTelegram() {

    if (
      window.Telegram &&
      window.Telegram.WebApp
    ) {
      try {
        const tg = window.Telegram.WebApp;

        tg.ready();
        tg.expand();

      } catch (error) {
        console.log("Telegram WebApp:", error);
      }
    }
  }


  // =========================
  // AUDIO TIZIMI
  // =========================
  function initAudio() {

    if (!audioContext) {

      const AudioContext =
        window.AudioContext ||
        window.webkitAudioContext;

      if (!AudioContext) {
        return null;
      }

      audioContext = new AudioContext();
    }

    if (
      audioContext.state === "suspended"
    ) {
      audioContext.resume().catch(() => {});
    }

    return audioContext;
  }


  // =========================
  // NOTA OVOZINI CHIQARISH
  // =========================
  function playNote(noteName) {

    const note = NOTES.find(
      item => item.name === noteName
    );

    const ctx = initAudio();

    if (!note || !ctx) {
      return;
    }

    const oscillator =
      ctx.createOscillator();

    const gain =
      ctx.createGain();

    oscillator.type = "sine";

    oscillator.frequency.setValueAtTime(
      note.frequency,
      ctx.currentTime
    );

    gain.gain.setValueAtTime(
      0.0001,
      ctx.currentTime
    );

    gain.gain.exponentialRampToValueAtTime(
      0.25,
      ctx.currentTime + 0.03
    );

    gain.gain.exponentialRampToValueAtTime(
      0.0001,
      ctx.currentTime + 0.9
    );

    oscillator.connect(gain);

    gain.connect(ctx.destination);

    oscillator.start();

    oscillator.stop(
      ctx.currentTime + 0.95
    );
  }


  // =========================
  // VIDEO QO'YISH
  // =========================
  function playVideo(
    filename,
    message = ""
  ) {

    clearTimeout(timer);

    if (!video) {
      return;
    }

    video.src = filename;

    video.load();

    if (videoMessage) {

      videoMessage.textContent =
        message;

      videoMessage.classList.toggle(
        "show",
        Boolean(message)
      );
    }

    const promise =
      video.play();

    if (
      promise &&
      typeof promise.catch === "function"
    ) {

      promise.catch(() => {

        if (videoMessage) {

          videoMessage.textContent =
            "Videoni ko‘rish uchun ▶ tugmasini bosing.";

          videoMessage.classList.add("show");
        }
      });
    }
  }


  // =========================
  // TUGMALARNI YOQISH/O'CHIRISH
  // =========================
  function setButtons(enabled) {

    const buttons =
      notesGrid.querySelectorAll(
        ".note-btn"
      );

    buttons.forEach(button => {

      button.disabled = !enabled;

      button.classList.remove(
        "selected",
        "correct",
        "wrong"
      );
    });
  }


  // =========================
  // PROGRESS
  // =========================
  function updateProgress() {

    progressText.textContent =
      `${currentRound + 1} / ${NOTES.length}`;

    scoreText.textContent =
      `⭐ ${score}`;
  }


  // =========================
  // YANGI TOPSHIRIQ
  // =========================
  function startRound() {

    clearTimeout(timer);

    if (
      currentRound >= NOTES.length
    ) {

      finishGame();

      return;
    }

    currentTarget =
      NOTES[currentRound];

    canAnswer = false;

    setButtons(false);

    updateProgress();

    statusPill.textContent =
      "🎯 Topshiriq";

    instructionText.textContent =
      "Diqqat bilan tinglang!";

    helperText.textContent =
      "Ali topshiriqni tushuntiradi. Keyin kerakli notani tanlang.";

    feedbackText.textContent = "";

    playVideo(
      VIDEOS.task,
      "Ali topshiriqni tushuntirmoqda…"
    );


    // Task videosi tugaganda javoblarni ochamiz
    video.onended = function () {

      enableAnswer();

    };


    // Agar video ishlamasa yoki foydalanuvchi
    // videoni o'tkazib yuborsa, birozdan keyin
    // tugmalar ochiladi.
    timer = setTimeout(
      enableAnswer,
      5000
    );
  }


  // =========================
  // JAVOB BERISHNI BOSHLASH
  // =========================
  function enableAnswer() {

    if (canAnswer) {
      return;
    }

    clearTimeout(timer);

    canAnswer = true;

    setButtons(true);

    statusPill.textContent =
      "🎵 Notani tanlang";

    instructionText.textContent =
      "Qaysi nota kerak?";

    helperText.textContent =
      `Kerakli nota: ${currentTarget.name} ni toping.`;

    if (videoMessage) {
      videoMessage.classList.remove("show");
    }
  }


  // =========================
  // JAVOBNI TEKSHIRISH
  // =========================
  function checkAnswer(
    selectedNote,
    button
  ) {

    if (!canAnswer) {
      return;
    }

    // Har bir bosishda nota ovozi
    playNote(selectedNote);

    button.classList.add(
      "selected"
    );

    canAnswer = false;

    setButtons(false);


    // =====================
    // TO'G'RI JAVOB
    // =====================
    if (
      selectedNote ===
      currentTarget.name
    ) {

      score++;

      button.classList.add(
        "correct"
      );

      statusPill.textContent =
        "🎉 To‘g‘ri!";

      instructionText.textContent =
        "Barakalla! Juda yaxshi!";

      helperText.textContent =
        `${currentTarget.name} — to‘g‘ri javob!`;

      feedbackText.textContent =
        "👏 Ajoyib topdingiz!";

      scoreText.textContent =
        `⭐ ${score}`;

      playVideo(
        VIDEOS.praise,
        "Barakalla! 🎉"
      );


      // Praise videosidan keyin keyingi nota
      video.onended = function () {

        currentRound++;

        startRound();
      };


      // Video ishlamasa ham o'tib ketadi
      timer = setTimeout(
        () => {

          currentRound++;

          startRound();

        },
        5000
      );

    }

    // =====================
    // NOTO'G'RI JAVOB
    // =====================
    else {

      button.classList.add(
        "wrong"
      );

      statusPill.textContent =
        "💪 Yana urinib ko‘ring";

      instructionText.textContent =
        "Bu boshqa nota!";

      helperText.textContent =
        "Ali sizga yana bir imkoniyat beradi.";

      feedbackText.textContent =
        "🎵 Diqqat bilan tinglang.";

      playVideo(
        VIDEOS.encouragement,
        "Yana bir marta urinib ko‘ring! 💪"
      );


      video.onended = function () {

        enableAnswer();

      };


      timer = setTimeout(
        enableAnswer,
        4000
      );
    }
  }


  // =========================
  // O'YINNI TUGATISH
  // =========================
  function finishGame() {

    clearTimeout(timer);

    canAnswer = false;

    setButtons(false);

    progressText.textContent =
      "7 / 7";

    scoreText.textContent =
      `⭐ ${score}`;

    statusPill.textContent =
      "🏆 Natija";

    instructionText.textContent =
      "O‘yin tugadi!";

    helperText.textContent =
      "Siz barcha 7 ta nota topshirig‘ini bajardingiz.";

    feedbackText.textContent =
      "🎉 Barakalla!";

    resultText.textContent =
      `7 ta topshiriqdan ${score} tasini to‘g‘ri topdingiz.`;

    resultCard.classList.remove(
      "hidden"
    );

    restartBtn.classList.remove(
      "hidden"
    );
  }


  // =========================
  // O'YINNI BOSHLASH
  // =========================
  function startGame() {

    clearTimeout(timer);

    initAudio();

    gameStarted = true;

    currentRound = 0;

    score = 0;

    startBtn.classList.add(
      "hidden"
    );

    restartBtn.classList.remove(
      "hidden"
    );

    resultCard.classList.add(
      "hidden"
    );

    startRound();
  }


  // =========================
  // O'YINNI QAYTA BOSHLASH
  // =========================
  function restartGame() {

    clearTimeout(timer);

    gameStarted = false;

    currentRound = 0;

    score = 0;

    currentTarget = null;

    canAnswer = false;

    resultCard.classList.add(
      "hidden"
    );

    restartBtn.classList.add(
      "hidden"
    );

    startBtn.classList.remove(
      "hidden"
    );

    statusPill.textContent =
      "🎵 Tayyorlanamiz";

    instructionText.textContent =
      "Notalarni o‘rganamiz!";

    helperText.textContent =
      "Avval Ali bilan tanishib oling.";

    feedbackText.textContent = "";

    updateProgress();

    setButtons(false);

    playVideo(
      VIDEOS.greeting,
      "Ali siz bilan salomlashmoqda…"
    );
  }


  // =========================
  // NOTA TUGMALARI
  // =========================
  notesGrid.addEventListener(
    "click",
    event => {

      const button =
        event.target.closest(
          ".note-btn"
        );

      if (!button) {
        return;
      }

      const selectedNote =
        button.dataset.note;

      checkAnswer(
        selectedNote,
        button
      );
    }
  );


  // =========================
  // BOSHLASH TUGMASI
  // =========================
  startBtn.addEventListener(
    "click",
    startGame
  );


  // =========================
  // QAYTA BOSHLASH
  // =========================
  restartBtn.addEventListener(
    "click",
    restartGame
  );

  resultRestartBtn.addEventListener(
    "click",
    restartGame
  );


  // =========================
  // VIDEO TUGAGANDA
  // =========================
  video.addEventListener(
    "ended",
    () => {

      if (!gameStarted) {

        if (videoMessage) {

          videoMessage.textContent =
            "Tanishtiruv tugadi. Boshlash tugmasini bosing.";

          videoMessage.classList.add(
            "show"
          );
        }
      }
    }
  );


  // =========================
  // BOSHLANG'ICH HOLAT
  // =========================
  initTelegram();

  setButtons(false);

  updateProgress();

  playVideo(
    VIDEOS.greeting,
    "Ali siz bilan salomlashmoqda…"
  );

})(); 
