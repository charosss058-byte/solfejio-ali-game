document.addEventListener('DOMContentLoaded', () => {
    const video = document.getElementById('aliVideo');
    const videoSource = document.getElementById('videoSource');
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

    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

    function playAudioNote(note) {
        if (audioCtx.state === 'suspended') {
            audioCtx.resume();
        }
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(noteFrequencies[note], audioCtx.currentTime);
        gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 1.5);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start();
        osc.stop(audioCtx.currentTime + 1.5);
    }

    function changeVideo(srcName) {
        videoSource.src = srcName;
        video.load();
        video.play().catch(e => console.log('Autoplay restriction:', e));
    }

    function startNewTask() {
        currentTargetNote = notes[Math.floor(Math.random() * notes.length)];
        feedbackText.textContent = `Топшириқ: ${currentTargetNote} нотасини топинг!`;
        changeVideo('Task_Prompt.mp4');
    }

    video.addEventListener('ended', () => {
        if (videoSource.getAttribute('src') === 'Greeting.mp4' || 
            videoSource.getAttribute('src') === 'Praise.mp4' || 
            videoSource.getAttribute('src') === 'Encouragement.mp4') {
            setTimeout(startNewTask, 1000);
        }
    });

    buttons.forEach(button => {
        button.addEventListener('click', () => {
            const selectedNote = button.getAttribute('data-note');
            playAudioNote(selectedNote);

            if (!currentTargetNote) {
                return;
            }

            if (selectedNote === currentTargetNote) {
                feedbackText.textContent = 'Баракалла! Тўғри топдингиз!';
                changeVideo('Praise.mp4');
            } else {
                feedbackText.textContent = 'Қайтадан уриниб кўринг!';
                changeVideo('Encouragement.mp4');
            }
        });
    });
});
