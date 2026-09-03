
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
    let currentTargetNote = '';
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

    function playVideo(fileName) {
        video.src = fileName;
        video.currentTime = 0;
        const playPromise = video.play();
        if (playPromise !== undefined) {
            playPromise.catch(error => {
                console.log('Video autoplay status:', error);
            });
        }
    }

    function startNewTask() {
        currentTargetNote = notes[Math.floor(Math.random() * notes.length)];
        feedbackText.textContent = `Топшириқ: ${currentTargetNote} нотасини топинг!`;
        playVideo('Task_Prompt.mp4');
    }

    // Видео тугаганда кейингисига ўтиш
    video.onended = () => {
        const currentSrc = video.src.split('/').pop();
        
        if (currentSrc === 'Greeting.mp4' || currentSrc === 'Praise.mp4' || currentSrc === 'Encouragement.mp4') {
            setTimeout(startNewTask, 500);
        }
    };

    buttons.forEach(button => {
        button.addEventListener('click', () => {
            const selectedNote = button.getAttribute('data-note');
            playAudioNote(selectedNote);

            if (!currentTargetNote) {
                startNewTask();
                return;
            }

            if (selectedNote === currentTargetNote) {
                feedbackText.textContent = 'Баракалла! Тўғри топдингиз!';
                playVideo('Praise.mp4');
            } else {
                feedbackText.textContent = 'Қайтадан уриниб кўринг!';
                playVideo('Encouragement.mp4');
            }
        });
    });
});    
