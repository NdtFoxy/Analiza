

const fractalButtons = document.querySelectorAll('button[data-key]');
const statusElement = document.getElementById('status');
const canvas = document.getElementById('fractalCanvas');
const ctx = canvas.getContext('2d');
const pointsSlider = document.getElementById('pointsSlider');
const pointsValue = document.getElementById('pointsValue');
const applyButton = document.getElementById('applyButton');
const paletteOptions = document.querySelectorAll('.palette-option');
const progressOverlay = document.getElementById('progressOverlay');
const progressBarFill = document.getElementById('progressBarFill');
const progressPercentage = document.getElementById('progressPercentage');
const progressText = document.getElementById('progressText');
const toastContainer = document.getElementById('toastContainer');

let currentFractalKey = null;
let currentFractalName = null;
let currentPalette = 'vibrant';
let currentPoints = 100000;
let lastGeneratedFractalKey = null;
let lastGeneratedPoints = 100000;
let isGenerating = false;

const colorPalettes = {
    vibrant: ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E2', '#F8B88B', '#A9DFBF'],
    cool: ['#667eea', '#764ba2', '#f093fb', '#4facfe', '#00f2fe', '#a8edea', '#fed6e3', '#c471f5', '#fa709a', '#fee140'],
    fire: ['#ff0844', '#ffb199', '#ff9a00', '#ff6348', '#ffa502', '#ff4757', '#ff6b81', '#ff7979', '#eb4d4b', '#ee5a6f'],
    ocean: ['#2E3192', '#1BFFFF', '#00CED1', '#4682B4', '#5F9EA0', '#20B2AA', '#48D1CC', '#40E0D0', '#00FFFF', '#E0FFFF'],
    sunset: ['#ff6b6b', '#feca57', '#ee5a6f', '#ff9ff3', '#ffa502', '#ff6348', '#ff7979', '#ff8c94', '#ffa07a', '#ffb19d'],
    forest: ['#26de81', '#20bf6b', '#0fb9b1', '#2bcbba', '#45aaf2', '#4b7bec', '#a55eea', '#5f27cd', '#00d2d3', '#01a3a4']
};

let cachedFractalData = null;
let cachedFractalName = null;

function showToast(message, type = 'info', duration = 3000) {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    toastContainer.appendChild(toast);
    setTimeout(() => toast.style.opacity = '1', 10);
    setTimeout(() => {
        toast.classList.add('removing');
        setTimeout(() => toast.remove(), 400);
    }, duration);
}

pointsSlider.addEventListener('input', (e) => {
    currentPoints = parseInt(e.target.value);
    const displayValue = currentPoints >= 1000 ? `${Math.round(currentPoints / 1000)}k` : currentPoints;
    pointsValue.textContent = displayValue;
    if (currentPoints !== lastGeneratedPoints) {
        applyButton.style.opacity = '1';
        applyButton.style.pointerEvents = 'auto';
        applyButton.textContent = `Zastosuj (${displayValue})`;
    } else {
        applyButton.textContent = 'Zastosuj';
    }
});

applyButton.addEventListener('click', () => {
    if (currentPoints === lastGeneratedPoints && currentFractalKey === lastGeneratedFractalKey) {
        showToast(`⚠️ Liczba punktów jest już taka sama (${currentPoints})`, 'info', 2000);
        return;
    }
    if (!currentFractalKey) {
        showToast('❌ Najpierw wybierz fraktal', 'error', 2500);
        return;
    }
    if (isGenerating) {
        showToast('⏳ Czekaj na zakończenie poprzedniego generowania', 'info', 2000);
        return;
    }
    const displayValue = currentPoints >= 1000 ? `${Math.round(currentPoints / 1000)}k` : currentPoints;
    showToast(`⏳ Generowanie z ${displayValue} punktami...`, 'info', 2000);
    lastGeneratedPoints = currentPoints;
    cachedFractalData = null;
    generateFractal(currentFractalKey, currentFractalName);
});

