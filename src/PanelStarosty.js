import { CookieHandler } from './CookieHandler.js'
import {
    setDisplayByElement, setTextContentByElement, clampValues, setupDateTime, localToISO,
    APIUrl, updateDisplayDate, showErrorColors, showSuccesColors, getMe
} from './Utils.js';

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
const gridLayout = document.getElementById('gridLayout')
const wybierzAkcje = document.getElementById('wybierzAkcje')
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

document.getElementById('nowaRejestracja').addEventListener('click', () => {
    wybierzAkcje.classList.remove('show')
    wybierzAkcje.classList.add('hide')
    setTimeout(() => {
        gridLayout.classList.remove('hide')
        gridLayout.classList.add('show')
        if (window.innerWidth <= 1100) {
            document.getElementById('gridLayout').style.height = '120vh'
            document.getElementById('gridLayout').style.marginTop = '25vh'
        }
        document.querySelectorAll('.powrot').forEach(d => {
            d.classList.remove('hide')
            d.classList.add('show')
        })
    }, 500);

})

document.querySelectorAll('.powrot button').forEach(button => {

    button.addEventListener('click', (e) => {
        document.getElementsByClassName('grid-container')[0].classList.remove('ovflowHidden')
        e.target.parentElement.classList.remove('show')
        e.target.parentElement.classList.add('hide')

        gridLayout.classList.remove('show')
        gridLayout.classList.add('hide')
        document.getElementById('aktywneKampanie').classList.remove('show')
        document.getElementById('aktywneKampanie').classList.add('hide')
        setTimeout(() => {
            if (window.innerWidth <= 1100) {
                document.getElementById('gridLayout').style.height = '100vh'
                document.getElementById('gridLayout').style.marginTop = '0vh'
            }
            wybierzAkcje.classList.remove('hide')
            wybierzAkcje.classList.add('show')
        }, 500);
    })
})

async function loadCampaigns() {
    const container = document.getElementById('campaignsContainer');

    try {
        const idResponse = sessionStorage.getItem('me') ? sessionStorage.getItem('me') : await getMe();
        const campaignIds = await idResponse.json();

        for (const id of campaignIds) {
            const detailResponse = await fetch(APIUrl + `/admin/campaigns/${id}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include'
            });
            const campaign = await detailResponse.json();

            const now = new Date();
            const endsAt = new Date(campaign.ends_at);
            let timeLeftText;
            if (endsAt > now) {
                const diffMs = endsAt - now;
                const diffHoursTotal = Math.floor(diffMs / (1000 * 60 * 60));
                const diffMinutes = Math.floor((diffMs / (1000 * 60)) % 60);

                if (diffHoursTotal >= 1) {
                    timeLeftText = `${diffHoursTotal}h`;
                } else {
                    timeLeftText = `${diffMinutes}m`;
                }
            } else {
                timeLeftText = 'Kampania zakończona';
            }

            const card = document.createElement('div');
            card.classList.add('campaignCard');
            card.classList.add(campaign.is_active ? 'active' : 'inactive');

            const titleEl = document.createElement('h3');
            titleEl.textContent = campaign.title;

            const registeredEl = document.createElement('p');
            registeredEl.textContent = `Zapisanych studentów: ${campaign.total_registered_students}`;

            const timeEl = document.createElement('p');
            timeEl.textContent = `Pozostało czasu: ${timeLeftText}`;

            const footer = document.createElement('div');
            footer.classList.add('cardFooter');

            const btn = document.createElement('button');
            btn.textContent = campaign.is_active ? 'Resolve' : 'Download';
            btn.addEventListener('click', async () => {
                const url = campaign.is_active
                    ? `/admin/campaigns/${campaign.id}/resolve`
                    : `/admin/campaigns/${campaign.id}/download`;

                try {
                    const response = await fetch(APIUrl + url, {
                        method: 'GET',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        credentials: 'include'
                    });
                    if (!response.ok) throw new Error('Błąd w API');

                    if (campaign.is_active) {
                        campaign.is_active = false;
                        card.classList.remove('active');
                        card.classList.add('inactive');
                        btn.textContent = 'Download';
                    }

                    if (!campaign.is_active) {
                        const blob = await response.blob();
                        const downloadUrl = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = downloadUrl;
                        a.download = `${campaign.title}`;
                        a.click();
                        URL.revokeObjectURL(downloadUrl);
                    }

                } catch (err) {
                    console.error('Błąd przy wywołaniu akcji kampanii:', err);
                }
            });

            footer.appendChild(btn);
            card.appendChild(titleEl);
            card.appendChild(registeredEl);
            card.appendChild(timeEl);
            card.appendChild(footer);

            container.appendChild(card);
        }
    } catch (error) {
        console.error('Błąd ładowania kampanii:', error);
    }
}

function createDummyCard({ title, totalRegistered = 0, hoursLeft = 3, resolved = false }) {
    const container = document.getElementById('campaignsContainer');

    // obliczenie czasu pozostałego
    let timeLeftText;
    if (hoursLeft >= 1) {
        timeLeftText = `${hoursLeft}h`;
    } else {
        timeLeftText = `${hoursLeft * 60}m`; // jeśli mniej niż godzina
    }

    // stworzenie elementów karty
    const card = document.createElement('div');
    card.classList.add('campaignCard');
    card.classList.add(resolved ? 'inactive' : 'active');

    const titleEl = document.createElement('h3');
    titleEl.textContent = title;

    const registeredEl = document.createElement('p');
    registeredEl.textContent = `Zapisanych studentów: ${totalRegistered}`;

    const timeEl = document.createElement('p');
    timeEl.textContent = `Pozostało czasu: ${timeLeftText}`;

    const footer = document.createElement('div');
    footer.classList.add('cardFooter');

    const btn = document.createElement('button');
    btn.textContent = resolved ? 'Download' : 'Resolve';
    btn.addEventListener('click', () => {
        alert(`Kliknięto przycisk kampanii: ${title} (resolved: ${resolved})`);
    });

    footer.appendChild(btn);
    card.appendChild(titleEl);
    card.appendChild(registeredEl);
    card.appendChild(timeEl);
    card.appendChild(footer);

    container.appendChild(card);
}




document.getElementById('sprawdzRejestracje').addEventListener('click', () => {
    wybierzAkcje.classList.remove('show')
    wybierzAkcje.classList.add('hide')

    document.getElementById('campaignsContainer').textContent = ''

    createDummyCard({
        title: 'Kampania 1',
        totalRegistered: 12,
        hoursLeft: 5,
        resolved: false
    });

    createDummyCard({
        title: 'Kampania 2',
        totalRegistered: 20,
        hoursLeft: 0,
        resolved: true
    });
    createDummyCard({
        title: 'Kampania 2',
        totalRegistered: 20,
        hoursLeft: 0,
        resolved: false
    });
    createDummyCard({
        title: 'Kampania 1',
        totalRegistered: 12,
        hoursLeft: 5,
        resolved: false
    });

    // loadCampaigns();
    setTimeout(() => {
        document.getElementsByClassName('grid-container')[0].classList.add('ovflowHidden')
        document.getElementById('aktywneKampanie').classList.remove('hide')
        document.getElementById('aktywneKampanie').classList.add('show')
        document.querySelectorAll('.powrot').forEach(d => {

            d.classList.remove('hide')
            d.classList.add('show')
        })
    }, 500);
})

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

        const res = await fetch(APIUrl + '/admin/campaigns/setup', {
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


            document.getElementById('gridLayout').style.height = '100vh'
            document.getElementById('gridLayout').style.marginTop = '0'

        }, 500)
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
