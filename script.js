/* ==========================================================================
   FOR MUSK — premium script.js
   Handles:
     - 3D envelope wax seal breaking and letter slide opening sequence
     - Light/Midnight Velvet theme toggling
     - Floating stardust particles, click heart ripples, cursor stardust trails
     - Draggable & 3D flippable Polaroid memory cards
     - Interactive letters box modal reveal
     - Book page-turn animation for Shayaris
     - Soundwave visualizer simulation & audio player controls
     - Scroll reveal triggers (IntersectionObserver)
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {

  /* ------------------------------------------------------------------
     1. THE SHAYARIS DATA
     ------------------------------------------------------------------ */
  const shayaris = [
    { lang: 'en', text: "In a world full of noise,\nyou are my favorite quiet." },
    { lang: 'bn', text: "তোমার হাসিতে এমন এক জাদু আছে,\nযা প্রতিটি বিষণ্ণ মুহূর্তকে হালকা করে দেয়।" },
    { lang: 'en', text: "If I had a star for every time\nyou made me smile,\nI'd own the whole night sky." },
    { lang: 'bn', text: "সত্যিকারের বন্ধুত্বের একটি পাতা,\nহৃদয়ে সবসময় সুরক্ষিত থাকে।" },
    { lang: 'en', text: "You are the kind of person\nthe universe writes poems about,\nand I'm just lucky enough to know you." },
    { lang: 'bn', text: "জানি না কেন তোমার কথা,\nপ্রতিটি কথায় চলেই আসে।" },
    { lang: 'en', text: "Some souls don't need reasons\nto matter — they just do.\nYou're one of them." },
    { lang: 'bn', text: "তোমার সাথে কথা বললে দিনটি সুন্দর হয়ে ওঠে,\nবন্ধুত্বের এই অনুভূতি সত্যিই খুব বিশেষ।" },
    { lang: 'en', text: "Friendship like ours isn't common —\nit's the rare, quiet kind\nthat feels like home." },
    { lang: 'bn', text: "শব্দ কম পড়ে যায়,\nযখন তোমার প্রশংসার কথা আসে।" }
  ];

  /* ------------------------------------------------------------------
     2. THE LETTERS BOX DATA
     ------------------------------------------------------------------ */
  const letterContents = {
    "1": {
      title: "The First Spark",
      date: "September 12",
      body: `Musk,

      Do you remember when we first started talking? There was a quiet ease about it, a feeling that we didn't need to force anything. It felt like finding a rare kind of friend who just understands without needing explanations. You made my world brighter without making a sound. 

      Thank you for being that spark in my life. You make even the simplest days feel worth celebrating.`
    },
    "2": {
      title: "Why You're Special",
      date: "October 18",
      body: `Musk,

      If I had to list all the things that make you special, this letter would go on forever. It's the way your laughter makes the room warmer, how you listen with your whole heart, and how you see beauty in the smallest, quietest moments of life.

      You carry a magic that you aren't even aware of. Having you in my life is a reminder of how beautiful friendship and connections can be.`
    },
    "3": {
      title: "Our Promises",
      date: "November 20",
      body: `Musk,

      Here are my promises to you:
      I promise to always listen when you need to speak, to share in your laughter, and to be a supportive friend when the world gets too noisy. I promise to cheer you on in all your dreams, big and small, and to always hold a safe space of friendship here, no matter where life leads us.

      You will never have to face a storm alone.`
    }
  };

  // Lock scroll on load
  document.body.style.overflow = 'hidden';

  /* ------------------------------------------------------------------
     3. THE WAX SEAL / ENVELOPE OPENING SEQUENCE
     ------------------------------------------------------------------ */
  const sealScreen = document.getElementById('sealScreen');
  const waxSeal = document.getElementById('waxSeal');
  const envelope = document.getElementById('envelope');
  const mainContent = document.getElementById('mainContent');
  const bgAudio = document.getElementById('bgAudio');

  waxSeal.addEventListener('click', () => {
    // 1. Break the seal
    waxSeal.classList.add('breaking');
    
    // 2. Open envelope flap
    setTimeout(() => {
      envelope.classList.add('flap-open');
      waxSeal.style.opacity = '0';
    }, 600);

    // 3. Slide letter out
    setTimeout(() => {
      envelope.classList.add('letter-out');
    }, 1200);

    // 4. Transition screen and reveal page
    setTimeout(() => {
      mainContent.classList.remove('hidden');
      // trigger scroll triggers on load
      triggerScrollReveal();
      
      sealScreen.classList.add('opened');
      document.body.style.overflow = '';
      
      // Auto-initialize stardust particles
      initParticles();
    }, 2200);

    // 5. Autoplay Audio & needles
    setTimeout(() => {
      bgAudio.volume = 0.6;
      bgAudio.play()
        .then(() => setPlayingState(true))
        .catch(() => setPlayingState(false));
      
      // Clean up sealScreen from DOM entirely after transition completes
      setTimeout(() => sealScreen.remove(), 1200);
    }, 3200);
  });

  /* ------------------------------------------------------------------
     4. LIGHT / MIDNIGHT VELVET THEME SWITCHER
     ------------------------------------------------------------------ */
  const themeToggle = document.getElementById('themeToggle');
  const lightIcon = themeToggle.querySelector('.theme-icon-light');
  const darkIcon = themeToggle.querySelector('.theme-icon-dark');

  // Load saved theme
  const savedTheme = localStorage.getItem('theme') || 'light';
  if (savedTheme === 'dark') {
    document.body.classList.remove('theme-light');
    document.body.classList.add('theme-dark');
    lightIcon.classList.add('hidden-icon');
    darkIcon.classList.remove('hidden-icon');
  }

  themeToggle.addEventListener('click', () => {
    const isDark = document.body.classList.toggle('theme-dark');
    document.body.classList.toggle('theme-light', !isDark);

    lightIcon.classList.toggle('hidden-icon', isDark);
    darkIcon.classList.toggle('hidden-icon', !isDark);

    localStorage.setItem('theme', isDark ? 'dark' : 'light');

    // Spawn sparkles around button on toggle
    const rect = themeToggle.getBoundingClientRect();
    for (let i = 0; i < 8; i++) {
      createSparkleAt(rect.left + rect.width / 2 + (Math.random() - 0.5) * 40, rect.top + rect.height / 2 + (Math.random() - 0.5) * 20);
    }
  });

  /* ------------------------------------------------------------------
     5. INTERACTIVE BACKGROUND & PARTICLES ENGINE
     ------------------------------------------------------------------ */
  const heartField = document.getElementById('heartField');
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function spawnAmbientParticle() {
    if (prefersReducedMotion) return;

    const isStar = Math.random() > 0.4;
    const particle = document.createElement('span');
    
    if (isStar) {
      particle.className = 'floating-sparkle';
      particle.textContent = '✦';
    } else {
      particle.className = 'floating-heart';
      particle.textContent = Math.random() > 0.5 ? '♥' : '♡';
    }

    const size = isStar ? (4 + Math.random() * 8) : (10 + Math.random() * 16);
    const left = Math.random() * 100;
    const duration = 10 + Math.random() * 10;
    const drift = (Math.random() - 0.5) * 150;

    particle.style.left = left + 'vw';
    particle.style.fontSize = size + 'px';
    particle.style.animationDuration = duration + 's';
    particle.style.setProperty('--drift', drift + 'px');

    heartField.appendChild(particle);
    setTimeout(() => particle.remove(), duration * 1000 + 500);
  }

  function initParticles() {
    if (prefersReducedMotion) return;
    // Initial batch
    for (let i = 0; i < 6; i++) {
      setTimeout(spawnAmbientParticle, i * 600);
    }
    // Periodic spawn
    setInterval(spawnAmbientParticle, 1500);
  }

  // Mouse trail sparkles
  function createSparkleAt(x, y) {
    if (prefersReducedMotion) return;
    const sparkle = document.createElement('div');
    sparkle.className = 'trail-sparkle';
    sparkle.style.left = x + 'px';
    sparkle.style.top = y + 'px';
    document.body.appendChild(sparkle);
    setTimeout(() => sparkle.remove(), 800);
  }

  let throttleTimer;
  window.addEventListener('mousemove', (e) => {
    if (throttleTimer) return;
    throttleTimer = setTimeout(() => {
      createSparkleAt(e.pageX, e.pageY);
      throttleTimer = null;
    }, 60);
  });

  // Tap/Click custom heart ripples
  window.addEventListener('click', (e) => {
    // Avoid spawning on buttons or interactive cards to keep UI clean
    if (e.target.closest('button, input, a, .polaroid-wrapper, .letter-envelope')) return;
    
    if (prefersReducedMotion) return;

    const count = 4 + Math.floor(Math.random() * 4);
    for (let i = 0; i < count; i++) {
      const heart = document.createElement('div');
      heart.className = 'click-heart';
      heart.textContent = '♥';
      heart.style.left = e.pageX + 'px';
      heart.style.top = e.pageY + 'px';
      heart.style.fontSize = (12 + Math.random() * 12) + 'px';
      
      const dx = (Math.random() - 0.5) * 160 + 'px';
      const dy = (Math.random() - 0.5) * 160 - 50 + 'px'; // tend to drift slightly up
      heart.style.setProperty('--dx', dx);
      heart.style.setProperty('--dy', dy);

      document.body.appendChild(heart);
      setTimeout(() => heart.remove(), 600);
    }
  });

  /* ------------------------------------------------------------------
     6. DRAGGABLE & FLIPPABLE POLAROID DECK
     ------------------------------------------------------------------ */
  const polaroids = document.querySelectorAll('.drag-polaroid');
  let topZIndex = 5;

  polaroids.forEach((wrapper) => {
    let isDragging = false;
    let startX = 0, startY = 0;
    let currentX = 0, currentY = 0;
    let initialX = parseFloat(wrapper.style.getPropertyValue('--x')) || 0;
    let initialY = parseFloat(wrapper.style.getPropertyValue('--y')) || 0;
    let rot = parseFloat(wrapper.style.getPropertyValue('--rot')) || 0;

    // Track movement to distinguish click vs drag
    let hasMoved = false;

    // Bring clicked to top
    wrapper.addEventListener('pointerdown', (e) => {
      topZIndex++;
      wrapper.style.zIndex = topZIndex;

      isDragging = true;
      startX = e.clientX;
      startY = e.clientY;
      hasMoved = false;

      wrapper.style.transition = 'none';
      wrapper.style.cursor = 'grabbing';
      wrapper.setPointerCapture(e.pointerId);
    });

    wrapper.addEventListener('pointermove', (e) => {
      if (!isDragging) return;

      const dx = e.clientX - startX;
      const dy = e.clientY - startY;

      if (Math.abs(dx) > 5 || Math.abs(dy) > 5) {
        hasMoved = true;
      }

      currentX = initialX + dx;
      currentY = initialY + dy;

      wrapper.style.setProperty('--x', currentX + 'px');
      wrapper.style.setProperty('--y', currentY + 'px');
    });

    wrapper.addEventListener('pointerup', (e) => {
      if (!isDragging) return;
      isDragging = false;

      wrapper.style.transition = 'transform 0.4s cubic-bezier(0.25, 1, 0.5, 1)';
      wrapper.style.cursor = 'grab';
      wrapper.releasePointerCapture(e.pointerId);

      initialX = currentX;
      initialY = currentY;

      // Click action: Flip if not dragged
      if (!hasMoved) {
        wrapper.classList.toggle('flipped');
        
        // Spawn small burst of sparkles on flip
        const rect = wrapper.getBoundingClientRect();
        for (let i = 0; i < 6; i++) {
          createSparkleAt(rect.left + rect.width / 2 + (Math.random() - 0.5) * 60, rect.top + rect.height / 2 + (Math.random() - 0.5) * 60);
        }
      }
    });

    wrapper.addEventListener('pointercancel', () => {
      isDragging = false;
      wrapper.style.cursor = 'grab';
    });

    // Prevent default drag outline behavior
    wrapper.addEventListener('dragstart', (e) => e.preventDefault());
  });

  /* ------------------------------------------------------------------
     7. SHAYARI JOURNAL WITH PAGE-FLIP TRANSITION
     ------------------------------------------------------------------ */
  const shayariText = document.getElementById('shayariText');
  const shayariLang = document.getElementById('shayariLang');
  const progressWrap = document.getElementById('shayariProgress');
  const prevBtn = document.getElementById('prevShayari');
  const nextBtn = document.getElementById('nextShayari');
  const pageNumber = document.getElementById('pageNumber');
  const rightPage = document.querySelector('.right-page');

  let currentIndex = 0;
  let autoTimer = null;
  const AUTO_ADVANCE_MS = 6500;

  // Build dots
  shayaris.forEach((_, i) => {
    const dot = document.createElement('span');
    if (i === 0) dot.classList.add('active');
    progressWrap.appendChild(dot);
  });

  function renderShayari(index) {
    const item = shayaris[index];

    // Trigger page flip style animation
    rightPage.classList.add('page-flip-left');
    shayariText.classList.add('fade-out');

    setTimeout(() => {
      shayariText.textContent = item.text;
      
      // Update styling based on lang
      if (item.lang === 'bn') {
        shayariText.className = 'shayari-text lang-bn';
        shayariLang.textContent = 'Bengali';
      } else {
        shayariText.className = 'shayari-text';
        shayariLang.textContent = 'English';
      }
      
      pageNumber.textContent = index + 1;

      // Update dots
      [...progressWrap.children].forEach((dot, i) => {
        dot.classList.toggle('active', i === index);
      });

      // Animate flip back
      rightPage.classList.remove('page-flip-left');
      
      requestAnimationFrame(() => {
        shayariText.classList.remove('fade-out');
      });
    }, 300);
  }

  function goTo(index) {
    currentIndex = (index + shayaris.length) % shayaris.length;
    renderShayari(currentIndex);
    restartAutoAdvance();
  }

  function restartAutoAdvance() {
    clearInterval(autoTimer);
    autoTimer = setInterval(() => goTo(currentIndex + 1), AUTO_ADVANCE_MS);
  }

  prevBtn.addEventListener('click', () => goTo(currentIndex - 1));
  nextBtn.addEventListener('click', () => goTo(currentIndex + 1));

  // Initialize
  shayariText.textContent = shayaris[0].text;
  restartAutoAdvance();

  /* ------------------------------------------------------------------
     8. INTERACTIVE LETTERS BOX (Modal Overlays)
     ------------------------------------------------------------------ */
  const letters = document.querySelectorAll('.letter-envelope');
  const letterModal = document.getElementById('letterModal');
  const closeLetterBtn = document.getElementById('closeLetterBtn');
  const modalDate = document.getElementById('modalDate');
  const modalTitle = document.getElementById('modalTitle');
  const modalBodyText = document.getElementById('modalBodyText');

  letters.forEach((env) => {
    env.addEventListener('click', () => {
      const id = env.getAttribute('data-letter');
      const content = letterContents[id];

      if (content) {
        modalTitle.textContent = content.title;
        modalDate.textContent = content.date;
        modalBodyText.innerHTML = content.body.replace(/\n\n/g, '<br><br>');

        letterModal.classList.add('open');
        document.body.style.overflow = 'hidden';

        // Spawn gold sparks near envelope
        const rect = env.getBoundingClientRect();
        for (let i = 0; i < 10; i++) {
          createSparkleAt(rect.left + rect.width/2 + (Math.random()-0.5)*80, rect.top + rect.height/2 + (Math.random()-0.5)*80);
        }
      }
    });
  });

  function closeLetterModal() {
    letterModal.classList.remove('open');
    document.body.style.overflow = '';
  }

  closeLetterBtn.addEventListener('click', closeLetterModal);
  letterModal.addEventListener('click', (e) => {
    if (e.target === letterModal) closeLetterModal();
  });

  /* ------------------------------------------------------------------
     9. LUXURY MUSIC PLAYER & DYNAMIC SOUNDWAVE VISUALIZER
     ------------------------------------------------------------------ */
  const playPauseBtn = document.getElementById('playPauseBtn');
  const iconPlay = document.getElementById('iconPlay');
  const iconPause = document.getElementById('iconPause');
  const vinyl = document.getElementById('vinyl');
  const volumeSlider = document.getElementById('volumeSlider');
  const visualizerBars = document.querySelectorAll('#soundwave .bar');
  
  let visualizerInterval = null;

  function setPlayingState(isPlaying) {
    iconPlay.classList.toggle('hidden-icon', isPlaying);
    iconPause.classList.toggle('hidden-icon', !isPlaying);
    vinyl.classList.toggle('spinning', isPlaying);
    playPauseBtn.setAttribute('aria-label', isPlaying ? 'Pause music' : 'Play music');
    
    if (isPlaying) {
      startVisualizer();
    } else {
      stopVisualizer();
    }
  }

  function startVisualizer() {
    if (visualizerInterval) clearInterval(visualizerInterval);
    
    visualizerInterval = setInterval(() => {
      visualizerBars.forEach((bar) => {
        // Generate a luxurious random wave pattern
        const minHeight = 4;
        const maxHeight = 24;
        const randomHeight = minHeight + Math.random() * (maxHeight - minHeight);
        bar.style.height = randomHeight + 'px';
      });
    }, 120);
  }

  function stopVisualizer() {
    if (visualizerInterval) clearInterval(visualizerInterval);
    visualizerInterval = null;
    visualizerBars.forEach((bar) => {
      bar.style.height = '3px';
    });
  }

  playPauseBtn.addEventListener('click', () => {
    if (bgAudio.paused) {
      bgAudio.play()
        .then(() => setPlayingState(true))
        .catch(() => {
          console.warn('Audio play failed. Please check paths.');
        });
    } else {
      bgAudio.pause();
      setPlayingState(false);
    }
  });

  volumeSlider.addEventListener('input', (e) => {
    bgAudio.volume = e.target.value;
  });

  bgAudio.addEventListener('ended', () => setPlayingState(false));

  /* ------------------------------------------------------------------
     10. INTERSECTION OBSERVER FOR SCROLL REVEALS
     ------------------------------------------------------------------ */
  const scrollElements = document.querySelectorAll('.fade-in-scroll');

  const scrollObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        // Spawn small greeting sparkles on hero reveal
        if (entry.target.classList.contains('hero-title')) {
          const rect = entry.target.getBoundingClientRect();
          for (let i = 0; i < 5; i++) {
            setTimeout(() => {
              createSparkleAt(rect.left + rect.width * Math.random(), rect.top + rect.height * Math.random());
            }, i * 200);
          }
        }
      }
    });
  }, {
    threshold: 0.15,
    rootMargin: '0px 0px -50px 0px'
  });

  function triggerScrollReveal() {
    scrollElements.forEach((el) => {
      scrollObserver.observe(el);
    });
  }

});
