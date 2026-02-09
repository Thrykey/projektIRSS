import { setDisplayByElement, setTextContentByElement, createSpan, urlHasHash, urlIncludes, getTokenValue, removeQueryParam, showErrorColors, showSuccesColors, APIUrl } from './Utils.js';
import { DragDropManager } from './DragNdropMenager.js';
import { CookieHandler } from './CookieHandler.js';


const cookies = new CookieHandler();
const panelButtons = document.querySelectorAll('.PanelStarostyBtnBehv')
const feedback = document.getElementById('feedbackWyslania')

// GRUPY

function createGroupDiv(number) {
    const div = document.createElement('div');
    div.className = 'wyborGrupyLabolatoryjnej';
    div.id = `grupaL${number}`;

    const span = createSpan(`L${number}`, null, 'nrGrupySpan');
    div.appendChild(span);

    return div;
}

function generujWyborGrup() {
    const container = document.querySelector('.wybor');
    if (!container) return;

    container.replaceChildren();

    const query = window.location.search.slice(1);
    const match = query.match(/-(\d+)G-/i);

    if (!match) {
        container.appendChild(createSpan(
            'Link wygenerowany niepoprawnie, zwróć się do starosty',
            null,
            'bladLinku'
        ));
        setDisplayByElement('wyboryGrupoweSpanMobile', 'none');
        setDisplayByElement('wyslijWniosek', 'none');
        // alert('Link jest niepoprawny ')
        return;
    }

    const iloscGrup = parseInt(match[1], 10);

    container.appendChild(createSpan('Najbardziej', 'najbardziejSpan'));

    for (let i = 1; i <= iloscGrup; i++) {
        container.appendChild(createGroupDiv(i));
    }

    container.appendChild(createSpan('Najmniej', 'najmniejSpan'));
}

function getCurrentPreferences() {
    const groups = document.querySelectorAll('.wyborGrupyLabolatoryjnej');
    const preferences = [];

    groups.forEach((el, index) => {
        const groupIdMatch = el.id.match(/\d+$/);
        const groupId = groupIdMatch ? parseInt(groupIdMatch[0], 10) : 0;

        preferences.push({
            group_id: groupId,
            priority: index + 1
        });
    });

    return { preferences };
}

// SPRAWDZANIE URL I REAKCJE


if (urlIncludes('access_token')) {
    sessionStorage.setItem('access_token', urlIncludes('access_token'))
    console.log('Zapisano JWT pomyślnie, usuwanie z URL');

    removeQueryParam('access_token')
}
// localStorage.removeItem('token')
function reactToJWT() {
    if (!sessionStorage.getItem('access_token')) {
        window.location.href = (urlIncludes('code') != null) ? './pages/Logowanie.html?code=' + urlIncludes('code') : './pages/Logowanie.html'
        return
    }
}
// reactToJWT()


// API CALLS


// getMe()

async function sendPreferences() {
    try {
        // const token = sessionStorage.getItem('access_token')
        // if (!token) {
        //     console.warn('Brak tokenu!');
        //     return
        // }
        getDashboard()
        const data = getCurrentPreferences()

        console.log(JSON.stringify(data));

        const res = await fetch(APIUrl + '/student/register', {
            method: 'POST',
            mode: "cors",
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        })


        const status = res.status;
        const resData = await res.json();

        switch (status) {
            case 200:
                console.log('Request wysłany poprawnie');
                showSuccesColors(feedback)
                break;
            case 401:
                console.error('Błąd 401 - brak permisji')
                showErrorColors(feedback)
                setTextContentByElement('feedbackSpan', 'Błąd 401 - brak permisji')
                break
            case 404:
                console.error('Błąd 404 - brak odpowiedzi')
                showErrorColors(feedback)
                setTextContentByElement('feedbackSpan', 'Błąd 404 - brak odpowiedzi')
                break
            case 422:
                console.error('Błąd 422 - niepoprawne dane:')
                console.table(resData.detail)
                showErrorColors()
                setTextContentByElement('feedbackSpan', 'Błąd 422 - niepoprawne dane:')
                break

            default:
                console.warn(`Nieoczekiwany status: ${status}`, resData);
        }
    } catch (err) {
        console.error('Błąd sieci lub inny problem:', err);
        setTextContentByElement('feedbackSpan', `Błąd sieci lub inny problem: ${err}`)
        showErrorColors(feedback)
    }
}

async function getDashboard() {
    const res = await fetch(APIUrl + "/users/dashboard", {
        method: "GET",
        credentials: "include"
    });

    const data = await res.json();

    console.log("Dashboard:", data);
}


// EVENT LISTENERY

document.addEventListener('DOMContentLoaded', () => {
    generujWyborGrup();
    new DragDropManager('.wybor', '.wyborGrupyLabolatoryjnej');

    document.getElementById('wniosekBtn').disabled = false
});

panelButtons.forEach(button => {
    button.addEventListener('click', () => {
        window.location.href = './pages/Logowanie.html?user=starosta&dest=panel';
    })
})

document.getElementById('wniosekBtn').addEventListener('click', () => {
    document.getElementById('panelRejestracji').classList.remove('show');
    document.getElementById('panelRejestracji').classList.add('hide');
    setTimeout(() => { document.getElementById('feedbackWyslania').classList.add('show') }, 500);
    document
        .querySelectorAll('.leftLine, .rightLine')
        .forEach(el => {
            el.classList.add('active')
        })
    sendPreferences()

});

document.getElementsByClassName('adnotacjeSpan')[0].addEventListener('click', () => {
    window.open('./pages/FAQ.html', '_blank');
})

console.warn(
    'Jak czegoś tutaj szukasz, to pewnie znajdziesz. ' +
    'Jak uważasz że umiesz napisać lepiej lub chcesz nam pomóc w rozwinięciu strony, ' +
    'zgłoś się do SKNI.'
);
