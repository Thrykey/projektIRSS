
/**
 * Funkcja zmieniająca display na wybranym elemencie. Dla klas obsługiwany jest każdy element
 * @param {string} element - Nazwa ID lub Klasy elementu 
 * @param {string} style - Ustawienie stylu display 
 */
export function setDisplayByElement(element, style) {
    if (document.getElementById(element))
        document.getElementById(element).style.display = style;
    else if (document.getElementsByClassName(element)) {
        const elems = document.getElementsByClassName(element);
        for (const el of elems) {
            el.style.display = style;
        }
    }

}

/**
 * Funkcja zmieniająca textContent na wybranym elemencie. Dla klas obsługiwany jest każdy element
 * @param {String} element - Nazwa ID lub Klasy elementu 
 * @param {String} message - Wiadomość elementu 
 */
export function setTextContentByElement(element, message) {
    if (document.getElementById(element))
        document.getElementById(element).textContent = message
    else if (document.getElementsByClassName(element)) {
        const elems = document.getElementsByClassName(element);
        for (const el of elems) {
            el.textContent = message
        }
    }
}


/**
 * Funkcja odpowiedzialna za tworzenie nowego elementu spanu, wraz z jego zawartością
 * @param {String} text - Wyświetlana wartość spanu
 * @param {String} id - OPCJONALNE, ID spanu 
 * @param {String} className - OPCJONALNE, klasa spanu
 * @returns 
 */
export function createSpan(text, id = null, className = null) {
    const span = document.createElement('span');
    span.textContent = text;
    if (id) span.id = id;
    if (className) span.className = className;
    return span;
}

/**
 * Clamps a numeric input value between min and max.
 *
 * @param {HTMLInputElement} input - The input element to clamp.
 * @param {number} min - Minimum allowed value if input.min is not set.
 * @param {number} max - Maximum allowed value if input.max is not set.
 */
export function clampValues(userInput, min, max) {
    const realMin = userInput.min == "" ? Number(userInput.min) : min;
    const realMax = userInput.max == "" ? Number(userInput.max) : max;
    let value = Number(userInput.value);

    if (value < min) {
        userInput.value = realMin;
        console.log("clamping to min");
    } else if (value > max) {
        userInput.value = realMax;
        console.log("clamping to max");
    }
}

/**
 * Funkcja sprawdzająca czy w URL występuje jakaś wartość
 * @param {String} key - wartość szukana w url, po '?' 
 * @returns bool
 */
export function urlIncludes(key) {
    return new URL(window.location.href).searchParams.get(key);
}

/**
 * Funkcja sprawdzająca czy w URL istnieje dany hash
 * @param {String} val - wartość szukana w hashach, prefix '#' 
 * @returns bool
 */
export function urlHasHash(val) {
    const parts = window.location.hash.split("#");

    return parts.some(p => p.startsWith(val));
}

export function getTokenValue(key) {
    const parts = window.location.hash.split("#");

    const found = parts.find(p => p.startsWith(key + "="));

    return found ? found.split("=")[1] : null;

}

export function appendQueryParam(key, value) {
    const url = new URL(window.location.href);
    url.searchParams.append(key, value);
    window.history.replaceState(null, "", url.toString());
}

export function removeQueryParam(key) {
    const url = new URL(window.location.href);
    url.searchParams.delete(key);
    window.history.replaceState(null, "", url.toString());
}
