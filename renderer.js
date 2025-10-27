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
    // 1. Начинаем новый путь для рисования
    ctx.beginPath();
    // 2. Перемещаем "перо" в первую точку (p1), не рисуя линию
    ctx.moveTo(p1.x, p1.y);
    // 3. Рисуем линии, последовательно соединяя все четыре угла
    ctx.lineTo(p2.x, p2.y);
    ctx.lineTo(p3.x, p3.y);
    ctx.lineTo(p4.x, p4.y);
    // 4. Замыкаем путь, соединяя последнюю точку с первой
    ctx.closePath();
    
    // 5. Устанавливаем цвет для заливки квадрата
    ctx.fillStyle = color;
    // 6. Устанавливаем стиль для обводки (контура) квадрата
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.2)';
    ctx.lineWidth = 0.8;
    
    // 7. Заливаем фигуру выбранным цветом
    ctx.fill();
    // 8. Рисуем контур фигуры
    ctx.stroke();
}

function drawTreeBranch(p1, p2, currentDepth, maxDepth, colors) {
    // 1. УСЛОВИЕ ОСТАНОВКИ (самое важное в рекурсии!)
    // Если текущая глубина рекурсии достигла максимума, прекращаем рисовать дальше.
    // Это не дает программе зациклиться и уйти в бесконечность.
    if (currentDepth >= maxDepth) {
        return;
    }

    // 2. ГЕОМЕТРИЯ: Вычисляем новый квадрат
    // p1 и p2 — это две точки, образующие основание для нового квадрата (верхняя сторона предыдущего квадрата).
    const dx = p2.x - p1.x; // Вектор основания по X
    const dy = p2.y - p1.y; // Вектор основания по Y

    // Находим две другие вершины квадрата (p3 и p4), "подняв" перпендикуляр из точек p1 и p2.
    // Математический трюк: вектор, перпендикулярный вектору (dx, dy), это вектор (dy, -dx).
    const p3 = { x: p2.x + dy, y: p2.y - dx };
    const p4 = { x: p1.x + dy, y: p1.y - dx };

    // 3. РИСОВАНИЕ: Рисуем вычисленный квадрат
    // Выбираем цвет из палитры в зависимости от глубины рекурсии
    const colorIndex = (currentDepth + 1) % colors.length;
    // Вызываем нашу "кисть", чтобы нарисовать этот квадрат
    drawTreeSquare(p1, p2, p3, p4, colors[colorIndex]);

    // 4. ГЕОМЕТРИЯ: Находим вершину треугольника для следующих веток
    // Находим середину новой верхней стороны квадрата (между p4 и p3)
    const midX = p4.x + (p3.x - p4.x) / 2;
    const midY = p4.y + (p3.y - p4.y) / 2;
    
    // Из этой середины строим равнобедренный прямоугольный треугольник.
    // Его вершина (pTop) будет общей точкой для двух следующих, меньших веток.
    // Используем тот же трюк с перпендикулярным вектором.
    const pTop = {
        x: midX + (p3.y - p4.y) / 2,
        y: midY - (p3.x - p4.x) / 2
    };

    // 5. РЕКУРСИВНЫЕ ВЫЗОВЫ: Запускаем рисование двух новых веток
    // Вызываем эту же функцию для левой ветки. Ее основанием будет отрезок от p4 до pTop.
    drawTreeBranch(p4, pTop, currentDepth + 1, maxDepth, colors);
    // Вызываем эту же функцию для правой ветки. Ее основанием будет отрезок от pTop до p3.
    drawTreeBranch(pTop, p3, currentDepth + 1, maxDepth, colors);
}

