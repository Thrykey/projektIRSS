const el = document.getElementById('informations')

let isDown = false
let startY, scrollTop

el.addEventListener('mousedown', (e) => {
    isDown = true
    el.classList.add('dragging')
    startY = e.pageY - el.offsetTop
    scrollTop = el.scrollTop
})

el.addEventListener('mouseleave', () => {
    isDown = false
    el.classList.remove('dragging')
})

el.addEventListener('mouseup', () => {
    isDown = false
    el.classList.remove('dragging')
})

el.addEventListener('mousemove', (e) => {
    if (!isDown) return
    e.preventDefault()

    const y = e.pageY - el.offsetTop
    const walk = (y - startY) * 1.2 // speed
    el.scrollTop = scrollTop - walk
})
