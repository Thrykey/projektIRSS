/**
 * ScalingPreferenceColors - Dynamicznie przypisuje kolory gradientów do elementów preferencji
 * w sposób zrównoważony, aby zawsze pierwsza wartość pierwszej pary i ostatnia pary ostatniej były użyte
 */

class ScalingPreferenceColors {
    /**
     * 10 par kolorów gradientu - 5 niebieskiego, 5 pomarańczowego (na bazie logotypu UKEN)
     */
    static colorPairs = [
        { start: '#FF6B6B', end: '#FF8E72' },     // Red -> Orange
        { start: '#FFA500', end: '#FFD93D' },     // Orange -> Yellow
        { start: '#FFD93D', end: '#6BCB77' },     // Yellow -> Green
        { start: '#6BCB77', end: '#4D96FF' },     // Green -> Cyan
        { start: '#4D96FF', end: '#7B68EE' },     // Cyan -> Blue
        { start: '#7B68EE', end: '#DA70D6' },     // Blue -> Purple
        { start: '#DA70D6', end: '#FF69B4' },     // Purple -> Pink
        { start: '#FF69B4', end: '#FFB6C1' },     // Pink -> Light Pink
        { start: '#FFB6C1', end: '#FFA07A' },     // Light Pink -> Salmon
        { start: '#FFA07A', end: '#FF6B6B' }      // Salmon -> Red
    ];

    /**
     * Inicjalizuje skalowanie kolorów dla wszystkich elementów
     */
    static initialize() {
        document.addEventListener('DOMContentLoaded', () => {
            this.applyGradients();
        });

        // Fallback na wypadek gdy DOM jest już załadowany
        if (document.readyState === 'loading') {
            return;
        }
        this.applyGradients();
    }

    /**
     * Przypisuje gradienty do wszystkich elementów preferencji
     */
    static applyGradients() {
        const elements = document.querySelectorAll('.wyborGrupyLabolatoryjnej');
        if (elements.length === 0) return;

        const totalSlots = this.colorPairs.length * 2; // 10 par * 2 kolory = 20 slotów
        const numElements = elements.length;

        // Określ szerokość borderu w zależności od rozmiaru ekranu
        // skalowanie przy wielu elementach klasy .wybory, 
        // więc używamy mniejszej szerokości borderu na mniejszych ekranach
        const borderWidth = window.innerWidth <= 1100 ? 2 : 5;

        elements.forEach((element, index) => {
            // Oblicz które sloty należą do tego elementu
            const startSlot = Math.floor(index * totalSlots / numElements);
            const endSlot = Math.floor((index + 1) * totalSlots / numElements) - 1;

            // Konwertuj slot do pary i wartości (start/end)
            const startColor = this.getColorFromSlot(startSlot);
            const endColor = this.getColorFromSlot(endSlot);

            // Przypisz gradient do border-image
            const gradient = `linear-gradient(90deg, ${startColor} 0%, ${endColor} 100%)`;
            element.style.border = `${borderWidth}px solid`;
            element.style.borderImage = gradient + '1';
        });

        // Nasłuchuj zmian rozmiaru okna
        window.addEventListener('resize', () => this.applyGradients());
    }

    /**
     * Pobiera kolor z konkretnego sloyu
     * @param {number} slot - Numer slotu (0-19)
     * @returns {string} Kolor HEX
     */
    static getColorFromSlot(slot) {
        // Każda para zajmuje 2 sloty (start i end)
        const pairIndex = Math.floor(slot / 2);
        const isEnd = slot % 2 === 1;

        if (pairIndex >= this.colorPairs.length) {
            return this.colorPairs[this.colorPairs.length - 1].end;
        }

        return isEnd ? this.colorPairs[pairIndex].end : this.colorPairs[pairIndex].start;
    }
}

// Inicjalizuj gdy skrypt się załaduje
ScalingPreferenceColors.initialize();
