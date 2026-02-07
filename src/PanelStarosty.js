import { CookieHandler } from './CookieHandler.js'
import { setDisplayByElement, setTextContentByElement, clampValues, setupDateTime, localToISO, APIUrl, updateDisplayDate, showErrorColors, showSuccesColors } from './Utils.js';

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
const submitButton = document.getElementsByClassName('generujLinkBtn');
const inputsToValidate = document.querySelectorAll('#nazwaKierunku, #rokStudiow, #stopienStudiow, #iloscGrup, #maxOsob, #KPTN, #random');
let infoGather = document.getElementById('infoGather');


document.addEventListener('DOMContentLoaded', () => {
    const startInput = document.getElementById('startTime');
    const endInput = document.getElementById('endTime');

    setupDateTime(startInput, endInput, 0, 7, 72, 7);

    infoGather = document.getElementById('infoGather');

    const displayStart = document.getElementById('displayStart');
    const displayEnd = document.getElementById('displayEnd')
    displayStart.addEventListener('click', () => {
        startInput.showPicker?.() || startInput.focus();
    });

    displayEnd.addEventListener('click', () => {
        endInput.showPicker?.() || endInput.focus();
    });

});


function reactToInputs() {
    const inputsToCheck = Array.from(inputsToValidate).filter(
        input => input.id != 'KPTN' && input.id != 'random'
    )
    const allFilled = inputsToCheck.every(input => input.value && input.value.trim() != '')

    submitButton[0].disabled = !allFilled;
}

inputsToValidate.forEach(input => {
    input.addEventListener('input', reactToInputs);
    input.addEventListener('change', reactToInputs);
});

reactToInputs();

async function generateLink(name, startsAt, endsAt, method, groupAmmount, groupLimit) {
    try {

        const data = {
            campaign: {
                title: name,
                starts_at: startsAt,
                ends_at: endsAt,
                assignment_method: method,
            },
            group_amount: groupAmmount,
            group_limit: groupLimit
        }

        const res = await fetch(APIUrl + '/admin/setup', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify(data)
        })

        const status = res.status;
        const resData = await res.json();

        switch (status) {
            case 200:
                console.log('Link został wygenerowany poprawnie');
                showSuccessColors(infoGather)
                setDisplayByElement('copyLink', 'block')
                break
            case 404:
                console.error('Błąd 404 - brak odpowiedzi')
                showErrorColors(infoGather)
                setTextContentByElement('confirmationLink', 'Błąd 404 - brak odpowiedzi')
                break
            case 422:
                console.error('Błąd 422 - niepoprawne dane:')
                console.table(resData.detail)
                showErrorColors(infoGather)
                setTextContentByElement('confirmationLink', 'Błąd 422 - niepoprawne dane:' + resData.detail)
                break
        }
    }
    catch (err) {
        console.error('Błąd sieci lub inny problem:', err);
        showErrorColors(infoGather)
        setTextContentByElement('confirmationLink', `Błąd sieci lub inny problem: ${err}`)
    }
}

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


        window.scrollTo({
            top: 0,
            left: 0,
            behavior: 'smooth'
        });

        const inputsMap = {};
        inputsToValidate.forEach(input => {
            inputsMap[input.id] = input;
        });

        const name = inputsMap['nazwaKierunku'].value.trim() + '-' + inputsMap['rokStudiow'].value + 'r' + inputsMap['stopienStudiow'].value + 'st'
        const startsAt = localToISO(document.getElementById('startTime').value)
        const endsAt = localToISO(document.getElementById('endTime').value)
        const method = inputsMap['KPTN'].checked ? 'fcfs' : 'random'
        const groupAmmount = inputsMap['iloscGrup'].value
        const groupLimit = inputsMap['maxOsob'].value

        generateLink(name, startsAt, endsAt, method, groupAmmount, groupLimit)

        document.getElementById('gridLayout').classList.add('hide')
        setDisplayByElement('infoGather', 'grid')
        setTimeout(() => {
            document.getElementById('infoGather').classList.add('show')
            console.log(document.getElementById('infoGather'));


            document.getElementById('gridLayout').style.height = '100vh'
            document.getElementById('gridLayout').style.marginTop = '0'

        }, 500)
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