paletteOptions.forEach(option => {
    option.addEventListener('click', () => {
        const paletteName = option.dataset.palette;
        paletteOptions.forEach(opt => opt.classList.remove('active'));
        option.classList.add('active');
        const oldPalette = currentPalette;
        currentPalette = paletteName;

        if (currentFractalKey === "17") {
             showToast(`🎨 Zmieniono paletę: ${oldPalette} → ${currentPalette}`, 'success', 2500);
             drawPythagoreanTree(); // Redraw tree immediately with new palette
        } else if (cachedFractalData && currentFractalKey) {
            showToast(`🎨 Zmieniono paletę: ${oldPalette} → ${currentPalette}`, 'success', 2500);
            drawFractalPoints(cachedFractalData);
        } else {
            showToast(`🎨 Paleta zmieniona na: ${currentPalette}`, 'info', 2000);
        }
    });
});

fractalButtons.forEach(button => {
    button.addEventListener('click', () => {
        const fractalKey = button.dataset.key;
        const fractalName = button.textContent;
        currentFractalKey = fractalKey;
        currentFractalName = fractalName;
        if (isGenerating) {
            showToast('⏳ Czekaj na zakończenie poprzedniego generowania', 'info', 2000);
            return;
        }
        fractalButtons.forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');
        cachedFractalData = null;
        cachedFractalName = null;
        lastGeneratedFractalKey = null;
        lastGeneratedPoints = currentPoints;
        const displayValue = currentPoints >= 1000 ? `${Math.round(currentPoints / 1000)}k` : currentPoints;
        showToast(`🔄 Generowanie ${fractalName} (${displayValue})...`, 'info', 2000);
        generateFractal(fractalKey, fractalName);
    });
});

async function generateFractal(fractalKey, fractalName) {
    if (fractalKey === "17") {
        isGenerating = true;
        showProgress();
        statusElement.textContent = '⏳ Malowanie...';
        statusElement.style.color = '#FFD700';
        setTimeout(() => {
            drawPythagoreanTree();
            hideProgress();
            isGenerating = false;
            showToast('✅ Pythagorean Tree (Recursive) gotowy!', 'success', 3000);
            statusElement.textContent = '✅ Pythagorean Tree (Recursive)';
            statusElement.style.color = '#26de81';
        }, 100);
        return;
    }
    isGenerating = true;
    showProgress();
    statusElement.textContent = '⏳ Przygotowanie...';
    statusElement.style.color = '#FFD700';
    simulateProgress();
    if (window.electronAPI && window.electronAPI.generateFractal) {
        try {
            const response = await window.electronAPI.generateFractal(fractalKey, currentPoints);
            if (response && response.error) throw new Error(response.error);
            handleFractalData(response);
        } catch (error) {
            hideProgress();
            isGenerating = false;
            statusElement.textContent = `❌ Błąd: ${error}`;
            statusElement.style.color = '#FF6B6B';
            showToast(`❌ Błąd: ${error}`, 'error', 4000);
        }
    } else {
        showToast('❌ Electron API niedostępny', 'error', 3000);
        hideProgress();
        isGenerating = false;
    }
}

// ==================== PYTHAGOREAN TREE 

function drawTreeSquare(p1, p2, p3, p4, color) {
    ctx.beginPath();
    ctx.moveTo(p1.x, p1.y);
    ctx.lineTo(p2.x, p2.y);
    ctx.lineTo(p3.x, p3.y);
    ctx.lineTo(p4.x, p4.y);
    ctx.closePath();
    ctx.fillStyle = color;
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.2)';
    ctx.lineWidth = 0.8;
    ctx.fill();
    ctx.stroke();
}

function drawTreeBranch(p1, p2, currentDepth, maxDepth, colors) {
    if (currentDepth >= maxDepth) {
        return;
    }

    const dx = p2.x - p1.x;
    const dy = p2.y - p1.y;

    const p3 = { x: p2.x + dy, y: p2.y - dx };
    const p4 = { x: p1.x + dy, y: p1.y - dx };

    const colorIndex = (currentDepth + 1) % colors.length;
    drawTreeSquare(p1, p2, p3, p4, colors[colorIndex]);

    const midX = p4.x + (p3.x - p4.x) / 2;
    const midY = p4.y + (p3.y - p4.y) / 2;
    
    const pTop = {
        x: midX + (p3.y - p4.y) / 2,
        y: midY - (p3.x - p4.x) / 2
    };

    drawTreeBranch(p4, pTop, currentDepth + 1, maxDepth, colors);
    drawTreeBranch(pTop, p3, currentDepth + 1, maxDepth, colors);
}

