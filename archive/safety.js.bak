// SAHAY-V Safety Page Interactive Exercises Controller

document.addEventListener('DOMContentLoaded', () => {
    // Breathing Exercise Elements
    const breathBtn = document.getElementById('breathToggleBtn');
    const breathCircle = document.getElementById('breathCircle');
    const breathLabel = document.getElementById('breathLabel');
    const breathTimerText = document.getElementById('breathTimerText');

    let breathInterval = null;
    let isBreathing = false;
    let breathPhase = 0; // 0: Inhale, 1: Hold, 2: Exhale
    let secondsLeft = 4;

    const phases = [
        { label: "Inhale... 🌬️", duration: 4, color: "text-purple-600", scale: "scale-125 bg-purple-100" },
        { label: "Hold... 🌸", duration: 4, color: "text-pink-600", scale: "scale-125 bg-pink-100" },
        { label: "Exhale... 🍃", duration: 4, color: "text-teal-600", scale: "scale-100 bg-purple-50" }
    ];

    if (breathBtn) {
        breathBtn.addEventListener('click', () => {
            if (isBreathing) {
                stopBreathing();
            } else {
                startBreathing();
            }
        });
    }

    function startBreathing() {
        isBreathing = true;
        breathBtn.textContent = 'Pause Breathing Exercise ⏸️';
        breathBtn.classList.remove('bg-gradient-sahay');
        breathBtn.classList.add('bg-slate-700');
        
        breathPhase = 0;
        secondsLeft = phases[0].duration;
        updateBreathUI();

        breathInterval = setInterval(() => {
            secondsLeft--;
            if (secondsLeft <= 0) {
                breathPhase = (breathPhase + 1) % 3;
                secondsLeft = phases[breathPhase].duration;
            }
            updateBreathUI();
        }, 1000);
    }

    function stopBreathing() {
        isBreathing = false;
        clearInterval(breathInterval);
        breathBtn.textContent = 'Start Breathing Exercise 🌬️';
        breathBtn.classList.remove('bg-slate-700');
        breathBtn.classList.add('bg-gradient-sahay');
        
        if (breathLabel) breathLabel.textContent = "Ready to begin";
        if (breathTimerText) breathTimerText.textContent = "Press start below";
        if (breathCircle) {
            breathCircle.className = "w-40 h-40 rounded-full bg-purple-50 border-4 border-purple-200 flex items-center justify-center transition-all duration-1000 shadow-inner";
        }
    }

    function updateBreathUI() {
        const current = phases[breathPhase];
        if (breathLabel) {
            breathLabel.textContent = current.label;
            breathLabel.className = `font-heading text-2xl font-bold ${current.color} transition-colors duration-500`;
        }
        if (breathTimerText) {
            breathTimerText.textContent = `${secondsLeft} seconds`;
        }
        if (breathCircle) {
            breathCircle.className = `w-40 h-40 rounded-full border-4 border-purple-300 flex items-center justify-center transition-all duration-1000 shadow-md ${current.scale}`;
        }
    }

    // 5-4-3-2-1 Interactive Step Checkboxes
    const groundingCheckboxes = document.querySelectorAll('.grounding-check');
    const groundingProgressBar = document.getElementById('groundingProgress');
    const groundingProgressText = document.getElementById('groundingProgressText');

    groundingCheckboxes.forEach(chk => {
        chk.addEventListener('change', updateGroundingProgress);
    });

    function updateGroundingProgress() {
        const total = groundingCheckboxes.length;
        const checked = document.querySelectorAll('.grounding-check:checked').length;
        const percent = Math.round((checked / total) * 100);

        if (groundingProgressBar) {
            groundingProgressBar.style.width = `${percent}%`;
        }
        if (groundingProgressText) {
            if (checked === total) {
                groundingProgressText.textContent = "You've grounded yourself! Well done 💛";
            } else {
                groundingProgressText.textContent = `${checked} of ${total} steps completed (${percent}%)`;
            }
        }
    }
});
