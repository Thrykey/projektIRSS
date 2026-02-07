import { setDisplayByElement, setTextContentByElement, createSpan, urlHasHash, urlIncludes, getTokenValue, removeQueryParam } from './Utils.js';
import { DragDropManager } from './DragNdropMenager.js';
import { CookieHandler } from './CookieHandler.js';


const cookies = new CookieHandler();

/* ---------- UTIL FUNCTIONS ---------- */

function createGroupDiv(number) {
    const div = document.createElement('div');
    div.className = 'wyborGrupyLabolatoryjnej';
    div.id = `grupaL${number}`;

    const span = createSpan(`L${number}`, null, 'nrGrupySpan');
    div.appendChild(span);

    return div;
}

/* ---------- GENERATE GROUPS ---------- */

export function generujWyborGrup() {
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

/* ---------- COOKIE HANDLING ---------- */

// function checkCookies() {
//     if (cookies.exists('email')) {
//         setTextContentByElement('status', `W twojej sesji zapisany jest email: ${cookies.get('email')}`)
//         setTextContentByElement('zmienEmail', 'zmień wskazany email')
//     } else {
//         setTextContentByElement('status', `W twojej sesji nie ma zapisanego maila`)
//         setTextContentByElement('zmienEmail', 'potwierdz email')
//     }
// }

/* ---------- GET DATA FUNCTIONS ---------- */

// function getPreferences() {
//     const container = document.querySelector('.wybor');
//     if (!container) return [];

//     const groupNumbers = [];

//     for (const child of container.children) {
//         if (child.id && child.id.startsWith('grupaL')) {
//             const num = parseInt(child.id.replace('grupaL', ''), 10);
//             if (!isNaN(num)) groupNumbers.push(num);
//         }
//     }
//     return groupNumbers;
// }

// function getToken() {
//     const query = window.location.search.slice(1);
//     const match = query.match(/-(\d+)G-(.+)$/i);
//     return match && match[2] ? match[2] : null;
// }

if (urlIncludes('access_token')) {
    localStorage.setItem('access_token', urlIncludes('access_token'))
    console.log('Zapisano JWT pomyślnie, usuwanie z URL');

    removeQueryParam('access_token')
}
// localStorage.removeItem('token')
function reactToJWT() {
    if (!localStorage.getItem('access_token')) {
        window.location.href = (urlIncludes('code') != null) ? './pages/Logowanie.html?code=' + urlIncludes('code') : './pages/Logowanie.html'
        return
    }
}
// reactToJWT()




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


const APIUrl = 'https://irss-backend.onrender.com'

// async function getMe() {
//   const cached = sessionStorage.getItem("me")
//   if (cached) return JSON.parse(cached)

//   const me = await fetch(APIUrl + "/auth/me", {
//     credentials: "include"
//   }).then(res => res.json())

//   sessionStorage.setItem("me", JSON.stringify(me))
//   return me
// }

async function sendPreferences() {
    try {
        const token = localStorage.getItem('access_token')
        if (!token) {
            console.warn('Brak tokenu!');
            return
        }

        const data = getCurrentPreferences()
        const res = await fetch(APIUrl + '/student/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Barer ' + token
            },
            // credentials: 'include',
            body: JSON.stringify(data)
        })


        const status = response.status;
        const resData = await res.json();

        switch (status) {
            case 200:
                console.log('Request wysłany poprawnie');

                document.documentElement.style.setProperty('--lineColorValidation', 'rgba(15, 133, 250, 1)');
                document.documentElement.style.setProperty('--lineColorValidationFade', 'rgba(15, 231, 250, 0)');
                document.querySelectorAll('.leftLine, .rightLine').forEach(el => el.classList.add('active'));

                document.getElementById('panelRejestracji').classList.add('hide');
                setTimeout(() => {
                    document.getElementById('feedbackWyslania').classList.add('show');
                }, 1000);
                break;

            case 422:
                console.error('Błąd 422 - niepoprawne dane:');
                console.table(resData.detail);
                break;

            default:
                console.warn(`Nieoczekiwany status: ${status}`, resData);
        }
    } catch (err) {
        console.error('Błąd sieci lub inny problem:', err);
    }
}



/* ---------- EVENT LISTENERS ---------- */

document.addEventListener('DOMContentLoaded', () => {
    generujWyborGrup();
    new DragDropManager('.wybor', '.wyborGrupyLabolatoryjnej');
    checkCookies();
    document.getElementById('wniosekBtn').disabled = cookies.exists('email') ? false : true
});

document.getElementById('PanelStarostyBtn').addEventListener('click', () => {
    window.location.href = './pages/Logowanie.html?starosta=true';
});

document.getElementById('zmienEmail').addEventListener('click', () => {
    window.location.href = './pages/Logowanie.html?uncover=true';
});

document.getElementById('setCookieBtn').addEventListener('click', () => {
    cookies.set('email', 'example@test.com', 1);
    checkCookies();
});

document.getElementById('removeCookieBtn').addEventListener('click', () => {
    cookies.delete('email');
    checkCookies();
});

document.getElementById('wniosekBtn').addEventListener('click', () => {
    sendPreferences()

    // console.log('email z cookies:', cookies.get('email'));
    // console.log('lista preferencji:', getPreferences());
    // console.log('token zapisów:', getToken());
});

document.getElementsByClassName('adnotacjeSpan')[0].addEventListener('click', () => {
    window.open('./pages/FAQ.html', '_blank');
})

console.warn(
    'Jak czegoś tutaj szukasz, to pewnie znajdziesz. ' +
    'Jak uważasz że umiesz napisać lepiej lub chcesz nam pomóc w rozwinięciu strony, ' +
    'zgłoś się do SKNI.'
);