function drawPythagoreanTree() {
    ctx.fillStyle = '#111827';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const maxDepth = 12; 
    const palette = colorPalettes[currentPalette];
    
    const baseSize = Math.min(canvas.width, canvas.height) / 6;
    const startY = canvas.height - baseSize / 4;

    const p1_base = { x: canvas.width / 2 - baseSize / 2, y: startY };
    const p2_base = { x: canvas.width / 2 + baseSize / 2, y: startY };
    
    const p3_top = { x: p2_base.x, y: startY - baseSize };
    const p4_top = { x: p1_base.x, y: startY - baseSize };

    drawTreeSquare(p1_base, p2_base, p3_top, p4_top, palette[0]);
    drawTreeBranch(p4_top, p3_top, 0, maxDepth, palette);
}

// =============================================================================

function handleFractalData(response) {
    if (!response) {
        hideProgress();
        isGenerating = false;
        statusElement.textContent = `❌ Błąd: pusta odpowiedź z Python`;
        statusElement.style.color = '#FF6B6B';
        showToast(`❌ Python zwrócił pustą odpowiedź`, 'error', 4000);
        return;
    }
    if (response.error) {
        hideProgress();
        isGenerating = false;
        statusElement.textContent = `❌ Błąd: ${response.error}`;
        statusElement.style.color = '#FF6B6B';
        showToast(`❌ Błąd: ${response.error}`, 'error', 4000);
        return;
    }
    if (!response.x || !response.y || !response.colors) {
        hideProgress();
        isGenerating = false;
        statusElement.textContent = `❌ Błąd: niekompletne dane z Python`;
        statusElement.style.color = '#FF6B6B';
        showToast(`❌ Niekompletne dane z Python`, 'error', 4000);
        return;
    }
    
    cachedFractalData = response;
    cachedFractalName = response.name;
    lastGeneratedFractalKey = currentFractalKey;
    updateProgress(95, 'Rysowanie na canvas...');
    
    requestAnimationFrame(() => {
        try {
            drawFractalPoints(response);
            updateProgress(100, 'Gotowe!');
            setTimeout(() => {
                hideProgress();
                isGenerating = false;
                const pointsFormatted = response.x.length.toLocaleString('pl-PL');
                showToast(`✅ ${response.name} (${pointsFormatted} punktów) | Paleta: ${currentPalette}`, 'success', 5000);
                statusElement.textContent = `✅ ${response.name}`;
                statusElement.style.color = '#26de81';
            }, 500);
        } catch (error) {
            hideProgress();
            isGenerating = false;
            statusElement.textContent = `❌ Błąd rysowania: ${error.message}`;
            statusElement.style.color = '#FF6B6B';
            showToast(`❌ Błąd rysowania: ${error.message}`, 'error', 4000);
        }
    });
}

function showProgress() {
    progressOverlay.classList.add('active');
    progressBarFill.style.width = '0%';
    progressPercentage.textContent = '0%';
    progressText.textContent = 'Inicjalizacja...';
}

function hideProgress() {
    progressOverlay.classList.remove('active');
}

function updateProgress(percent, text) {
    progressBarFill.style.width = percent + '%';
    progressPercentage.textContent = Math.round(percent) + '%';
    if (text) progressText.textContent = text;
}

function simulateProgress() {
    const stages = [
        { percent: 15, text: 'Przygotowanie przeksztalcen IFS...', delay: 200 },
        { percent: 30, text: 'Inicjalizacja Chaos Game...', delay: 300 },
        { percent: 50, text: 'Generowanie punktow...', delay: 500 },
        { percent: 75, text: 'Zastosowanie Twierdzenia Banacha...', delay: 400 },
        { percent: 90, text: 'Finalizacja atraktora...', delay: 300 }
    ];
    let stageIndex = 0;
    function nextStage() {
        if (stageIndex < stages.length) {
            const stage = stages[stageIndex];
            updateProgress(stage.percent, stage.text);
            stageIndex++;
            setTimeout(nextStage, stage.delay);
        }
    }
    nextStage();
}

