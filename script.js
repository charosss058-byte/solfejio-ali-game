

 document.addEventListener('DOMContentLoaded', () => {
    const video = document.getElementById('aliVideo');
    const feedbackText = document.getElementById('feedbackText');
    const buttons = document.querySelectorAll('.note-btn');

    const noteFrequencies = {
        'DO': 261.63,
        'RE': 293.66,
        'MI': 329.63,
        'FA': 349.23,
        'SOL': 392.00,
        'LA': 440.00,
        'SI': 493.88
    };

    const notes = ['DO', 'RE', 'MI', 'FA', 'SOL', 'LA', 'SI'];
    let currentTargetNote = 'DO'; // Бошланғич топшириқ
    let audioCtx = null;

    function playAudioNote(note) {
        if (!audioCtx) {
            audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        }
        if (audioCtx.state === 'suspended') {
            audioCtx.resume();
        }
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(noteFrequencies[note], audioCtx.currentTime);
        gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 1.2);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start();
        osc.stop(audioCtx.currentTime + 1.2);
    }

    function switchVideo(videoName) {
        video.src = videoName;
        video.load();
        video.play().catch(err => console.log("Video block error:", err));
    }

    // Нота тугмалари босилганда
    buttons.forEach(button => {
        button.addEventListener('click', () => {
            const selectedNote = button.getAttribute('data-note');
            
            // 1. Овоз чиқариш
            playAudioNote(selectedNote);

            // 2. Жавобни текшириш ва видеони алмаштириш
            if (selectedNote === currentTargetNote) {
                feedbackText.textContent = 'Баракалла! Тўғри топдингиз!';
                switchVideo('Praise.mp4');
                
                // 3 дақиқадан сўнг янги савол бериш
                setTimeout(() => {
                    currentTargetNote = notes[Math.floor(Math.random() * notes.length)];
                    feedbackText.textContent = `Энди ${currentTargetNote} нотасини топинг!`;
                    switchVideo('Task_Prompt.mp4');
                }, 3000);
            } else {
                feedbackText.textContent = 'Қайтадан уриниб кўринг!';
                switchVideo('Encouragement.mp4');
            }
        });
    });
});
          
