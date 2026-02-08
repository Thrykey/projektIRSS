import { setDisplayByElement, setTextContentByElement, urlIncludes, appendQueryParam, removeQueryParam, APIUrl, showErrorColors, showSuccesColors } from './Utils.js'
import { CookieHandler } from './CookieHandler.js'

// const me = getMe()

const indexInput = document.getElementById('indexInput');
const mailInput = document.getElementById('mail');
const mailDomElement = document.getElementById('email');
const wyslijBtn = document.getElementById('wyslijKod');
const dropdownBtn = document.getElementById('dropdownBtn');

// dla pewnosci, ze nie jest null
let prosbaKodu = document.getElementById("prosbaKodu");

document.addEventListener('DOMContentLoaded', () => {
    prosbaKodu = document.getElementById("prosbaKodu");
});


const validEmails = ['student.uken.krakow.pl', 'student.up.krakow.pl']

const inputFields = {
    EMAIL: false,
    INDEX: false,
    DOMENA: false,
    RODO: false,
    HASLO: undefined
}
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



function checkUrlParams() {
    if (urlIncludes('user') == 'starosta') {
        console.info('Renderowanie dodatkowego elementu dla starosty')

        setDisplayByElement('starostaPasswd', 'grid')

        inputFields.HASLO = document.getElementById('passwd').value ? true : false

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
    if (urlIncludes('user') == 'starosta') {
        removeQueryParam('user')
        setTextContentByElement('zalogujStarosta', 'Zweryfikuj się jako starosta')
        inputFields.HASLO = undefined
    } else {
        appendQueryParam('user', 'starosta')
        setTextContentByElement('zalogujStarosta', 'Zweryfikuj się jako student')
        inputFields.HASLO = document.getElementById('passwd').value ? true : false
    }

    enableSend()
    checkUrlParams();
});



function enableSend() {
    document.getElementById('wyslijKod').disabled = !(Object.values(inputFields).every(state => state != false))
}


function reactToEmailChange(buttonValue) {

    if (validEmails.includes(buttonValue)) {
        mailInput.style.gridTemplateRows = validEmails[0].includes(buttonValue) ? 'auto 1fr auto 0px' : 'auto 1fr auto 45px'
        inputFields.DOMENA = true
        enableSend()
        mailInput.addEventListener('transitionstart', () => {
            indexInput.style.zIndex = 0
        })
    }
}

document.getElementById('RODO').addEventListener('change', (e) => {
    inputFields.RODO = e.target.checked
    enableSend()
})

document.getElementById('ukenChoice').addEventListener('click', () => {
    setTextContentByElement('dropdownBtn', '@student.uken.krakow.pl')
    reactToEmailChange(
        document.getElementById('dropdownBtn').innerText.replace('@', '')
    )
})

document.getElementById('upChoice').addEventListener('click', () => {
    setTextContentByElement('dropdownBtn', '@student.up.krakow.pl')
    reactToEmailChange(
        document.getElementById('dropdownBtn').innerText.replace('@', '')
    )
})

function handleDynamicValues() {
    let innerValue = mailInput.value.replace(' ', '')

    indexInput.value = ''
    inputFields.INDEX = false

    if (innerValue.length >= 3) {

        const emailValue = innerValue.split('@')

        if (validEmails.includes(emailValue[1])) {
            setTextContentByElement('dropdownBtn', `@${innerValue.split('@')[1]}`)
            reactToEmailChange(innerValue.split('@')[1])
            mailInput.value = emailValue[0]
        }

        innerValue = mailInput.value.replace(' ', '')
        const slicedValue = innerValue.slice(1)

        inputFields.EMAIL = true
        if (/^\d+$/.test(slicedValue)) {
            indexInput.value = slicedValue
            indexInput.value.length >= 6 ? inputFields.INDEX = true : inputFields.INDEX = false
            enableSend()
            return
        }
        mailDomElement.style.gridTemplateRows = 'auto 1fr auto 45px'
        mailDomElement.addEventListener('transitionend', () => {
            indexInput.style.zIndex = 3
        })

    }
    else {
        mailDomElement.style.gridTemplateRows = 'auto 1fr auto 0px'
        inputFields.EMAIL = false
        mailDomElement.addEventListener('transitionstart', () => {
            indexInput.style.zIndex = 0
        })
        enableSend()
    }
}

indexInput.addEventListener('input', (el) => {
    el.target.value.length >= 6 ? inputFields.INDEX = true : inputFields.INDEX = false
    enableSend()
})

mailInput.addEventListener('change', handleDynamicValues)
mailInput.addEventListener('input', handleDynamicValues)


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
    try {
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
                sessionStorage.setItem('email', userEmail)
                setTextContentByElement('potwierdzenieSpan', `Kod został wysłany na: ${userEmail}, nr indexu: ${indexValue}`)
                showSuccesColors(prosbaKodu)
                break
            case 404:
                console.error('Błąd 404 - brak odpowiedzi')
                showErrorColors(prosbaKodu)
                setTextContentByElement('potwierdzenieSpan', 'Błąd 404 - brak odpowiedzi')
                break
            case 422:
                console.error('Błąd 422 - niepoprawne dane:')
                console.table(resData.detail)
                showErrorColors(prosbaKodu)
                setTextContentByElement('potwierdzenieSpan', 'Błąd 422 - niepoprawne dane:')
                break
        }
    }
    catch (err) {
        console.error('Błąd sieci lub inny problem:', err);
        showErrorColors(prosbaKodu)
        setTextContentByElement('potwierdzenieSpan', `Błąd sieci lub inny problem: ${err}`)
    }

}



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
        showErrorColors(prosbaKodu)
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