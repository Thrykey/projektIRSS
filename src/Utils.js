
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

export const APIUrl = 'https://irss-backend.onrender.com'

// export async function getMe() {
//     const cached = sessionStorage.getItem("me")
//     if (cached) return JSON.parse(cached)

//     const me = await fetch(APIUrl + "/auth/me", {
//         credentials: "include"
//     }).then(res => res.json())

//     sessionStorage.setItem("me", JSON.stringify(me))
//     return me
// }

function parseLocal(value) {
    const [date, time] = value.split('T');
    const [y, m, d] = date.split('-');
    const [h, min] = time.split(':');
    return new Date(y, m - 1, d, h, min);
}

function toLocal(d) {
    const pad = n => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function localToISO(localValue) {
    const [date, time] = localValue.split('T');
    const [year, month, day] = date.split('-').map(Number);
    const [hour, minute] = time.split(':').map(Number);

    const dateObj = new Date(year, month - 1, day, hour, minute);
    return dateObj.toISOString();  // Zwraca w formacie z sekundami i milisekundami
}

/**
 * Ustawia zakres i domyślną wartość dla pól datetime-local
 * @param {HTMLInputElement} startInput - input dla startTime
 * @param {HTMLInputElement} endInput - input dla endTime
 * @param {number} minDaysStart - ile dni do przodu minimalnie od teraz
 * @param {number} maxDaysStart - ile dni do przodu maksymalnie od teraz
 * @param {number} minOffsetEnd - minimalna różnica godzin między start a end
 * @param {number} maxOffsetEnd - maksymalna różnica dni między start a end
 * @param {boolean} setDefault - czy ustawić domyślną wartość
 */
export function setupDateTime(startInput, endInput, minDaysStart, maxDaysStart, minOffsetEnd = 1, maxOffsetEnd = 7, setDefault = true) {
    const now = new Date();

    const minStart = new Date(now);
    minStart.setDate(now.getDate() + minDaysStart);

    const maxStart = new Date(now);
    maxStart.setDate(now.getDate() + maxDaysStart);

    startInput.min = toLocal(minStart);
    startInput.max = toLocal(maxStart);

    if (setDefault) {
        startInput.value = toLocal(minStart);
    }

    function updateEndRange() {
        const start = parseLocal(startInput.value);

        const minEnd = new Date(start.getTime());
        minEnd.setHours(minEnd.getHours() + minOffsetEnd);

        const maxEnd = new Date(start.getTime());
        maxEnd.setDate(maxEnd.getDate() + maxOffsetEnd);

        endInput.min = toLocal(minEnd);
        endInput.max = toLocal(maxEnd);

        if (!endInput.value || parseLocal(endInput.value) < minEnd) {
            endInput.value = toLocal(minEnd);
        }
    }

    updateEndRange();

    startInput.addEventListener('change', updateEndRange);
}