document.addEventListener('DOMContentLoaded', function () {
    const canvas = document.getElementById('starfield');
    const ctx = canvas.getContext('2d');
    let stars = [];
    const numStars = 200;
    const numTwinklingStars = 100;
    const shootingStars = [];
    const maxShootingStars = 1;

    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    
        stars = [];
        createStars();
    }

    function createStars() {
        for (let i = 0; i < numStars; i++) {
            stars.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                radius: Math.random() * 1.5 + 0.5,
                velocity: Math.random() * 0.5 + 0.2,
                isTwinkling: i < numTwinklingStars,
                twinklePhase: Math.random() * Math.PI * 2
            });
        }
    }

    resizeCanvas();
    createStars();

    window.addEventListener('resize', () => {
        resizeCanvas(); 
    });
    
    function createShootingStar() {
    const startSide = Math.floor(Math.random() * 4);
    let x, y, velocityX, velocityY, angle;

    switch (startSide) {
        case 0: // Left side
            x = -30; y = Math.random() * canvas.height;
            angle = Math.random() * Math.PI / 3 - Math.PI / 6;
            velocityX = Math.cos(angle) * (Math.random() * 4 + 3);
            velocityY = Math.sin(angle) * (Math.random() * 4 + 3);
            break;
        case 1: // Top side
            x = Math.random() * canvas.width; y = -30;
            angle = Math.random() * Math.PI / 3 + Math.PI / 3;
            velocityX = Math.cos(angle) * (Math.random() * 4 + 3);
            velocityY = Math.sin(angle) * (Math.random() * 4 + 3);
            break;
        case 2: // Right side
            x = canvas.width + 30; y = Math.random() * canvas.height;
            angle = Math.random() * Math.PI / 3 + (2 * Math.PI / 3);
            velocityX = Math.cos(angle) * -(Math.random() * 4 + 3);
            velocityY = Math.sin(angle) * (Math.random() * 4 + 3);
            break;
        case 3: // Bottom side
            x = Math.random() * canvas.width; y = canvas.height + 30;
            angle = Math.random() * Math.PI / 3 + (4 * Math.PI / 3);
            velocityX = Math.cos(angle) * -(Math.random() * 4 + 3);
            velocityY = Math.sin(angle) * -(Math.random() * 4 + 3);
            break;
    }

    const length = Math.random() * 10 + 20; 
    const brightness = Math.random() * 0.8 + 0.5; 
    const lifetime = 300;

    return { x, y, velocityX, velocityY, length, brightness, fade: 0, lifetime, tail: [] };
    }

    function drawShootingStar(star) {
    const tailLength = star.tail.length;

    const fadeFactor = Math.min(star.fade / (star.lifetime / 2), 1); 
    const fadeOutFactor = Math.max((star.lifetime - star.fade) / (star.lifetime / 2), 0); 
    const finalFadeFactor = Math.min(fadeFactor, fadeOutFactor); 

    for (let i = 0; i < tailLength; i++) {
        const pos = star.tail[i];
        const tailOpacity = (i / tailLength) * finalFadeFactor; 
        const size = 2 * (1 - tailOpacity);

        ctx.beginPath();
        ctx.arc(pos.x, pos.y, size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${tailOpacity * star.brightness})`;
        ctx.fill();
    }

    const grad = ctx.createRadialGradient(star.x, star.y, 0, star.x, star.y, 6);
    grad.addColorStop(0, `rgba(255, 255, 255, ${1 * finalFadeFactor})`);
    grad.addColorStop(0.5, `rgba(255, 255, 255, ${0.8 * finalFadeFactor})`); 
    grad.addColorStop(1, `rgba(255, 255, 255, 0)`); 

    ctx.beginPath();
    ctx.arc(star.x, star.y, 6, 0, Math.PI * 2);
    ctx.fillStyle = grad; 
    ctx.fill();

    star.tail.push({ x: star.x, y: star.y });
    if (star.tail.length > star.length) star.tail.shift();
    }

    function updateShootingStar(star) {
    star.x += star.velocityX;
    star.y += star.velocityY;
    star.fade++;

    if (star.x < -30 || star.x > canvas.width + 30 || star.y < -30 || star.y > canvas.height + 30 || star.fade > star.lifetime) {
        shootingStars.splice(shootingStars.indexOf(star), 1); 
    }
    }

    function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    stars.forEach(star => {
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
        ctx.fillStyle = star.isTwinkling ? `rgba(0, 102, 204, ${(Math.sin(star.twinklePhase) + 1) / 2})` : '#ffffff';
        ctx.fill();
        star.y += star.velocity;
        if (star.y > canvas.height) star.y = 0;
    });

    shootingStars.forEach(star => {
        drawShootingStar(star);
        updateShootingStar(star);
    });

    if (shootingStars.length < maxShootingStars && Math.random() < 0.01) { 
        shootingStars.push(createShootingStar());
    }

    requestAnimationFrame(animate);
    }
    animate();

    window.addEventListener('resize', resizeCanvas);

    const bigText = document.getElementById('big-text');
    const subtitle = document.getElementById('subtitle');
    const subtitle2 = document.getElementById('subtitle2');
    const slides = document.querySelectorAll('.slide');
    const slideCounter = document.getElementById('slide-counter');
    const muteButton = document.getElementById('mute-button');
    let currentSlideIndex = -1;
    let currentSlide = -1;
    let isTransitioning = false;
    let isMuted = false;
    let isSpeaking = false;
    let currentTTSIndex = 0;
    let ttsQueue = [];
    let currentUtterance = null;
    let selectedVoice = null;
    let voices = [];
    
    function playTTSForSlide(slideIndex) {
    stopTTS();

    const slide = slides[slideIndex];
    const ttsElements = slide.querySelectorAll('.tts');

    if (ttsElements.length === 0) return;

    ttsQueue = Array.from(ttsElements).map(element => element.textContent.trim());
    currentTTSIndex = 0;
    isSpeaking = true;
    currentSlideIndex = slideIndex;

    updatePlayPauseButton(slideIndex, 'PAUSE');

    speakNextBulletPoint();
    }

    function stopTTS() {
    if (isSpeaking) {
        window.speechSynthesis.cancel(); 
        isSpeaking = false;
        currentSlideIndex = -1;
        resetPlayPauseButtons();
    }
    }

    function speakNextBulletPoint() {
    if (!isSpeaking || currentTTSIndex >= ttsQueue.length) {
        stopTTS(); 
        return;
    }

    const text = ttsQueue[currentTTSIndex];
    currentUtterance = new SpeechSynthesisUtterance(text);
    currentUtterance.voice = selectedVoice; 

    currentUtterance.onend = () => {
        currentTTSIndex++; 
        speakNextBulletPoint(); 
    };

    window.speechSynthesis.speak(currentUtterance);
    }

    function hideAllPlayPauseButtons() {
    slides.forEach(slide => {
        const button = slide.querySelector('.play-pause-btn');
        if (button) {
            button.style.visibility = 'hidden';
            button.style.pointerEvents = 'none';
        }
    });
    }

    function showPlayPauseButton(slideIndex) {
    const button = slides[slideIndex].querySelector('.play-pause-btn');
    if (button) {
        button.style.visibility = 'visible';
        button.style.pointerEvents = 'auto';
    }
    }

    function updatePlayPauseButton(slideIndex, text) {
    const button = slides[slideIndex].querySelector('.play-pause-btn');
    if (button) {
        button.textContent = text;
    }
    }

    function resetPlayPauseButtons() {
    document.querySelectorAll('.play-pause-btn').forEach(button => {
        button.textContent = 'PLAY';
    });
    }

    document.querySelectorAll('.play-pause-btn').forEach((button, index) => {
    button.addEventListener('click', () => {
        if (isSpeaking && currentSlideIndex === index) {
            stopTTS(); 
        } else {
            playTTSForSlide(index); 
        }
    });
    });

    function updateSlideVisibility(slideIndex) {
    hideAllPlayPauseButtons();
    showPlayPauseButton(slideIndex);
    }

    setTimeout(() => {
    subtitle.classList.remove('hidden');
    subtitle2.classList.remove('hidden2');
    }, 150);

    function showNotification() {
        const notifyBox = document.getElementById('notify-box');
        const thoughtBubble = document.querySelector('.thought-bubble');
    
        if (currentSlide === 0) {
            notifyBox.classList.add('show');
            thoughtBubble.classList.add('show');
            
            setTimeout(() => {
                notifyBox.classList.remove('show');
                notifyBox.classList.add('hide');
                
                thoughtBubble.classList.remove('show');
                thoughtBubble.classList.add('hide');
            }, 999999);
        }
    }    
    
    function showNextSlide() {
        if (isTransitioning) return;
        isTransitioning = true;

        stopTTS();
    
        if (currentSlide >= slides.length - 1) {
            isTransitioning = false;
            return;
        }
    
        if (currentSlide === -1) {
            bigText.classList.add('hidden');
            subtitle.classList.add('hidden');
            subtitle2.classList.add('hidden2');
            slideCounter.classList.remove('hidden');
            slideCounter.classList.add('visible');
        } else {
            slides[currentSlide].classList.remove('visible');
            slides[currentSlide].classList.add('hidden');
        }

        currentSlide++;
    
        slides[currentSlide].classList.add('visible');
        slides[currentSlide].classList.remove('hidden');
    
        updateSlideVisibility(currentSlide);
    
        slideCounter.textContent = `Slide: ${currentSlide + 1} / ${slides.length}`;

        updateTtsForCurrentSlide();
    
        setTimeout(() => {
            isTransitioning = false;
        }, 1000);
    }
    
    function showPreviousSlide() {
        if (isTransitioning) return;
        isTransitioning = true;
    
        if (currentSlide <= 0) {
            currentSlide = -1;
            bigText.classList.remove('hidden');
            subtitle.classList.remove('hidden');
            subtitle2.classList.remove('hidden2');
            slideCounter.classList.add('hidden');
            slideCounter.classList.remove('visible');
    
            setTimeout(() => {
                isTransitioning = false;
            }, 1000);
            return;
        }

        slides[currentSlide].classList.remove('visible');
        slides[currentSlide].classList.add('hidden');
    
        currentSlide--;

        slides[currentSlide].classList.add('visible');
        slides[currentSlide].classList.remove('hidden');

        updateSlideVisibility(currentSlide);

        slideCounter.textContent = `Slide: ${currentSlide + 1} / ${slides.length}`;
    
        updateTtsForCurrentSlide();
    
        setTimeout(() => {
            isTransitioning = false;
        }, 1000);
    }
     
    window.addEventListener('wheel', function (event) {
        if (isTransitioning) return;
    
        stopTTS();

        if (event.deltaY > 0) {
            showNextSlide();
        } else if (event.deltaY < 0 && currentSlide > 0) {
            showPreviousSlide();
        }
    });    
    
    document.addEventListener('contextmenu', function (e) {
    e.preventDefault();
    });

    function loadVoices() {
        const synth = window.speechSynthesis;
        let voices = synth.getVoices();
    
        if (voices.length === 0) {
            synth.onvoiceschanged = () => {
                voices = synth.getVoices();
                selectVoice(voices);
            };
        } else {
            selectVoice(voices);
        }
    }

    function selectVoice(voices) {
    const userAgent = navigator.userAgent.toLowerCase();

    // Detect browsers
    const isChrome = userAgent.includes('chrome') && !userAgent.includes('edg');
    const isEdge = userAgent.includes('edg');
    const isFirefox = userAgent.includes('firefox');
    const isSafari = userAgent.includes('safari') && !userAgent.includes('chrome');

    if (isChrome) {
        // Chrome: Use Google UK English Male
        selectedVoice = voices.find(voice => voice.name === 'Google UK English Male');
    } else if (isEdge) {
        // Edge: Force Microsoft Zira or David (if available)
        selectedVoice = voices.find(voice => voice.name === 'Microsoft David Desktop') || 
                        voices.find(voice => voice.name === 'Microsoft David Desktop') ||
                        voices.find(voice => voice.lang === 'en-GB') || // British English
                        voices.find(voice => voice.lang === 'en-US');  // US English
    } else if (isFirefox) {
        // Firefox: Use British or US English voice
        selectedVoice = voices.find(voice => voice.lang === 'en-GB') || // British English
                        voices.find(voice => voice.lang === 'en-US');  // US English
    } else if (isSafari) {
        // Safari: Use Australian English, British English, or US English
        selectedVoice = voices.find(voice => voice.lang === 'en-AU') || // Australian English
                        voices.find(voice => voice.lang === 'en-GB') || // British English
                        voices.find(voice => voice.lang === 'en-US');  // US English
    } else {
        // Other browsers: Use any available English voice
        selectedVoice = voices.find(voice => voice.lang === 'en-GB') ||  // British English
                        voices.find(voice => voice.lang === 'en-US') ||  // US English
                        voices.find(voice => voice.lang.startsWith('en')); // Any English voice
    }

    if (!selectedVoice) {
        console.warn("No suitable voice found. Using the first available voice.");
        selectedVoice = voices[0]; // Fallback to the first available voice
    }

    console.log("Selected voice:", selectedVoice ? selectedVoice.name : "No suitable voice found");
    }

    window.speechSynthesis.onvoiceschanged = loadVoices;

    function speakText(text) {
        if (isMuted) return; 
        if ('speechSynthesis' in window) {
            const utterance = new SpeechSynthesisUtterance(text);
            if (!selectedVoice && speechSynthesis.getVoices().length === 0) {
                console.error("No voices available. Speech synthesis not supported.");
                return;
            }
            utterance.voice = selectedVoice;
            window.speechSynthesis.cancel();
            window.speechSynthesis.speak(utterance);
        } else {
            console.error("Speech synthesis not supported in this browser.");
        }
    }
    
    window.speechSynthesis.onvoiceschanged = function() {
        loadVoices();
    };
    
    function updateTtsForCurrentSlide() {
        const visibleSlide = slides[currentSlide];
        if (!visibleSlide) return;
        const ttsElements = visibleSlide.querySelectorAll('.tts');
    
        ttsElements.forEach(ttsElement => {
            ttsElement.removeEventListener('click', handleTtsClick);
            ttsElement.addEventListener('click', handleTtsClick);
        });
    }    

    function handleTtsClick(event) {
        const text = event.target.textContent.trim();
        if (!text) {
            console.error("No text found for TTS.");
            return;
        }
        if (!isSpeaking) {
            speakText(text);
        } else {
            stopTTS();
        }
    }

     updateTtsForCurrentSlide();
     showNotification();

     loadVoices();

     updateSlideVisibility(0);

     showPlayPauseButton(0);

     window.speechSynthesis.onvoiceschanged = loadVoices;
});