function drawFractalPoints({ x: x_coords, y: y_coords, colors: color_indices, name }) {
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const margin = 40;
    if (!x_coords || !y_coords || !color_indices || x_coords.length === 0) {
        throw new Error('Brakujace dane');
    }
    
    const [minX, maxX] = findMinMax(x_coords);
    const [minY, maxY] = findMinMax(y_coords);
    const fractalWidth = maxX - minX;
    const fractalHeight = maxY - minY;
    const safeWidth = Math.max(fractalWidth, 1e-9);
    const safeHeight = Math.max(fractalHeight, 1e-9);
    const scaleX = (canvas.width - margin * 2) / safeWidth;
    const scaleY = (canvas.height - margin * 2) / safeHeight;
    const scale = Math.min(scaleX, scaleY);
    const offsetX = (canvas.width - fractalWidth * scale) / 2 - minX * scale;
    const offsetY = (canvas.height - fractalHeight * scale) / 2 - minY * scale;
    
    const palette = colorPalettes[currentPalette];
    const pixelData = ctx.createImageData(canvas.width, canvas.height);
    const data = pixelData.data;
    const densityMap = new Map();
    
    for (let i = 0; i < x_coords.length; i++) {
        const canvasX = Math.round(x_coords[i] * scale + offsetX);
        const canvasY = Math.round(canvas.height - (y_coords[i] * scale + offsetY));
        
        if (canvasX >= 0 && canvasX < canvas.width && canvasY >= 0 && canvasY < canvas.height) {
            const pixelIndex = (canvasY * canvas.width + canvasX) * 4;
            const colorIndex = color_indices[i] % palette.length;
            const color = parseHexColor(palette[colorIndex]);
            const key = `${canvasX},${canvasY}`;
            const density = (densityMap.get(key) || 0) + 1;
            densityMap.set(key, density);
            const intensity = Math.min(255, Math.log(density + 1) * 50);

            if (data[pixelIndex + 3] < intensity) {
                data[pixelIndex + 0] = color.r;
                data[pixelIndex + 1] = color.g;
                data[pixelIndex + 2] = color.b;
                data[pixelIndex + 3] = intensity;
            }
        }
    }
    
    ctx.putImageData(pixelData, 0, 0);
    drawInfo(name, x_coords.length, minX, maxX, minY, maxY);
}

function parseHexColor(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {r: parseInt(result[1], 16), g: parseInt(result[2], 16), b: parseInt(result[3], 16)} : {r: 255, g: 255, b: 255};
}

function drawInfo(name, pointCount, minX, maxX, minY, maxY) {
    const info = [
        `Fraktal: ${name}`,
        `Punktow: ${pointCount.toLocaleString('pl-PL')}`,
        `Paleta: ${currentPalette}`,
        `X: [${minX.toFixed(2)}, ${maxX.toFixed(2)}]`,
        `Y: [${minY.toFixed(2)}, ${maxY.toFixed(2)}]`
    ];
    ctx.font = 'bold 11px monospace';
    ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
    ctx.fillRect(5, 5, 200, info.length * 16 + 10);
    ctx.fillStyle = '#4dc9b0';
    info.forEach((text, idx) => {
        ctx.fillText(text, 10, 18 + idx * 16);
    });
}

function findMinMax(arr) {
    if (arr.length === 0) return [0, 0];
    let min = arr[0], max = arr[0];
    for (let i = 1; i < arr.length; i++) {
        if (arr[i] < min) min = arr[i];
        if (arr[i] > max) max = arr[i];
    }
    return [min, max];
}

window.addEventListener('DOMContentLoaded', () => {
    console.log('✅ Renderer.js - COMPLETE CODE - READY');
    showToast('👋 Witaj w IFS Fractal Generator Pro!', 'info', 3000);
    const firstButton = document.querySelector('button[data-key="1"]');
    if (firstButton) {
        setTimeout(() => firstButton.click(), 1000);
    }
});
