export class DragDropManager {
    /**
     * Inicjalizuje menedżer drag and drop, defaultowe parametry selektorów można nadpisać (czysto po debug)
     * @param {string} containerSelector - Selektor CSS kontenera zawierającego elementy do drag and drop
     * @param {string} dragItemSelector - Selektor CSS elementów, które można draggować
     */
    constructor(containerSelector = '.wybor', dragItemSelector = '.wyborGrupyLabolatoryjnej') {
        this.container = document.querySelector(containerSelector);
        this.dragItemSelector = dragItemSelector;
        this.draggedElement = null;
        this.draggedClone = null;
        this.targetElement = null;
        this.originalPosition = null;
        this.isButtonPressed = false;
        this.isTouchActive = false;
        this.mouseX = 0;
        this.mouseY = 0;

        this.initialize();
    }

    /**
     * Inicjalizuje wszystkie komponenty menedżera drag and drop
     */
    initialize() {
        this.setupEventListeners();
        this.addDragStyles();
    }

    /**
     * Rejestruje event listenery dla elementów i dokumentu
     */
    setupEventListeners() {
        const dragItems = this.getDragItems();
        dragItems.forEach(item => {
            // Mouse events
            item.addEventListener('mousedown', (e) => this.handleDragStart(e));
            item.addEventListener('mousemove', (e) => this.handleDragOver(e));
            item.addEventListener('mouseup', (e) => this.handleDragEnd(e));
            item.addEventListener('mouseleave', (e) => this.handleDragLeave(e));

            // Touch events
            item.addEventListener('touchstart', (e) => this.handleTouchStart(e), false);
            item.addEventListener('touchmove', (e) => this.handleTouchMove(e), false);
            item.addEventListener('touchend', (e) => this.handleTouchEnd(e), false);
            item.addEventListener('touchcancel', (e) => this.handleTouchCancel(e), false);
        });

        document.addEventListener('mouseup', (e) => this.handleGlobalMouseUp(e));
        document.addEventListener('mousemove', (e) => this.handleMouseMove(e));
        document.addEventListener('touchend', (e) => this.handleGlobalTouchEnd(e), false);
    }

    /**
     * Pobiera wszystkie elementy dostępne do drag and drop
     * @returns {HTMLElement[]} Tablica elementów do drag and drop
     */
    getDragItems() {
        return Array.from(this.container.querySelectorAll(this.dragItemSelector));
    }

    /**
     * Dodaje stylizację CSS dla animacji drag and drop do dokumentu
     */
    addDragStyles() {
        const style = document.createElement('style');
        style.textContent = `
            .drag-clone {
                position: fixed;
                transform: scale(1.1) rotate(15deg);
                z-index: 100;
                pointer-events: none;
                border-top: 3px solid;
            }

            .drag-origin {
                opacity: 0;
                transition: transform 0.3s ease-in-out;
            }

            .drag-inactive {
                opacity: 0.5;
                border-style: dashed;
                filter: brightness(0.7);
                transition: opacity 0.2s ease-out, filter 0.2s ease-out;
            }

            .drag-target {
                transform: scale(1.1);
                transition: all 0.3s ease-in-out;
                filter: brightness(1.2);
            }

            .drag-moving {
                transform: scale(1) rotate(0deg);
                transition: all 0.3s ease-in-out;
            }

            .touch-active {
                cursor: grab;
            }
        `;
        document.head.appendChild(style);
    }

    /**
     * Obsługuje początek operacji drag (wciśnięcie przycisku myszy na elemencie)
     * @param {MouseEvent} event - Event zdarzenia myszy
     */
    handleDragStart(event) {
        if (event.button !== 0 && event.button !== 2) return;

        event.preventDefault();
        this.isButtonPressed = true;
        this.draggedElement = event.currentTarget;
        this.originalPosition = Array.from(this.getDragItems()).indexOf(this.draggedElement);

        this.createDragClone(this.draggedElement, event.clientX, event.clientY);
        this.applyDragStyles(this.draggedElement);
    }

