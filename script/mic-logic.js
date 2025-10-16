    document.addEventListener('DOMContentLoaded', function() {
      const flame = document.querySelector('.flame');
      const birthdayMusic = document.getElementById('birthdayMusic');
      const micPermission = document.getElementById('micPermission');
      const grantPermissionBtn = document.getElementById('grantPermission');
      
      let audioContext;
      let analyser;
      let microphone;
      let javascriptNode;
      let isCandleLit = true;
      let hasMusicPlayed = false;

      function createConfetti() {
        const colors = ['#ff4081', '#ffeb3b', '#4caf50', '#2196f3', '#9c27b0'];
        for (let i = 0; i < 100; i++) {
          const confetti = document.createElement('div');
          confetti.className = 'confetti';
          confetti.style.left = Math.random() * 100 + 'vw';
          confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
          confetti.style.animationDuration = (Math.random() * 3 + 2) + 's';
          confetti.style.animationDelay = Math.random() * 5 + 's';
          document.body.appendChild(confetti);
        }
      }

      function showMicPermission() {
        micPermission.classList.remove('hidden');
      }

      function hideMicPermission() {
        micPermission.classList.add('hidden');
      }

      function initMicrophone() {
        try {
          audioContext = new (window.AudioContext || window.webkitAudioContext)();
          analyser = audioContext.createAnalyser();
          analyser.fftSize = 256;

          navigator.mediaDevices.getUserMedia({ audio: true, video: false })
            .then(function(stream) {
              hideMicPermission();
              microphone = audioContext.createMediaStreamSource(stream);
              microphone.connect(analyser);

              javascriptNode = audioContext.createScriptProcessor(2048, 1, 1);
              analyser.connect(javascriptNode);
              javascriptNode.connect(audioContext.destination);

              javascriptNode.onaudioprocess = function() {
                if (!isCandleLit) return;

                const array = new Uint8Array(analyser.frequencyBinCount);
                analyser.getByteFrequencyData(array);

                let values = 0;
                for (let i = 0; i < array.length; i++) values += array[i];
                const average = values / array.length;

                if (average > 80) {
                  blowOutCandle();
                }
              };
            })
            .catch(function(err) {
              console.error('Error accessing microphone:', err);
              alert('Could not access microphone. Please refresh the page and try again.');
            });
        } catch (e) {
          console.error('Error initializing audio:', e);
          alert('Audio context not supported. Please try a different browser.');
        }
      }

     function blowOutCandle() {
  if (!isCandleLit) return;

  isCandleLit = false;
  flame.classList.add('blown');

  createConfetti();

  const blowSound = new Audio('https://assets.mixkit.co/sfx/preview/mixkit-wind-whistling-1492.mp3');
  blowSound.volume = 0.3;
  blowSound.play();

  if (!hasMusicPlayed) {
    birthdayMusic.play().then(() => { hasMusicPlayed = true; })
    .catch(e => console.error('Error playing music:', e));
  }

  // Delay showing birthday popup by 2 seconds
  setTimeout(() => {
    const popup = document.getElementById('birthdayPopup');
    popup.style.display = 'flex';
  }, 2000); // 2000ms = 2 seconds

  if (javascriptNode) {
    javascriptNode.onaudioprocess = null;
    javascriptNode.disconnect();
  }
  if (microphone) {
    microphone.disconnect();
  }
}

      grantPermissionBtn.addEventListener('click', initMicrophone);
      showMicPermission();
    });