
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

/**
 * Pobiera wartość tokena z hash w URL
 * @param {string} key - Klucz tokena
 * @returns {string|null} - Wartość tokena lub null, jeśli nie istnieje
 */
export function getTokenValue(key) {
    const parts = window.location.hash.split("#");

    const found = parts.find(p => p.startsWith(key + "="));

    return found ? found.split("=")[1] : null;
}

/**
 * Dodaje parametr query do aktualnego URL
 * @param {string} key - Nazwa parametru
 * @param {string} value - Wartość parametru
 */
export function appendQueryParam(key, value) {
    const url = new URL(window.location.href);
    url.searchParams.append(key, value);
    window.history.replaceState(null, "", url.toString());
}

/**
 * Usuwa parametr query z aktualnego URL
 * @param {string} key - Nazwa parametru do usunięcia
 */
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

function pad(n) {
    return n.toString().padStart(2, '0');
}

function parseLocal(value) {
    const [date, time] = value.split('T');
    const [y, m, d] = date.split('-');
    const [h, min] = time.split(':');
    return new Date(y, m - 1, d, h, min);
}


function toLocal(d) {
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

/**
 * Konwertuje lokalną wartość datetime-local na ISO
 * @param {string} localValue - Wartość w formacie YYYY-MM-DDTHH:mm
 * @returns {string} - ISO string z sekundami i milisekundami
 */
export function localToISO(localValue) {
    return parseLocal(localValue).toISOString();
}

export function updateDisplayDate(input, format = 'DD/MM/YYYY HH:mm') {
    const display = input.parentElement.querySelector('.displayDate');
    if (!display) return;

    if (!input.value) {
        display.textContent = '';
        return;
    }

    const date = new Date(input.value);
    const day = pad(date.getDate());
    const month = pad(date.getMonth() + 1);
    const year = date.getFullYear();
    const hours = pad(date.getHours());
    const minutes = pad(date.getMinutes());

    display.textContent = format
        .replace('DD', day)
        .replace('MM', month)
        .replace('YYYY', year)
        .replace('HH', hours)
        .replace('mm', minutes);
}

/**
 * Ustawia zakres i domyślną wartość dla pól datetime-local
 * @param {HTMLInputElement} startInput - input dla startTime
 * @param {HTMLInputElement} endInput - input dla endTime
 * @param {number} [minDaysStart=0] - minimalna liczba dni od teraz dla startInput
 * @param {number} [maxDaysStart=7] - maksymalna liczba dni od teraz dla startInput
 * @param {number} [minOffsetEndH=1] - minimalna różnica godzin między start a end
 * @param {number} [maxOffsetEndD=7] - maksymalna różnica dni między start a end
 * @param {boolean} [setDefault=true] - czy ustawić domyślną wartość startInput
 */
export function setupDateTime(startInput, endInput, minDaysStart = 0, maxDaysStart = 7, minOffsetEndH = 0, maxOffsetEndD = 7, setDefault = true) {
    const now = new Date();

    const minStart = new Date(now);
    minStart.setDate(now.getDate() + minDaysStart);

    const maxStart = new Date(now);
    maxStart.setDate(now.getDate() + maxDaysStart);

    startInput.min = toLocal(minStart);
    startInput.max = toLocal(maxStart);

    if (setDefault) {
        const defaultStart = new Date();
        defaultStart.setHours(defaultStart.getHours() + 1);

        if (defaultStart < minStart) {
            startInput.value = toLocal(minStart);
        } else if (defaultStart > maxStart) {
            startInput.value = toLocal(maxStart);
        } else {
            startInput.value = toLocal(defaultStart);
        }
    }

    function updateEndRange() {
        const start = parseLocal(startInput.value);

        const minEnd = new Date(start.getTime());
        minEnd.setHours(minEnd.getHours() + minOffsetEndH);

        const maxEnd = new Date(start.getTime());
        maxEnd.setDate(maxEnd.getDate() + maxOffsetEndD);

        endInput.min = toLocal(minEnd);
        endInput.max = toLocal(maxEnd);

        if (!endInput.value || parseLocal(endInput.value) < minEnd) {
            endInput.value = toLocal(minEnd);
        }

        updateDisplayDate(endInput);
    }

    startInput.addEventListener('change', () => {
        updateEndRange();
        updateDisplayDate(startInput);
    });

    endInput.addEventListener('change', () => updateDisplayDate(endInput));

    updateDisplayDate(startInput);
    updateEndRange();
}