    /**
     * Obsługuje początek operacji drag na urządzeniach z ekranem dotykowym
     * @param {TouchEvent} event - Event zdarzenia dotyku
     */
    handleTouchStart(event) {
        if (event.touches.length !== 1) return;

        event.preventDefault();
        this.isTouchActive = true;
        this.draggedElement = event.currentTarget;
        this.originalPosition = Array.from(this.getDragItems()).indexOf(this.draggedElement);

        const touch = event.touches[0];
        this.createDragClone(this.draggedElement, touch.clientX, touch.clientY);
        this.applyDragStyles(this.draggedElement);
    }

    /**
     * Aplikuje klasy CSS dla wizualizacji stanu drag na wszystkich elementach
     * @param {HTMLElement} originalItem - Element, który jest aktualnie draggowany
     */
    applyDragStyles(originalItem) {
        this.getDragItems().forEach(item => {
            if (item === originalItem) {
                item.classList.add('drag-origin');
                item.classList.remove('drag-inactive');
            } else {
                item.classList.add('drag-inactive');
                item.classList.remove('drag-origin');
            }
        });
    }

    /**
     * Tworzy klon elementu do draggowania i dodaje go do dokumentu
     * @param {HTMLElement} originalElement - Element do sklonowania
     * @param {number} x - Współrzędna X początkowej pozycji myszy
     * @param {number} y - Współrzędna Y początkowej pozycji myszy
     */
    createDragClone(originalElement, x, y) {
        this.draggedClone = originalElement.cloneNode(true);
        this.draggedClone.classList.add('drag-clone');
        this.draggedClone.classList.remove('drag-origin', 'drag-inactive');
        this.copyComputedStyles(originalElement, this.draggedClone);
        document.body.appendChild(this.draggedClone);

        this.updateClonePosition(x, y);
    }

    /**
     * Kopuje obliczone style CSS z elementu źródłowego do docelowego
     * @param {HTMLElement} source - Element źródłowy z którego pobierane są style
     * @param {HTMLElement} target - Element docelowy, któremu przypisywane są style
     */
    copyComputedStyles(source, target) {
        const computedStyle = window.getComputedStyle(source);
        const cssProperties = ['background', 'background-color', 'background-image', 'color',
            'font-size', 'font-weight', 'border', 'border-radius', 'padding', 'width', 'height',
            'display', 'flex-direction', 'justify-content', 'align-items'];

        cssProperties.forEach(prop => {
            const value = computedStyle.getPropertyValue(prop);
            if (value) {
                target.style[prop] = value;
            }
        });
    }

    /**
     * Aktualizuje pozycję klona elementu na podstawie współrzędnych myszy/dotyku
     * @param {number} x - Współrzędna X myszy/dotyku
     * @param {number} y - Współrzędna Y myszy/dotyku
     */
    updateClonePosition(x, y) {
        if (!this.draggedClone) return;

        const offsetX = -this.draggedClone.offsetWidth / 2;
        const offsetY = -this.draggedClone.offsetHeight / 2;

        this.draggedClone.style.left = (x + offsetX) + 'px';
        this.draggedClone.style.top = (y + offsetY) + 'px';
    }

    /**
     * Obsługuje ruch myszy nad elementem podczas drag operacji
     * @param {MouseEvent} event - Event zdarzenia myszy
     */
    handleDragOver(event) {
        if (!this.isButtonPressed || !this.draggedElement) return;

        event.preventDefault();
        const targetItem = event.currentTarget;

        if (targetItem !== this.draggedElement && this.targetElement !== targetItem) {
            this.targetElement = targetItem;
        }
    }

    /**
     * Obsługuje ruch palca nad elementem podczas drag operacji na ekranie dotykowym
     * @param {TouchEvent} event - Event zdarzenia dotyku
     */
    handleTouchMove(event) {
        if (!this.isTouchActive || !this.draggedElement || event.touches.length !== 1) return;

        event.preventDefault();
        const touch = event.touches[0];

        this.updateClonePosition(touch.clientX, touch.clientY);
        this.detectTouchTarget(touch.clientX, touch.clientY);
    }

