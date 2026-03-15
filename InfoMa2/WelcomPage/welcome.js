import { supabase } from '/supabase.js'


const userId = localStorage.getItem('userId')
if (!userId) {
    window.location.href = '/InfoMa2/Login/login.html'
}

const firstName = localStorage.getItem('firstName')
document.getElementById('firstName').textContent = 'Hello, ' + firstName + '!'


function updateDateTime() {
    const now = new Date()
    const date = now.toLocaleDateString('en-PH', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    })
    const time = now.toLocaleTimeString('en-PH', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    })
    document.getElementById('dateTime').textContent = date + ' | ' + time
}

updateDateTime()
setInterval(updateDateTime, 1000)

document.getElementById('logoutBtn').addEventListener('click', function() {
    localStorage.clear()
    window.location.href = '/Login/login.html'
})

document.getElementById('submitReason').addEventListener('click', async function() {
    const reason = document.getElementById('visitReason').value
    const userId = localStorage.getItem('userId')

    const {data, error } = await supabase
        .from('visits')
        .insert({
            user_id: userId,
            reason: reason,
            time_in: new Date().toISOString(),
            date: new Date().toLocaleDateString()
        })
        .select()

    if (error) {
        console.log('Error saving visit:', error)
        return
    }

    localStorage.setItem('visitId', data[0].id)
    window.location.href = '/dboard/dboard.html'
})
