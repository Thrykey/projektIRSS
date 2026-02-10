import {
    setDisplayByElement, setTextContentByElement, createSpan, urlHasHash,
    urlIncludes, getTokenValue, removeQueryParam, showErrorColors,
    showSuccesColors, APIUrl, getMe
} from './Utils.js';
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
    if (!container) return false;

    container.replaceChildren();

    const query = urlIncludes('group_id');
    const match = query.split('-')[1].match(/(\d+)G/i);

    if (!match) {
        container.appendChild(createSpan(
            'Link wygenerowany niepoprawnie, zwróć się do starosty',
            null,
            'bladLinku'
        ));
        setDisplayByElement('wyboryGrupoweSpanMobile', 'none');
        setDisplayByElement('wyslijWniosek', 'none');
        // alert('Link jest niepoprawny ')
        return false;
    }

    const iloscGrup = parseInt(match[1], 10);

    container.appendChild(createSpan('Najbardziej', 'najbardziejSpan'));

    for (let i = 1; i <= iloscGrup; i++) {
        container.appendChild(createGroupDiv(i));
    }

    container.appendChild(createSpan('Najmniej', 'najmniejSpan'));
    return true
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

function isLoggedIn() {
    if (!sessionStorage.getItem('loggedIn')) {
        alert('Nie jesteś zalogowany! Zostaniesz przekierowany na stronę logowania.')
        window.location.href = (urlIncludes('invite') != null) ? './pages/Logowanie.html?invite=' + urlIncludes('invite') : './pages/Logowanie.html'
    }
}
console.log(sessionStorage.getItem('loggedIn'));

isLoggedIn()

async function sendPreferences() {
    try {
        const data = { invite: urlIncludes('invite'), ...getCurrentPreferences() }

        console.log(JSON.stringify(data));

        const res = await fetch(APIUrl + '/student/register', {
            method: 'POST',
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

            default:
                console.warn(`Nieoczekiwany status: ${status}`, resData);
                showErrorColors(feedback)
                setTextContentByElement('feedbackSpan', resData.detail || `Nieoczekiwany status: ${status}`)
                break;
        }
    } catch (err) {
        console.error('Błąd sieci lub inny problem:', err);
        setTextContentByElement('feedbackSpan', `Błąd sieci lub inny problem: ${err}`)
        showErrorColors(feedback)
    }
}


// EVENT LISTENERY

document.addEventListener('DOMContentLoaded', () => {
    generujWyborGrup()

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
