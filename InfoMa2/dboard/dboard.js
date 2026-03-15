import { supabase } from '/InfoMa2/supabase.js'

// ── PROTECTION ──
const userId = localStorage.getItem('userId')
if (!userId) {
    window.location.href = '/InfoMa2/Login/login.html'
}

// ── USER INFO ──
const firstName = localStorage.getItem('firstName')
const lastName = localStorage.getItem('lastName')
const role = localStorage.getItem('userRole')
const college = localStorage.getItem('college')
const department = localStorage.getItem('department')
const position = localStorage.getItem('position')

// show name
document.getElementById('userName').textContent = firstName + ' ' + lastName

// show role info
if (role === 'student') {
    document.getElementById('roleInfo').textContent = 'Student | ' + college
} else if (role === 'faculty') {
    document.getElementById('roleInfo').textContent = 'Faculty | ' + department
} else if (role === 'staff') {
    document.getElementById('roleInfo').textContent = 'Staff | ' + position
}

// show time in
const timeIn = new Date().toLocaleTimeString('en-PH', {
    hour: '2-digit',
    minute: '2-digit'
})
document.getElementById('timeIn').textContent = 'Time In: ' + timeIn

// ── VISIT HISTORY ──
async function loadHistory() {
    const { data, error } = await supabase
        .from('visits')
        .select('*')
        .eq('user_id', userId)
        .order('time_in', { ascending: false })

    if (error) {
        console.log('Error loading history:', error)
        return
    }

    const tbody = document.getElementById('visitHistory')
    tbody.innerHTML = ''

    if (data.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4">No visits yet!</td></tr>'
        return
    }

    data.forEach(visit => {
        const row = document.createElement('tr')
        row.innerHTML = `
            <td>${visit.date}</td>
            <td>${visit.reason}</td>
            <td>${new Date(visit.time_in).toLocaleTimeString()}</td>
            <td>${visit.time_out ? 
                new Date(visit.time_out).toLocaleTimeString() : 
                'Still inside'}</td>
        `
        tbody.appendChild(row)
    })
}

loadHistory()

// ── EXIT LIBRARY ──
document.getElementById('exitBtn').addEventListener('click', async function() {
    const visitId = localStorage.getItem('visitId')

    const { error } = await supabase
        .from('visits')
        .update({ time_out: new Date().toISOString() })
        .eq('id', visitId)

    if (error) {
        console.log('Error:', error)
        return
    }

    localStorage.removeItem('visitId')
    alert('Goodbye! See you next time!')
    window.location.href = '/InfoMa2/Login/login.html'
})

// ── LOGOUT ──
document.getElementById('logoutBtn').addEventListener('click', function() {
    localStorage.clear()
    window.location.href = '/InfoMa2/Login/login.html'
})