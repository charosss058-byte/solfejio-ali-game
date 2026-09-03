let currentTargetNote = "Do"; // Hozirgi topshiriq dotasi

// Telegram Web App init
window.Telegram.WebApp.ready();
window.Telegram.WebApp.expand();

const videoPlayer = document.getElementById('aliVideo');
const instruction = document.getElementById('instructionText');

// Greeting tugagach task berish
videoPlayer.onended = function() {
    if (videoPlayer.src.includes('Greeting.mp4')) {
        playVideo('Task_Prompt.mp4');
        instruction.innerText = "Qani, DO notasini top-chi!";
    }
};

function playVideo(fileName) {
    videoPlayer.src = fileName;
    videoPlayer.play();
}

function checkNote(selectedNote) {
    if (selectedNote === currentTargetNote) {
        playVideo('Praise.mp4');
        instruction.innerText = "Barakalla! Juda to'g'ri topding!";
    } else {
        playVideo('Encouragement.mp4');
        instruction.innerText = "Qaytadan urinib ko'r!";
    }
}