    /**
     * Wykrywa element docelowy na podstawie współrzędnych dotyku
     * @param {number} x - Współrzędna X dotyku
     * @param {number} y - Współrzędna Y dotyku
     */
    detectTouchTarget(x, y) {
        const element = document.elementFromPoint(x, y);
        const targetItem = element?.closest(this.dragItemSelector);

        if (targetItem && targetItem !== this.draggedElement && this.targetElement !== targetItem) {
            this.targetElement = targetItem;
        }
    }

    /**
     * Obsługuje opuszczenie elementu myszą podczas drag operacji
     * @param {MouseEvent} event - Event zdarzenia myszy
     */
    handleDragLeave(event) {
        if (this.targetElement === event.currentTarget) {
            this.targetElement = null;
        }
    }

    /**
     * Obsługuje ruch myszy na całym dokumencie i aktualizuje pozycję klona
     * @param {MouseEvent} event - Event zdarzenia myszy
     */
    handleMouseMove(event) {
        this.mouseX = event.clientX;
        this.mouseY = event.clientY;

        if (this.isButtonPressed && this.draggedClone) {
            this.updateClonePosition(event.clientX, event.clientY);
        }
    }

    /**
     * Obsługuje koniec operacji drag (puszczenie przycisku myszy)
     * @param {MouseEvent} event - Event zdarzenia myszy
     */
    handleDragEnd(event) {
        if (!this.isButtonPressed) return;

        if (this.draggedElement && this.targetElement && this.draggedElement !== this.targetElement) {
            this.swapElements(this.draggedElement, this.targetElement);
        } else {
            this.resetDragState();
        }
    }

    /**
     * Obsługuje koniec operacji drag na ekranie dotykowym
     * @param {TouchEvent} event - Event zdarzenia dotyku
     */
    handleTouchEnd(event) {
        if (!this.isTouchActive) return;

        if (this.draggedElement && this.targetElement && this.draggedElement !== this.targetElement) {
            this.swapElements(this.draggedElement, this.targetElement);
        } else {
            this.resetDragState();
        }
    }

    /**
     * Obsługuje anulowanie operacji touch
     * @param {TouchEvent} event - Event zdarzenia dotyku
     */
    handleTouchCancel(event) {
        if (this.isTouchActive) {
            this.isTouchActive = false;
            this.resetDragState();
        }
    }

    /**
     * Obsługuje puszczenie przycisku myszy na poziomie dokumentu
     * @param {MouseEvent} event - Event zdarzenia myszy
     */
    handleGlobalMouseUp(event) {
        if (this.isButtonPressed) {
            this.isButtonPressed = false;
            if (this.draggedElement) {
                this.resetDragState();
            }
        }
    }

    /**
     * Obsługuje puszczenie dotyku na poziomie dokumentu
     * @param {TouchEvent} event - Event zdarzenia dotyku
     */
    handleGlobalTouchEnd(event) {
        if (this.isTouchActive) {
            this.isTouchActive = false;
            if (this.draggedElement) {
                this.resetDragState();
            }
        }
    }

    /**
     * Zamienia pozycjami draggowany element z elementem docelowym z animacją
     * @param {HTMLElement} draggedItem - Element, który jest draggowany
     * @param {HTMLElement} targetItem - Element docelowy do zamiany
     */
    swapElements(draggedItem, targetItem) {
        draggedItem.classList.add('drag-moving');
        targetItem.classList.add('drag-target');

        setTimeout(() => {
            // Swap using a placeholder element
            const placeholder = document.createElement('div');
            draggedItem.before(placeholder);
            targetItem.before(draggedItem);
            placeholder.replaceWith(targetItem);

            draggedItem.classList.remove('drag-moving');
            targetItem.classList.remove('drag-target');
        }, 150);

        this.resetDragState();
    }

    /**
     * Resetuje stan drag i drop operacji do stanu początkowego
     */
    resetDragState() {
        if (this.draggedClone) {
            this.draggedClone.remove();
            this.draggedClone = null;
        }

        this.getDragItems().forEach(item => {
            item.classList.remove('drag-origin', 'drag-inactive', 'drag-moving', 'drag-target');
        });

        this.draggedElement = null;
        this.targetElement = null;
        this.originalPosition = null;
        this.isButtonPressed = false;
        this.isTouchActive = false;
    }
}