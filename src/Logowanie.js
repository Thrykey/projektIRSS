import { setDisplayByElement, setTextContentByElement, urlHasHash, urlIncludes, getTokenValue } from './Utils.js'
import { CookieHandler } from './CookieHandler.js'

const APIUrl = 'https://irss-backend.onrender.com'

// const axios = requiere('axios')

/**
 * Sprawdzanie zapisanego cookies, zmiana elementów w przypadku istnienia
 */
const cookies = new CookieHandler()


if (cookies.exists('email')) {
    setDisplayByElement('logowanie', 'none')
    setDisplayByElement('podmien', 'block')

    const strongifiedEmail = document.createElement('strong')
    strongifiedEmail.textContent = `${cookies.get('email')}`

    setDisplayByElement('informacjaCookies', 'block')
    setTextContentByElement('informacjaCookies', `W twojej sesji zapisany jest zalogowany email: `)
    document.getElementById('informacjaCookies').appendChild(strongifiedEmail)
}
else uncover()



/**
 * Funkcja zmieniająca display elementów po zaakceptowani zmiany maila, lub przekierowaniu
 */
function uncover() {
    setDisplayByElement('logowanie', 'grid')
    setDisplayByElement('informacjaCookies', 'none')
    setDisplayByElement('podmien', 'none')
}

document.getElementById('uncover').addEventListener('click', () => {
    history.pushState(null, '', '#uncover');
    uncover()
})


/**
 * Widoczność elementu jak tag to starosta -> logowanie się przez przycisk panel starosty lub link
 */
const inputFields = {
    EMAIL: false,
    INDEX: false,
    DOMENA: false,
    HASLO: undefined
}

function checkUrlParams() {
    if (urlIncludes('starosta')) {
        console.info('Renderowanie dodatkowego elementu dla starosty')

        setDisplayByElement('starostaPasswd', 'grid')
        inputFields.HASLO = false
        setTextContentByElement('zalogujStarosta', 'Zweryfikuj się jako student')

        document.getElementById('logowanie').style.gridTemplateRows = '1fr 1fr 1fr'
        document.getElementById('logowanie').style.height = '100%'
    }
    else {
        setDisplayByElement('starostaPasswd', 'none')
        setTextContentByElement('zalogujStarosta', 'Zweryfikuj się jako starosta')

        document.getElementById('logowanie').style.gridTemplateRows = '1fr 1fr'
        document.getElementById('logowanie').style.height = '70%'
    }
    if (urlHasHash('uncover')) { uncover() }
}
checkUrlParams();

if (urlHasHash('code')) localStorage.setItem('code', getTokenValue('code'))



document.getElementById('zalogujStarosta').addEventListener('click', () => {
    const url = new URL(window.location);
    const hasStarosta = url.search.includes('starosta');

    if (hasStarosta) {
        url.search = '';
        setTextContentByElement('zalogujStarosta', 'Zweryfikuj się jako starosta')
        inputFields.HASLO = undefined
    } else {
        url.search = '?starosta';
        setTextContentByElement('zalogujStarosta', 'Zweryfikuj się jako student')
        inputFields.HASLO = false
    }

    history.pushState(null, '', url);
    enableSend()
    checkUrlParams();
});



function enableSend() {
    console.log(`checking if all info is filled, current status:`)
    console.log(inputFields)
    document.getElementById('wyslijKod').disabled = !(Object.values(inputFields).every(state => state != false))
}

const validEmails = ['student.uken.krakow.pl', 'student.up.krakow.pl']

function reactToEmailChange(buttonValue) {

    if (validEmails.includes(buttonValue)) {
        document.getElementById('email').style.gridTemplateRows = 'auto 1fr auto 0px'
        inputFields.DOMENA = true
        enableSend()
        document.getElementById('email').addEventListener('transitionstart', () => {
            document.getElementById('indexInput').style.zIndex = 0
        })
    }
}

document.getElementById('ukenChoice').addEventListener('click', () => {
    setTextContentByElement('dropdownBtn', '@student.uken.krakow.pl')
    const buttonValue = document.getElementById('dropdownBtn').innerText.replace('@', '')

    reactToEmailChange(buttonValue)
})

document.getElementById('upChoice').addEventListener('click', () => {
    setTextContentByElement('dropdownBtn', '@student.up.krakow.pl')
    const buttonValue = document.getElementById('dropdownBtn').innerText.replace('@', '')

    reactToEmailChange(buttonValue)
})

function handleDynamicValues() {
    let innerValue = document.getElementById('mail').value.replace(' ', '')
    //jakub.bieniek@student.up.krakow.pl
    document.getElementById('indexInput').value = ''
    inputFields.INDEX = false
    if (innerValue.length >= 3) {

        const emailValue = innerValue.split('@')

        if (validEmails.includes(emailValue[1])) {
            setTextContentByElement('dropdownBtn', `@${innerValue.split('@')[1]}`)
            reactToEmailChange(innerValue.split('@')[1])
            document.getElementById('mail').value = emailValue[0]
        }

        innerValue = document.getElementById('mail').value.replace(' ', '')
        const slicedValue = innerValue.slice(1)

        inputFields.EMAIL = true
        if (/^\d+$/.test(slicedValue)) {
            document.getElementById('indexInput').value = slicedValue
            document.getElementById('indexInput').value.length >= 6 ? inputFields.INDEX = true : inputFields.INDEX = false
            enableSend()
            return
        }
        document.getElementById('email').style.gridTemplateRows = 'auto 1fr auto 45px'
        document.getElementById('email').addEventListener('transitionend', () => {
            document.getElementById('indexInput').style.zIndex = 3
        })

    }
    else {
        document.getElementById('email').style.gridTemplateRows = 'auto 1fr auto 0px'
        inputFields.EMAIL = false
        document.getElementById('email').addEventListener('transitionstart', () => {
            document.getElementById('indexInput').style.zIndex = 0
        })
        enableSend()
    }
}

