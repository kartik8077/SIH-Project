// SAHAY-V My Journey & Chart.js Controller

document.addEventListener('DOMContentLoaded', () => {
    let journeyChart = null;
    let currentRange = 'week';

    // UI Elements
    const chartCanvas = document.getElementById('anxietyChart');
    const rangeBtns = document.querySelectorAll('.range-tab-btn');
    const timelineContainer = document.getElementById('timelineContainer');
    
    // Summary Cards
    const todayAvgText = document.getElementById('todayAvgText');
    const todayEmoji = document.getElementById('todayEmoji');
    const todayLabel = document.getElementById('todayLabel');
    
    const weekAvgText = document.getElementById('weekAvgText');
    const weekEmoji = document.getElementById('weekEmoji');
    const weekLabel = document.getElementById('weekLabel');

    const monthAvgText = document.getElementById('monthAvgText');
    const monthEmoji = document.getElementById('monthEmoji');
    const monthLabel = document.getElementById('monthLabel');

    // Modal elements
    const openAddModalBtn = document.getElementById('openAddModalBtn');
    const closeAddModalBtn = document.getElementById('closeAddModalBtn');
    const addEntryModal = document.getElementById('addEntryModal');
    const addEntryForm = document.getElementById('addEntryForm');
    const modalSlider = document.getElementById('modalSlider');
    const modalEmoji = document.getElementById('modalEmoji');
    const modalLabel = document.getElementById('modalLabel');
    const modalThought = document.getElementById('modalThought');

    // Emoji Mapping Scale
    function getEmojiAndLabel(level) {
        level = parseInt(level, 10);
        if (level <= 2) return { emoji: "😌", label: "Calm" };
        if (level <= 4) return { emoji: "🙂", label: "Mild" };
        if (level <= 6) return { emoji: "😟", label: "Moderate" };
        if (level <= 8) return { emoji: "😰", label: "High" };
        return { emoji: "🥵", label: "Severe" };
    }

    // Modal slider live emoji update
    if (modalSlider) {
        modalSlider.addEventListener('input', (e) => {
            const val = e.target.value;
            const { emoji, label } = getEmojiAndLabel(val);
            if (modalEmoji) modalEmoji.textContent = emoji;
            if (modalLabel) modalLabel.textContent = `${val}/10 - ${label}`;
        });
    }

    // Modal Visibility Toggle
    if (openAddModalBtn && addEntryModal) {
        openAddModalBtn.addEventListener('click', () => addEntryModal.classList.remove('hidden'));
    }
    if (closeAddModalBtn && addEntryModal) {
        closeAddModalBtn.addEventListener('click', () => addEntryModal.classList.add('hidden'));
    }

    // Modal Form Submission
    if (addEntryForm) {
        addEntryForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const level = modalSlider ? modalSlider.value : 5;
            const thought = modalThought ? modalThought.value.trim() : '';

            try {
                const res = await fetch('/api/journey/entry', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        anxiety_level: level,
                        short_thought: thought
                    })
                });

                const data = await res.json();
                if (data.status === 'success') {
                    if (addEntryModal) addEntryModal.classList.add('hidden');
                    if (modalThought) modalThought.value = '';
                    // Reload data for current range
                    loadJourneyData(currentRange);
                }
            } catch (err) {
                console.error('Add entry error:', err);
            }
        });
    }

    // Range Tab Switching (Day / Week / Month)
    rangeBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            rangeBtns.forEach(b => {
                b.classList.remove('bg-gradient-sahay', 'text-white', 'shadow-md');
                b.classList.add('bg-purple-50', 'text-purple-700', 'hover:bg-purple-100');
            });
            btn.classList.remove('bg-purple-50', 'text-purple-700', 'hover:bg-purple-100');
            btn.classList.add('bg-gradient-sahay', 'text-white', 'shadow-md');

            currentRange = btn.dataset.range;
            loadJourneyData(currentRange);
        });
    });

    // Fetch and render dashboard data
    async function loadJourneyData(range = 'week') {
        try {
            const res = await fetch(`/api/journey/data?range=${range}`);
            const data = await res.json();

            if (data.status === 'success') {
                updateSummaryCards(data.summary);
                renderChart(data.chart);
                renderTimeline(data.timeline);
            }
        } catch (err) {
            console.error('Failed to load journey data:', err);
        }
    }

    // Update Summary Cards
    function updateSummaryCards(summary) {
        if (summary.today) {
            todayAvgText.textContent = summary.today.avg !== null ? `${summary.today.avg}` : '—';
            todayEmoji.textContent = summary.today.emoji;
            todayLabel.textContent = summary.today.label;
        }
        if (summary.week) {
            weekAvgText.textContent = summary.week.avg !== null ? `${summary.week.avg}` : '—';
            weekEmoji.textContent = summary.week.emoji;
            weekLabel.textContent = summary.week.label;
        }
        if (summary.month) {
            monthAvgText.textContent = summary.month.avg !== null ? `${summary.month.avg}` : '—';
            monthEmoji.textContent = summary.month.emoji;
            monthLabel.textContent = summary.month.label;
        }
    }

    // Render Chart.js Graph
    function renderChart(chartData) {
        if (!chartCanvas) return;
        const ctx = chartCanvas.getContext('2d');

        // Create Canvas Gradient Fill (#6B4FBB -> #E0407B)
        const gradient = ctx.createLinearGradient(0, 0, 0, 300);
        gradient.addColorStop(0, 'rgba(107, 79, 187, 0.35)');
        gradient.addColorStop(1, 'rgba(224, 64, 123, 0.02)');

        const borderGradient = ctx.createLinearGradient(0, 0, 400, 0);
        borderGradient.addColorStop(0, '#6B4FBB');
        borderGradient.addColorStop(1, '#E0407B');

        if (journeyChart) {
            journeyChart.destroy();
        }

        journeyChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: chartData.labels,
                datasets: [{
                    label: 'Anxiety Level (1-10)',
                    data: chartData.values,
                    borderColor: '#6B4FBB',
                    borderWidth: 3,
                    backgroundColor: gradient,
                    fill: true,
                    tension: 0.35,
                    pointRadius: 6,
                    pointHoverRadius: 9,
                    pointBackgroundColor: '#FFFFFF',
                    pointBorderColor: '#E0407B',
                    pointBorderWidth: 3
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        backgroundColor: 'rgba(45, 42, 62, 0.9)',
                        titleFont: { family: 'Outfit', size: 14 },
                        bodyFont: { family: 'Inter', size: 13 },
                        padding: 12,
                        cornerRadius: 12,
                        callbacks: {
                            label: function(context) {
                                const val = context.raw;
                                const emoji = chartData.emojis[context.dataIndex] || '';
                                const { label } = getEmojiAndLabel(val);
                                return ` Score: ${val}/10 ${emoji} (${label})`;
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        min: 1,
                        max: 10,
                        ticks: {
                            stepSize: 1,
                            font: { family: 'Inter', size: 12 },
                            color: '#6B4FBB'
                        },
                        grid: {
                            color: 'rgba(107, 79, 187, 0.06)'
                        }
                    },
                    x: {
                        ticks: {
                            font: { family: 'Inter', size: 11 },
                            color: '#2D2A3E'
                        },
                        grid: { display: false }
                    }
                }
            }
        });
    }

    // Render Timeline List Cards
    function renderTimeline(entries) {
        if (!timelineContainer) return;
        timelineContainer.innerHTML = '';

        if (entries.length === 0) {
            timelineContainer.innerHTML = `
                <div class="text-center py-10 text-slate-400">
                    <p class="text-3xl mb-2">🌸</p>
                    <p>No journal entries logged for this period yet.</p>
                </div>
            `;
            return;
        }

        entries.forEach(entry => {
            const card = document.createElement('div');
            card.className = 'glass-card p-4 rounded-2xl flex items-start justify-between gap-4 hover:shadow-md transition-all border-l-4 border-l-purple-500';

            const sourceBadge = entry.source === 'chat' 
                ? `<span class="bg-purple-100 text-purple-700 text-xs px-2.5 py-0.5 rounded-full font-medium">💬 Chat AI</span>`
                : `<span class="bg-pink-100 text-pink-700 text-xs px-2.5 py-0.5 rounded-full font-medium">📝 Manual Entry</span>`;

            card.innerHTML = `
                <div class="flex items-start gap-3">
                    <div class="text-3xl p-2 bg-purple-50 rounded-2xl border border-purple-100 shrink-0">
                        ${entry.emoji}
                    </div>
                    <div>
                        <div class="flex items-center gap-2 mb-1">
                            <span class="font-heading font-semibold text-slate-800">Score: ${entry.anxiety_level}/10 (${entry.label})</span>
                            ${sourceBadge}
                        </div>
                        <p class="text-slate-600 text-sm italic">
                            "${escapeHtml(entry.short_thought || 'No thought note added.')}"
                        </p>
                    </div>
                </div>
                <div class="text-right text-xs text-slate-400 shrink-0">
                    <p>${entry.date_only}</p>
                    <p>${entry.time_only}</p>
                </div>
            `;
            timelineContainer.appendChild(card);
        });
    }

    function escapeHtml(str) {
        return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    }

    // Initial Load
    loadJourneyData('week');
});
