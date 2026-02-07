export class CookieHandler {
    constructor() { }

    /**
     * Funkcja odpowiedzialna za stworzenie Cookie
     * @param {string} name - Nazwa Cookie
     * @param {string} value - Wartość Cookie
     * @param {number} days - Ilość w dniach do zniszczenia Cookie
     */
    set(name, value, days = 1) {
        const expiry = new Date();
        expiry.setDate(expiry.getDate() + days);

        document.cookie = `${encodeURIComponent(name)}=${encodeURIComponent(value)}; expires=${expiry.toUTCString()}; path=/; Secure; SameSite=Lax`;
    }

    /**
     * Funkcja zwracająca informacje o Cookie
     * @param {string} name - Nazwa Cookie
     * @returns - null jak nie ma / string wartości Cookie
     */
    get(name) {
        const nameEQ = encodeURIComponent(name) + "=";
        const cookies = document.cookie.split(';');
        for (let c of cookies) {
            c = c.trim();
            if (c.indexOf(nameEQ) == 0) {
                return decodeURIComponent(c.substring(nameEQ.length));
            }
        }
        return null;
    }

    /**
     * Usuwa Cookie po nazwie
     * @param {string} name - nazwa Cookie
     */
    delete(name) {
        document.cookie = `${encodeURIComponent(name)}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/`;
    }

    /**
     * Sprawdza czy takie Cookie istnieje
     * @param {string} name - nazwa Cookie
     * @returns - bool
     */
    exists(name) {
        return this.get(name) != null;
    }

    /**
     * Odświeża element o nazwie name
     * @param {string} name - nazwa Cookie do odświeżenia
     * @param {HTMLElement} elementId - Id elementu do wyświetlenia informacji poprzez textContent
     * @param {string} fallback - fallback wartości w przypadkue jak Cookie z name nie istnieje
     */
    updateElement(name, elementId, fallback = '') {
        const el = document.getElementById(elementId);
        if (!el) return;
        const value = this.get(name);
        el.textContent = value ?? fallback;
    }
}