document.getElementById('indexInput').addEventListener('input', (el) => {
    el.target.value.length >= 6 ? inputFields.INDEX = true : inputFields.INDEX = false
    enableSend()
})

document.getElementById('mail').addEventListener('change', handleDynamicValues)
document.getElementById('mail').addEventListener('input', handleDynamicValues)

/**
 * Zmiana typu przy przycisku sprawdź
 */
document.getElementById('sprawdzPasswd').addEventListener('click', () => {
    const passField = document.getElementById('passwd');
    passField.type = passField.type == 'password' ? 'text' : 'password';
})

document.getElementById('passwd').addEventListener('input', (e) => {
    if (e.target.value.length >= 1) inputFields.HASLO = true
    else inputFields.HASLO = false
    enableSend()
})


async function sendVerReq(userEmail, indexValue) {
    const code = localStorage.getItem('code')

    if (!code) {
        alert('Nie masz zaproszenia.')
        return
    }

    const data = { 'email': userEmail, 'invite-code': code }

    const res = await fetch(APIUrl + '/auth/register-with-invite', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
            // 'Authorization': 'Barer ' + token
        },
        body: JSON.stringify(data)
    }).then(
        res => res.json()
    )
    if (res.ok) {
        console.log('Dane poprawne, wysłany maila')
        setTextContentByElement('potwierdzenieSpan', `Kod został wysłany na: ${userEmail}, nr indexu: ${indexValue}`)
        document.documentElement.style.setProperty('--lineColorValidation', 'rgb(15, 250, 132)')
        document.documentElement.style.setProperty('--lineColorValidationFade', 'rgba(15, 250, 93, 0)')
        document.getElementById('prosbaKodu').style.background = 'linear-gradient(45deg, rgba(15, 250, 132, 0.2) 0%, rgba(15, 250, 93, 0.2) 100%)'
    }
    if (!res.ok) {
        console.log(":(");

    }
}


const wyslijBtn = document.getElementById('wyslijKod');
const indexInput = document.getElementById('indexInput');
const mailInput = document.getElementById('mail');
const dropdownBtn = document.getElementById('dropdownBtn');

wyslijBtn.addEventListener('click', () => {
    let hasError = false;

    const indexValue = indexInput.value.trim();
    let indexTooltip = indexInput.parentElement.querySelector('.dynamicErrorTooltip');
    if (!indexTooltip) {
        indexTooltip = document.createElement('div');
        indexTooltip.className = 'dynamicErrorTooltip';
        indexTooltip.textContent = 'Pole może zawierać tylko cyfry!';
        indexInput.parentElement.appendChild(indexTooltip);
    }
    indexTooltip.style.display = 'none';

    if (!indexValue || !/^\d+$/.test(indexValue)) {
        indexTooltip.style.display = 'block';
        hasError = true;
        setTimeout(() => indexTooltip.style.display = 'none', 3000);
    }

    const mailValue = mailInput.value.trim();
    const domainValue = dropdownBtn.textContent.trim();
    let mailTooltip = dropdownBtn.parentElement.querySelector('.dynamicErrorTooltip');
    if (!mailTooltip) {
        mailTooltip = document.createElement('div');
        mailTooltip.className = 'dynamicErrorTooltip';
        mailInput.parentElement.appendChild(mailTooltip);
    }

    mailTooltip.style.display = 'none';

    if (hasError) {
        document.documentElement.style.setProperty('--lineColorValidation', 'rgb(250, 6, 6)')
        document.documentElement.style.setProperty('--lineColorValidationFade', 'rgba(242, 44, 44, 0)')
        document
            .querySelectorAll('.leftLine, .rightLine')
            .forEach(el => {
                el.classList.add('active');
            });
        setTimeout(() => document
            .querySelectorAll('.leftLine, .rightLine')
            .forEach(el => {
                el.classList.remove('active');
            }), 3000)
        return;
    }

    const userEmail = (mailValue + domainValue).toLowerCase();
    setDisplayByElement('logowanie', 'none')
    setDisplayByElement('prosbaKodu', 'grid')
    document.documentElement.style.setProperty('--lineColorValidation', 'rgba(15, 133, 250, 1)')
    document.documentElement.style.setProperty('--lineColorValidationFade', 'rgba(15, 231, 250, 0)')
    document
        .querySelectorAll('.leftLine, .rightLine')
        .forEach(el => {
            el.classList.add('active');
        });
    sendVerReq(userEmail, indexValue)

});

console.warn('Jak czegoś tutaj szukasz, to pewnie znajdziesz. \
    Jak uważasz że umiesz napisać lepiej lub chcesz nam pomóc w rozwinięciu strony, \
    zgłoś się do SKNI.')