function drawPythagoreanTree() {
    // 1. Очищаем холст, заливая его фоновым цветом
    ctx.fillStyle = '#111827';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 2. Настраиваем параметры дерева
    const maxDepth = 12; // Максимальная глубина рекурсии (насколько "пушистым" будет дерево)
    const palette = colorPalettes[currentPalette]; // Выбираем цветовую палитру
    
    // 3. Вычисляем размер и положение первого квадрата (ствола)
    // Размер ствола зависит от размера холста
    const baseSize = Math.min(canvas.width, canvas.height) / 6;
    // Располагаем ствол внизу по центру холста
    const startY = canvas.height - baseSize / 4;

    // 4. Определяем координаты углов самого первого квадрата
    const p1_base = { x: canvas.width / 2 - baseSize / 2, y: startY }; // нижний левый
    const p2_base = { x: canvas.width / 2 + baseSize / 2, y: startY }; // нижний правый
    const p3_top = { x: p2_base.x, y: startY - baseSize }; // верхний правый
    const p4_top = { x: p1_base.x, y: startY - baseSize }; // верхний левый

    // 5. Рисуем ствол дерева, используя нашу "кисть"
    drawTreeSquare(p1_base, p2_base, p3_top, p4_top, palette[0]);
    
    // 6. ЗАПУСК РЕКУРСИИ
    // Делаем первый вызов `drawTreeBranch`, передавая ей верхнюю сторону ствола (от p4_top до p3_top)
    // в качестве основания для первых двух веток. Начальная глубина - 0.
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
    // === Этап 1: Подготовка холста ===
    
    // Устанавливаем цвет заливки на черный
    ctx.fillStyle = '#000000';
    // Заливаем весь холст черным цветом, чтобы очистить предыдущее изображение
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // === Этап 2: Расчет масштабирования и центрирования ===

    // Задаем отступ в пикселях от краев холста
    const margin = 40;
    // Проверяем, получены ли данные (координаты, цвета). Если нет, выбрасываем ошибку
    if (!x_coords || !y_coords || !color_indices || x_coords.length === 0) {
        throw new Error('Отсутствуют данные для отрисовки');
    }
    
    // Находим минимальные и максимальные значения координат X и Y
    const [minX, maxX] = findMinMax(x_coords);
    const [minY, maxY] = findMinMax(y_coords);
    // Вычисляем математическую ширину и высоту фрактала
    const fractalWidth = maxX - minX;
    const fractalHeight = maxY - minY;
    // Защита от деления на ноль, если все точки лежат на одной линии
    const safeWidth = Math.max(fractalWidth, 1e-9);
    const safeHeight = Math.max(fractalHeight, 1e-9);
    // Вычисляем масштаб по оси X (как вписать ширину фрактала в ширину холста с отступами)
    const scaleX = (canvas.width - margin * 2) / safeWidth;
    // Вычисляем масштаб по оси Y (аналогично для высоты)
    const scaleY = (canvas.height - margin * 2) / safeHeight;
    // Выбираем наименьший из масштабов, чтобы сохранить пропорции фрактала
    const scale = Math.min(scaleX, scaleY);
    // Вычисляем смещение по оси X, чтобы отцентрировать фрактал по горизонтали
    const offsetX = (canvas.width - fractalWidth * scale) / 2 - minX * scale;
    // Вычисляем смещение по оси Y, чтобы отцентрировать фрактал по вертикали
    const offsetY = (canvas.height - fractalHeight * scale) / 2 - minY * scale;
    
    // === Этап 3: Подготовка к отрисовке пикселей ===

    // Выбираем текущую цветовую палитру
    const palette = colorPalettes[currentPalette];
    // Создаем в памяти буфер для пикселей размером с холст (это быстрее, чем рисовать каждый пиксель отдельно)
    const pixelData = ctx.createImageData(canvas.width, canvas.height);
    // Получаем доступ к одномерному массиву данных этого буфера (каждый пиксель = 4 значения: R, G, B, A)
    const data = pixelData.data;
    // Создаем "карту плотности", чтобы считать, сколько точек попадает в один и тот же пиксель
    const densityMap = new Map();
    
    // === Этап 4: Основной цикл отрисовки ===

    // Проходим по каждой точке, полученной из Python
    for (let i = 0; i < x_coords.length; i++) {
        // Переводим математическую координату X в пиксельную координату на холсте
        const canvasX = Math.round(x_coords[i] * scale + offsetX);
        // Переводим математическую координату Y в пиксельную (инвертируем Y, так как у холста ось Y направлена вниз)
        const canvasY = Math.round(canvas.height - (y_coords[i] * scale + offsetY));
        
        // Проверяем, находится ли пиксель в пределах холста
        if (canvasX >= 0 && canvasX < canvas.width && canvasY >= 0 && canvasY < canvas.height) {
            // Вычисляем индекс начала данных для этого пикселя в одномерном массиве `data`
            const pixelIndex = (canvasY * canvas.width + canvasX) * 4;
            // Получаем индекс цвета для этой точки и выбираем цвет из палитры
            const colorIndex = color_indices[i] % palette.length;
            const color = parseHexColor(palette[colorIndex]);
            // Создаем ключ для карты плотности (например, "512,384")
            const key = `${canvasX},${canvasY}`;
            // Увеличиваем счетчик плотности для этого пикселя
            const density = (densityMap.get(key) || 0) + 1;
            densityMap.set(key, density);
            // Вычисляем яркость/прозрачность пикселя на основе его плотности (логарифм для плавности)
            const intensity = Math.min(255, Math.log(density + 1) * 50);

            // Рисуем пиксель только если его новая яркость больше текущей (простой блендинг)
            if (data[pixelIndex + 3] < intensity) {
                // Записываем значения красного, зеленого, синего и яркости (прозрачности) в буфер
                data[pixelIndex + 0] = color.r;
                data[pixelIndex + 1] = color.g;
                data[pixelIndex + 2] = color.b;
                data[pixelIndex + 3] = intensity;
            }
        }
    }
    
    // === Этап 5: Финализация ===
    
    // Переносим весь подготовленный в памяти буфер пикселей на видимый холст за одну операцию
    ctx.putImageData(pixelData, 0, 0);
    // Рисуем поверх фрактала текстовый блок с информацией
    drawInfo(name, x_coords.length, minX, maxX, minY, maxY);
}










