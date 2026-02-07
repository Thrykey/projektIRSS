import { setDisplayByElement, setTextContentByElement, urlIncludes, getTokenValue, appendQueryParam, removeQueryParam, getMe, APIUrl } from './Utils.js'
import { CookieHandler } from './CookieHandler.js'

const me = getMe()

/**
 * Sprawdzanie zapisanego cookies, zmiana elementów w przypadku istnienia
 */

// if (localStorage.getItem('email')) {
//     setDisplayByElement('logowanie', 'none')
//     setDisplayByElement('podmien', 'block')

//     const strongifiedEmail = document.createElement('strong')
//     strongifiedEmail.textContent = `${localStorage.getItem('email')}`

//     setDisplayByElement('informacjaCookies', 'block')
//     setTextContentByElement('informacjaCookies', `W twojej sesji zapisany jest zalogowany email: `)
//     document.getElementById('informacjaCookies').appendChild(strongifiedEmail)
// }
// else uncover()



// if (me) {
//     const meStr = JSON.parse(me)
//     if (meStr.user == 'starosta' && urlIncludes('dest') == 'panel') window.location.href = './pages/PanelStarosty.html'
// }


/**
 * Funkcja zmieniająca display elementów po zaakceptowani zmiany maila, lub przekierowaniu
 */
function uncover() {
    document.getElementById('logowanie').classList.remove('hide');
    setDisplayByElement('logowanie', 'grid')
    document.getElementById('logowanie').classList.add('show');
    setDisplayByElement('informacjaCookies', 'none')
    setDisplayByElement('podmien', 'none')
}

// document.getElementById('uncover').addEventListener('click', () => {
//     removeQueryParam('uncover')
//     uncover()
// })


const inputFields = {
    EMAIL: false,
    INDEX: false,
    DOMENA: false,
    HASLO: undefined
}

function checkUrlParams() {
    if (urlIncludes('user') == 'starosta') {
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
    if (urlIncludes('uncover')) { uncover() }
}
checkUrlParams();

if (urlIncludes('code')) sessionStorage.setItem('code', urlIncludes('code'))
console.log(urlIncludes('code'));


document.getElementById('zalogujStarosta').addEventListener('click', () => {
    const hasStarosta = urlIncludes('user');

    if (hasStarosta == 'starosta') {
        removeQueryParam('user')
        setTextContentByElement('zalogujStarosta', 'Zweryfikuj się jako starosta')
        inputFields.HASLO = undefined
    } else {
        appendQueryParam('user', 'starosta')

        setTextContentByElement('zalogujStarosta', 'Zweryfikuj się jako student')
        inputFields.HASLO = false
    }

    enableSend()
    checkUrlParams();
});



function enableSend() {
    document.getElementById('wyslijKod').disabled = !(Object.values(inputFields).every(state => state != false))
}

const validEmails = ['student.uken.krakow.pl', 'student.up.krakow.pl']

function reactToEmailChange(buttonValue) {

    if (validEmails.includes(buttonValue)) {

        document.getElementById('email').style.gridTemplateRows = validEmails[0].includes(buttonValue) ? 'auto 1fr auto 0px' : 'auto 1fr auto 45px'
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

function showErrorColors() {
    document.querySelectorAll('.leftLine, .rightLine').forEach(el => {
        el.querySelector('.errorLayer').style.opacity = '1';
        el.querySelector('.successLayer').style.opacity = '0';
    })
    setTimeout(() => document.querySelectorAll('.leftLine, .rightLine').forEach(el => {
        el.querySelector('.errorLayer').style.opacity = '0';
        el.querySelector('.successLayer').style.opacity = '0';
    }), 3000)
}

function showSuccesColors() {
    document.getElementById('prosbaKodu').classList.add('success')
    document.querySelectorAll('.leftLine, .rightLine')
        .forEach(el => {
            el.classList.remove('active')
            el.querySelector('.successLayer').style.opacity = '1'
        })
}

async function sendVerReq(userEmail, indexValue) {
    const code = sessionStorage.getItem('code')

    const passwd = document.getElementById('passwd').value

    const data = {
        email: userEmail.toString(),
        invite_code: passwd ? passwd.toString() : code.toString()
    }

    const res = await fetch(APIUrl + '/auth/register-with-invite', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
            // 'Authorization': 'Barer ' + token
        },
        body: JSON.stringify(data)
    })

    const status = res.status;
    const resData = await res.json();


    switch (status) {
        case 200:
            console.log('Dane poprawne, wysłany maila')
            localStorage.setItem('email', userEmail)
            setTextContentByElement('potwierdzenieSpan', `Kod został wysłany na: ${userEmail}, nr indexu: ${indexValue}`)
            showSuccesColors()
            break
        case 404:
            console.error('Błąd 404 - brak odpowiedzi')
            showErrorColors()
            break
        case 422:
            console.error('Błąd 422 - niepoprawne dane:')
            console.table(resData.detail)
            showErrorColors()
            break
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
        document.querySelectorAll('.leftLine, .rightLine').forEach(el => {
            el.querySelector('.errorLayer').style.opacity = '1';
            el.querySelector('.successLayer').style.opacity = '0';
        })
        setTimeout(() => document.querySelectorAll('.leftLine, .rightLine').forEach(el => {
            el.querySelector('.errorLayer').style.opacity = '0';
            el.querySelector('.successLayer').style.opacity = '0';
        }), 3000)
        return;
    }

    const userEmail = (mailValue + domainValue).toLowerCase();
    document.getElementById('logowanie').classList.remove('show');
    document.getElementById('logowanie').classList.add('hide');
    document.getElementById('prosbaKodu').classList.add('show');
    document
        .querySelectorAll('.leftLine, .rightLine')
        .forEach(el => {
            el.classList.add('active')
        })
    sendVerReq(userEmail, indexValue)

});

console.warn('Jak czegoś tutaj szukasz, to pewnie znajdziesz. \
    Jak uważasz że umiesz napisać lepiej lub chcesz nam pomóc w rozwinięciu strony, \
    zgłoś się do SKNI.')