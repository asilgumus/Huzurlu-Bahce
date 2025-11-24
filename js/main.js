// Hatırlatmanız doğrultusunda Tauri invoke satırı eklendi.
// const { invoke } = window.__TAURI__.core;

/**
 * Asenkron yardımcı fonksiyon: Belirtilen milisaniye kadar bekler.
 */
const delay = ms => new Promise(res => setTimeout(res, ms));

document.addEventListener('DOMContentLoaded', async () => {

    // --- HTML Elementleri ---
    const allScreens = document.querySelectorAll('.screen');
    const allButtons = document.querySelectorAll('.btn, .btn-back');
    const animationContainer = document.querySelector('.background-animations');
    const sequenceDisplay = document.getElementById('sequence-display');
    const dragAndDropArea = document.getElementById('drag-and-drop-area');
    const draggableItemsSource = document.getElementById('draggable-items-source');
    const dropBoxesContainer = document.querySelector('.drop-boxes');
    
    // --- Oyun Verileri ---
    const memoryGameItems = {
        apple: '<i class="fa-solid fa-apple-whole"></i>',
        banana: '<i class="fa-solid fa-lemon"></i>',
        monkey: '<i class="fa-solid fa-hippo"></i>',
    };
    const itemKeys = Object.keys(memoryGameItems);

    /** EKRAN YÖNETİMİ */
    const showScreen = async (screenId) => {
        const currentScreen = document.querySelector('.screen.active');
        if (currentScreen) currentScreen.classList.remove('active');
        await delay(50);
        const nextScreen = document.getElementById(screenId);
        if (nextScreen) nextScreen.classList.add('active');
        if (screenId === 'memory-game-screen') await runMemoryGameSequence();
        return delay(500);
    };

    /** BELLEK OYUNU MANTIĞI */
    const runMemoryGameSequence = async () => {
        dragAndDropArea.classList.add('hidden');
        sequenceDisplay.classList.remove('hidden');
        sequenceDisplay.innerHTML = '';
        document.querySelectorAll('.drop-box').forEach(box => box.innerHTML = '');
        await delay(1000);
        const sequence = Array.from({ length: 3 }, () => itemKeys[Math.floor(Math.random() * itemKeys.length)]);
        for (const itemName of sequence) {
            sequenceDisplay.innerHTML = memoryGameItems[itemName];
            sequenceDisplay.classList.add('pop');
            await delay(1500);
            sequenceDisplay.innerHTML = '';
            sequenceDisplay.classList.remove('pop');
            await delay(3000);
        }
        sequenceDisplay.classList.add('hidden');
        dragAndDropArea.classList.remove('hidden');
    };

    /** NAVİGASYON KURULUMU */
    const setupNavigation = () => {
        allButtons.forEach(button => {
            button.addEventListener('click', async (event) => {
                event.preventDefault();
                let targetId = null;
                if (button.classList.contains('btn-back')) targetId = button.dataset.parent;
                else if (button.dataset.targetScreen) targetId = button.dataset.targetScreen;
                else {
                    switch (button.id) {
                        case 'start-cognitive-btn': targetId = 'cognitive-menu-screen'; break;
                        case 'start-motor-btn': targetId = 'motor-menu-screen'; break;
                        case 'show-progress-btn': targetId = 'progress-screen'; break;
                        case 'show-awards-btn': targetId = 'awards-screen'; break;
                    }
                }
                if (targetId) await showScreen(targetId);
            });
        });
    };

    /** Bütün kutuların dolup dolmadığını kontrol et */
    const checkCompletion = () => {
        const allBoxes = document.querySelectorAll('.drop-box');
        const allFull = Array.from(allBoxes).every(box => box.children.length > 0);
        if (allFull) setTimeout(() => { alert("Harika! Tüm kutuları doldurdun."); }, 100);
    };
    
    /** SÜRÜKLE VE BIRAK KURULUMU */
    const setupDragAndDrop = () => {
        const draggables = document.querySelectorAll('.draggable-item');
        const dropBoxes = document.querySelectorAll('.drop-box');
        draggables.forEach(draggable => {
            draggable.addEventListener('dragstart', () => draggable.classList.add('dragging'));
            draggable.addEventListener('dragend', () => draggable.classList.remove('dragging'));
        });
        dropBoxes.forEach(box => {
            box.addEventListener('dragover', e => { e.preventDefault(); box.classList.add('drag-over'); });
            box.addEventListener('dragleave', () => box.classList.remove('drag-over'));
            box.addEventListener('drop', e => {
                e.preventDefault();
                box.classList.remove('drag-over');
                const draggingItem = document.querySelector('.dragging');
                if (draggingItem) {
                    if (box.children.length > 0) box.innerHTML = '';
                    const itemClone = draggingItem.cloneNode(true);
                    itemClone.classList.remove('dragging');
                    itemClone.removeAttribute('id');
                    itemClone.setAttribute('draggable', 'false');
                    box.appendChild(itemClone);
                    checkCompletion();
                }
            });
        });
        dropBoxesContainer.addEventListener('click', e => {
            const clickedItem = e.target.closest('.drop-box .draggable-item');
            if (clickedItem) clickedItem.remove();
        });
    };

    /** ARKA PLAN ANİMASYONLARI (GARANTİLİ EŞİT DAĞILIM) */
    const createBackgroundAnimations = (totalCount) => {
        // Toplam sayıyı ikiye böl. Tek sayılar için bir taraf bir fazla olacak.
        const leftCount = Math.floor(totalCount / 2);
        const rightCount = Math.ceil(totalCount / 2);

        // 1. DÖNGÜ: Sadece sol taraf için yaprak oluştur
        for (let i = 0; i < leftCount; i++) {
            const leaf = document.createElement('div');
            leaf.className = 'leaf';
            // Sol taraf (ekranın ilk %30'luk kısmı)
            const horizontalPosition = Math.random() * 30;
            leaf.style.left = `${horizontalPosition}vw`;
            leaf.style.animationDuration = `${Math.random() * 5 + 8}s`;
            leaf.style.animationDelay = `${Math.random() * 10}s`;
            leaf.style.opacity = Math.random() * 0.5 + 0.3;
            animationContainer.appendChild(leaf);
        }

        // 2. DÖNGÜ: Sadece sağ taraf için yaprak oluştur
        for (let i = 0; i < rightCount; i++) {
            const leaf = document.createElement('div');
            leaf.className = 'leaf';
            // Sağ taraf (ekranın son %30'luk kısmı, yani %70'den sonrası)
            const horizontalPosition = Math.random() * 30 + 70;
            leaf.style.left = `${horizontalPosition}vw`;
            leaf.style.animationDuration = `${Math.random() * 5 + 8}s`;
            leaf.style.animationDelay = `${Math.random() * 10}s`;
            leaf.style.opacity = Math.random() * 0.5 + 0.3;
            animationContainer.appendChild(leaf);
        }
    };

    // --- UYGULAMAYI BAŞLAT ---
    setupNavigation();
    setupDragAndDrop();
    createBackgroundAnimations(30); // Çift sayı vermek tam eşit dağılım sağlar (8 sol, 8 sağ)
    await showScreen('main-menu-screen');
    console.log("Huzurlu Bahçe: Arka plan animasyonu sol ve sağa garantili eşit dağılımla çalışıyor.");
});