/**
 * Преобразует цвет из шестнадцатеричного формата (HEX, например, "#FF6B6B")
 * в объект с компонентами R, G, B (например, {r: 255, g: 107, b: 107}).
 * @param {string} hex - Строка с цветом в формате HEX.
 * @returns {object} - Объект с полями r, g, b или белый цвет по умолчанию, если HEX некорректен.
 */
function parseHexColor(hex) {
    // Используем регулярное выражение для "захвата" пар символов, отвечающих за R, G и B.
    // ^#? - может начинаться с # или нет
    // ([a-f\d]{2}) - захватывает две шестнадцатеричные цифры (компонент R)
    // ...аналогично для G и B
    // $ - конец строки, i - нечувствительность к регистру
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    
    // Если регулярное выражение нашло совпадения (result не null)
    return result ? 
        // то возвращаем объект, где каждая захваченная пара символов преобразуется из 16-ричной системы в число
        {r: parseInt(result[1], 16), g: parseInt(result[2], 16), b: parseInt(result[3], 16)} 
        // иначе возвращаем белый цвет по умолчанию
        : {r: 255, g: 255, b: 255};
}

/**
 * Рисует информационный блок в левом верхнем углу холста.
 * @param {string} name - Название фрактала.
 * @param {number} pointCount - Количество точек.
 * @param {number} minX, maxX, minY, maxY - Границы фрактала.
 */
function drawInfo(name, pointCount, minX, maxX, minY, maxY) {
    // Создаем массив строк с информацией для отображения
    const info = [
        `Fraktal: ${name}`,
        // Форматируем число точек с разделителями для удобства чтения
        `Punktow: ${pointCount.toLocaleString('pl-PL')}`,
        `Paleta: ${currentPalette}`,
        // Округляем координаты до 2 знаков после запятой
        `X: [${minX.toFixed(2)}, ${maxX.toFixed(2)}]`,
        `Y: [${minY.toFixed(2)}, ${maxY.toFixed(2)}]`
    ];
    
    // Устанавливаем шрифт для текста
    ctx.font = 'bold 11px monospace';
    // Устанавливаем цвет для фона инфоблока (полупрозрачный черный)
    ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
    // Рисуем прямоугольный фон для текста
    ctx.fillRect(5, 5, 200, info.length * 16 + 10);
    // Устанавливаем цвет для самого текста
    ctx.fillStyle = '#4dc9b0';
    // Проходим по каждой строке информации и рисуем ее на холсте
    info.forEach((text, idx) => {
        ctx.fillText(text, 10, 18 + idx * 16);
    });
}

/**
 * Эффективно находит минимальное и максимальное значение в массиве чисел.
 * @param {number[]} arr - Массив чисел.
 * @returns {[number, number]} - Массив из двух элементов: [min, max].
 */
function findMinMax(arr) {
    // Если массив пустой, возвращаем [0, 0], чтобы избежать ошибок
    if (arr.length === 0) return [0, 0];
    
    // Инициализируем min и max первым элементом массива
    let min = arr[0], max = arr[0];
    
    // Проходим по остальным элементам массива, начиная со второго
    for (let i = 1; i < arr.length; i++) {
        // Если текущий элемент меньше min, обновляем min
        if (arr[i] < min) min = arr[i];
        // Если текущий элемент больше max, обновляем max
        if (arr[i] > max) max = arr[i];
    }
    
    // Возвращаем найденные минимальное и максимальное значения
    return [min, max];
}

// Добавляем "слушателя" события, который сработает, когда вся HTML-структура страницы будет загружена
window.addEventListener('DOMContentLoaded', () => {
    // Выводим сообщение в консоль разработчика, что скрипт готов к работе
    console.log('✅ Renderer.js - COMPLETE CODE - READY');
    // Показываем приветственное всплывающее сообщение пользователю
    showToast('👋 Witaj w IFS Fractal Generator Pro!', 'info', 3000);
    
    // Находим первую кнопку для генерации фрактала (Папоротник Барнсли)
    const firstButton = document.querySelector('button[data-key="1"]');
    
    // Если кнопка найдена
    if (firstButton) {
        // Ждем 1 секунду (1000 мс) и "нажимаем" на нее программно, чтобы сгенерировать первый фрактал при запуске
        setTimeout(() => firstButton.click(), 1000);
    }
});