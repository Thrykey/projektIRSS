import { CookieHandler } from './CookieHandler.js'
import { setDisplayByElement, setTextContentByElement, clampValues } from './Utils.js';

// Ustawianie ograniczeń dla pól rokStudiow i stopienStudiow
const rokStudiowInput = document.getElementsByClassName('rokStudiow');

rokStudiowInput[0].addEventListener('input', () => clampValues(rokStudiowInput[0], 1, 5));
rokStudiowInput[0].addEventListener('change', () => clampValues(rokStudiowInput[0], 1, 5));
rokStudiowInput[0].addEventListener('blur', () => clampValues(rokStudiowInput[0], 1, 5));

const stopienStudiowInput = document.getElementsByClassName('stopienStudiow');

stopienStudiowInput[0].addEventListener('input', () => clampValues(stopienStudiowInput[0], 1, 2));
stopienStudiowInput[0].addEventListener('change', () => clampValues(stopienStudiowInput[0], 1, 2));
stopienStudiowInput[0].addEventListener('blur', () => clampValues(stopienStudiowInput[0], 1, 2));

const liczbaGrupInput = document.getElementsByClassName('iloscGrup');

liczbaGrupInput[0].addEventListener('input', () => clampValues(liczbaGrupInput[0], 1, 10));
liczbaGrupInput[0].addEventListener('change', () => clampValues(liczbaGrupInput[0], 1, 10));
liczbaGrupInput[0].addEventListener('blur', () => clampValues(liczbaGrupInput[0], 1, 10));

const maxLiczbaOsobNaGrupe = document.getElementsByClassName('maxOsob');

maxLiczbaOsobNaGrupe[0].addEventListener('input', () => clampValues(maxLiczbaOsobNaGrupe[0], 1, 30));
maxLiczbaOsobNaGrupe[0].addEventListener('change', () => clampValues(maxLiczbaOsobNaGrupe[0], 1, 30));
maxLiczbaOsobNaGrupe[0].addEventListener('blur', () => clampValues(maxLiczbaOsobNaGrupe[0], 1, 30));



const cookies = new CookieHandler()

function changeAvailability(val) {
    document.getElementById('nazwaKierunku').disabled = val
    document.getElementById('rokStudiow').disabled = val
    document.getElementById('stopienStudiow').disabled = val
    document.getElementById('iloscGrup').disabled = val
    document.getElementById('maxOsob').disabled = val
    document.getElementById('KPTN').disabled = val
    document.getElementById('random').disabled = val
    document.getElementsByClassName('generujLinkBtn')[0].disabled = val
}


function checkCookies() {
    if (cookies.exists('email')) {
        setTextContentByElement('status', `W twojej sesji zapisany jest email: ${cookies.get('email')}`)
        changeAvailability(false)
        setTextContentByElement('zalogujSieStatus', 'Zmień email')
    } else {
        setTextContentByElement('status', `W twojej sesji nie ma zapisanego maila, zaloguj się aby kontynuować`)
        changeAvailability(true)
        setTextContentByElement('zalogujSieStatus', 'Zaloguj się')
    }
}

document.getElementById('zalogujSieStatus').addEventListener('click', () => {
    window.location.href = './Logowanie.html?starosta#uncover';
})

document.addEventListener('DOMContentLoaded', () => {
    checkCookies();
});

const submitButton = document.getElementsByClassName('generujLinkBtn');

const inputsToValidate = document.querySelectorAll('#nazwaKierunku, #rokStudiow, #stopienStudiow, #iloscGrup, #maxOsob, #KPTN, #random');

submitButton[0].addEventListener('click', (e) => {
    let hasError = false;

    inputsToValidate.forEach(input => {
        if (input.disabled) return;

        let isEmpty = false;
        if (input.type === 'radio') {
            const radios = document.querySelectorAll(`input[name="${input.name}"]`);
            isEmpty = !Array.from(radios).some(r => r.checked);
        } else {
            isEmpty = !input.value;
        }

        if (isEmpty) {
            hasError = true;

            let tooltip = input.parentElement.querySelector('.dynamicErrorTooltip');
            if (!tooltip) {
                tooltip = document.createElement('div');
                tooltip.className = 'dynamicErrorTooltip';
                tooltip.textContent = 'To pole nie może być puste!';
                input.parentElement.appendChild(tooltip);
            }

            tooltip.style.display = 'block';

            setTimeout(() => {
                tooltip.style.display = 'none';
            }, 3000);
        }
    });

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
        e.preventDefault();
    }
    else {
        document.documentElement.style.setProperty('--lineColorValidation', 'rgba(15, 133, 250, 1)')
        document.documentElement.style.setProperty('--lineColorValidationFade', 'rgba(15, 231, 250, 0)')
        document
            .querySelectorAll('.leftLine, .rightLine')
            .forEach(el => {
                el.classList.add('active');
            });
        // setDisplayByElement('gridLayout', 'none')
        document.getElementById('gridLayout').classList.add('hide')
        setDisplayByElement('infoGather', 'grid')
        setTimeout(() => {
            document.getElementById('infoGather').classList.add('show')

        }, 1000)
        inputsToValidate.forEach(el => {
            console.log(el.name + ': ' + el.value.trim())
        })
    }
});
document.getElementById('copyLink').addEventListener('click', async () => {
    const text = document.getElementById('copyLink').textContent.trim()

    try {
        await navigator.clipboard.writeText(text)
        document.getElementById('copyLink').textContent = 'Skopiowano do schowka!'
        setTimeout(() => {
            document.getElementById('copyLink').textContent = text
        }, 1500);
    } catch {
        const input = document.createElement('input')
        input.value = text
        document.body.appendChild(input)
        input.select()
        document.body.removeChild(input)
    }
})
