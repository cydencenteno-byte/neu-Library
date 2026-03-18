import { supabase } from '/supabase.js'


const userRole = localStorage.getItem('userRole')
if (!userRole || userRole !== 'admin') {
    window.location.href = '/adminLogin/login.html'
}


document.getElementById('settingsBtn').addEventListener('click', function() {
    document.getElementById('settingsModal').style.display = 'flex'
})

document.getElementById('closeSettingsBtn').addEventListener('click', function() {
    document.getElementById('settingsModal').style.display = 'none'
})


document.getElementById('logoutBtn').addEventListener('click', function() {
    localStorage.clear()
    window.location.href = '/adminLogin/login.html'
})


document.getElementById('refreshBtn').addEventListener('click', function() {
    loadStats()
    loadCurrentTab()
})


async function loadStats() {
    const today = new Date().toLocaleDateString('en-CA')

    const { data: todayData } = await supabase
        .from('visits').select('*').eq('date', today)
    document.getElementById('todayCount').textContent = todayData?.length || 0

    const { data: totalData } = await supabase
        .from('visits').select('*')
    document.getElementById('totalCount').textContent = totalData?.length || 0

    const weekAgo = new Date()
    weekAgo.setDate(weekAgo.getDate() - 7)
    const { data: weekData } = await supabase
        .from('visits').select('*')
        .gte('time_in', weekAgo.toISOString())
    document.getElementById('weekCount').textContent = weekData?.length || 0

    const monthAgo = new Date()
    monthAgo.setMonth(monthAgo.getMonth() - 1)
    const { data: monthData } = await supabase
        .from('visits').select('*')
        .gte('time_in', monthAgo.toISOString())
    document.getElementById('monthCount').textContent = monthData?.length || 0

    const { data: insideData } = await supabase
        .from('visits').select('*')
        .is('time_out', null)
    document.getElementById('insideCount').textContent = insideData?.length || 0
}


async function loadVisits(search = '', filter = 'all', startDate = '', endDate = '') {
    let query = supabase
        .from('visits')
        .select('*')
        .order('time_in', { ascending: false })

    const today = new Date().toLocaleDateString('en-CA')
    if (filter === 'today') {
        query = query.eq('date', today)
    } else if (filter === 'week') {
        const weekAgo = new Date()
        weekAgo.setDate(weekAgo.getDate() - 7)
        query = query.gte('time_in', weekAgo.toISOString())
    } else if (filter === 'month') {
        const monthAgo = new Date()
        monthAgo.setMonth(monthAgo.getMonth() - 1)
        query = query.gte('time_in', monthAgo.toISOString())
    } else if (filter === 'custom' && startDate && endDate) {
        query = query.gte('date', startDate).lte('date', endDate)
    }

    const { data: visits, error } = await query
    if (error) { console.log('visits error:', error); return }

    const { data: users } = await supabase
        .from('users')
        .select('*')

    const combined = visits.map(visit => {
        const user = users?.find(u => u.id === visit.user_id)
        return { ...visit, users: user }
    })

    let filtered = combined

    if (search) {
        filtered = data.filter(visit => {
            const name = (visit.users?.first_name + ' ' + visit.users?.last_name).toLowerCase()
            const role = visit.users?.role?.toLowerCase() || ''
            const reason = visit.reason?.toLowerCase() || ''
            const college = visit.users?.college?.toLowerCase() || ''
            const department = visit.users?.department?.toLowerCase() || ''
            return name.includes(search.toLowerCase()) ||
                   role.includes(search.toLowerCase()) ||
                   reason.includes(search.toLowerCase()) ||
                   college.includes(search.toLowerCase()) ||
                   department.includes(search.toLowerCase())
        })
    }

    const tbody = document.getElementById('visitorTable')
    tbody.innerHTML = ''

    if (filtered.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" style="text-align:center">No visitors found!</td></tr>'
        return
    }

    filtered.forEach(visit => {
        const name = (visit.users?.first_name || '') + ' ' + (visit.users?.last_name || '')
        const isBlocked = visit.users?.is_blocked
        const row = document.createElement('tr')
        row.innerHTML = `
            <td>${name}</td>
            <td>${visit.users?.role || '-'}</td>
            <td>${visit.reason}</td>
            <td>${new Date(visit.time_in).toLocaleTimeString()}</td>
            <td>${visit.time_out ? new Date(visit.time_out).toLocaleTimeString() : '🟢 Inside'}</td>
            <td>${visit.date}</td>
            <td>
                <button class="${isBlocked ? 'unblock-btn' : 'block-btn'}"
                    onclick="toggleBlock('${visit.users?.id}', ${isBlocked})">
                    ${isBlocked ? 'Unblock' : 'Block'}
                </button>
                <button class="delete-btn"
                    onclick="deleteVisit('${visit.id}')">
                    Delete
                </button>
            </td>
        `
        tbody.appendChild(row)
    })

    window.currentData = filtered
}


async function loadUsers() {
    const { data, error } = await supabase
        .from('users')
        .select('*')
        .neq('role', 'admin')
        .order('first_name')

    if (error) { console.log(error); return }

    const tbody = document.getElementById('usersTableBody')
    tbody.innerHTML = ''

    if (data.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align:center">No users found!</td></tr>'
        return
    }

    data.forEach(user => {
        const collegeInfo = user.college || user.department || user.position || '-'
        const row = document.createElement('tr')
        row.innerHTML = `
            <td>${user.first_name} ${user.last_name}</td>
            <td>${user.email}</td>
            <td>${user.role}</td>
            <td>${collegeInfo}</td>
            <td>
                <span class="${user.is_blocked ? 'badge-blocked' : 'badge-active'}">
                    ${user.is_blocked ? 'Blocked' : 'Active'}
                </span>
            </td>
            <td>
                <button class="${user.is_blocked ? 'unblock-btn' : 'block-btn'}"
                    onclick="toggleBlock('${user.id}', ${user.is_blocked})">
                    ${user.is_blocked ? 'Unblock' : 'Block'}
                </button>
                <button class="delete-btn"
                    onclick="deleteUser('${user.id}')">
                    Delete
                </button>
            </td>
        `
        tbody.appendChild(row)
    })
}


async function loadBlocked() {
    const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('is_blocked', true)

    if (error) { console.log(error); return }

    const tbody = document.getElementById('blockedTableBody')
    tbody.innerHTML = ''

    if (data.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4" style="text-align:center">No blocked users!</td></tr>'
        return
    }

    data.forEach(user => {
        const row = document.createElement('tr')
        row.innerHTML = `
            <td>${user.first_name} ${user.last_name}</td>
            <td>${user.email}</td>
            <td>${user.role}</td>
            <td>
                <button class="unblock-btn"
                    onclick="toggleBlock('${user.id}', true)">
                    Unblock
                </button>
            </td>
        `
        tbody.appendChild(row)
    })
}


async function loadInside() {
    const { data, error } = await supabase
        .from('visits')
        .select('*')
        .is('time_out', null)
        .order('time_in', { ascending: false })

    if (error) { console.log(error); return }

    const tbody = document.getElementById('insideTableBody')
    tbody.innerHTML = ''

    if (data.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4" style="text-align:center">No one inside!</td></tr>'
        return
    }

    data.forEach(visit => {
        const row = document.createElement('tr')
        row.innerHTML = `
            <td>${visit.users?.first_name} ${visit.users?.last_name}</td>
            <td>${visit.users?.role}</td>
            <td>${visit.reason}</td>
            <td>${new Date(visit.time_in).toLocaleTimeString()}</td>
        `
        tbody.appendChild(row)
    })
}


window.toggleBlock = async function(userId, isBlocked) {
    const confirm = window.confirm(isBlocked ? 'Unblock this user?' : 'Block this user?')
    if (!confirm) return

    const { error } = await supabase
        .from('users')
        .update({ is_blocked: !isBlocked })
        .eq('id', userId)

    if (error) { console.log(error); return }

    alert(isBlocked ? 'User unblocked!' : 'User blocked!')
    loadStats()
    loadCurrentTab()
}


window.deleteVisit = async function(visitId) {
    const confirm = window.confirm('Delete this visit record?')
    if (!confirm) return

    const { error } = await supabase
        .from('visits')
        .delete()
        .eq('id', visitId)

    if (error) { console.log(error); return }

    alert('Visit deleted!')
    loadVisits()
    loadStats()
}


window.deleteUser = async function(userId) {
    const confirm = window.confirm('Delete this user? This cannot be undone!')
    if (!confirm) return

    await supabase.from('visits').delete().eq('user_id', userId)

    const { error } = await supabase
        .from('users').delete().eq('id', userId)

    if (error) { console.log(error); return }

    alert('User deleted!')
    loadUsers()
    loadStats()
}


let currentTab = 'visits'

function loadCurrentTab() {
    if (currentTab === 'visits') loadVisits(
        document.getElementById('searchInput').value,
        document.getElementById('dateFilter').value,
        document.getElementById('startDate').value,
        document.getElementById('endDate').value
    )
    else if (currentTab === 'users') loadUsers()
    else if (currentTab === 'blocked') loadBlocked()
    else if (currentTab === 'inside') loadInside()
}

document.getElementById('tabVisits').addEventListener('click', function() {
    currentTab = 'visits'
    setActiveTab(this)
    showTable('visitsTable')
    loadVisits()
})

document.getElementById('tabUsers').addEventListener('click', function() {
    currentTab = 'users'
    setActiveTab(this)
    showTable('usersTable')
    loadUsers()
})

document.getElementById('tabBlocked').addEventListener('click', function() {
    currentTab = 'blocked'
    setActiveTab(this)
    showTable('blockedTable')
    loadBlocked()
})

document.getElementById('tabInside').addEventListener('click', function() {
    currentTab = 'inside'
    setActiveTab(this)
    showTable('insideTable')
    loadInside()
})

function setActiveTab(btn) {
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'))
    btn.classList.add('active')
}

function showTable(id) {
    document.getElementById('visitsTable').style.display = 'none'
    document.getElementById('usersTable').style.display = 'none'
    document.getElementById('blockedTable').style.display = 'none'
    document.getElementById('insideTable').style.display = 'none'
    document.getElementById('settingsPanel') && 
        (document.getElementById('settingsPanel').style.display = 'none')
    document.getElementById(id).style.display = 'block'
}


document.getElementById('searchBtn').addEventListener('click', function() {
    loadVisits(document.getElementById('searchInput').value,
        document.getElementById('dateFilter').value)
})

document.getElementById('searchInput').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') loadVisits(this.value,
        document.getElementById('dateFilter').value)
})


document.getElementById('dateFilter').addEventListener('change', function() {
    if (this.value === 'custom') {
        document.getElementById('customRange').style.display = 'flex'
    } else {
        document.getElementById('customRange').style.display = 'none'
        loadVisits('', this.value)
    }
})

document.getElementById('endDate').addEventListener('change', function() {
    loadVisits('', 'custom',
        document.getElementById('startDate').value,
        this.value)
})


document.getElementById('pdfBtn').addEventListener('click', function() {
    const { jsPDF } = window.jspdf
    const doc = new jsPDF()

    doc.setFontSize(16)
    doc.text('NEU Library Visitor Report', 14, 15)
    doc.setFontSize(10)
    doc.text('Generated: ' + new Date().toLocaleString(), 14, 22)

    const rows = []
    document.querySelectorAll('#visitorTable tr').forEach(row => {
        const cells = row.querySelectorAll('td')
        if (cells.length > 0) {
            rows.push([
                cells[0].textContent,
                cells[1].textContent,
                cells[2].textContent,
                cells[3].textContent,
                cells[4].textContent,
                cells[5].textContent
            ])
        }
    })

    doc.autoTable({
        head: [['Name', 'Role', 'Reason', 'Time In', 'Time Out', 'Date']],
        body: rows,
        startY: 28
    })

    doc.save('NEU_Library_Visitors.pdf')
})


document.getElementById('cardToday').addEventListener('click', function() {
    document.getElementById('dateFilter').value = 'today'
    loadVisits('', 'today')
    showTable('visitsTable')
    setActiveTab(document.getElementById('tabVisits'))
})

document.getElementById('cardWeek').addEventListener('click', function() {
    document.getElementById('dateFilter').value = 'week'
    loadVisits('', 'week')
    showTable('visitsTable')
    setActiveTab(document.getElementById('tabVisits'))
})

document.getElementById('cardMonth').addEventListener('click', function() {
    document.getElementById('dateFilter').value = 'month'
    loadVisits('', 'month')
    showTable('visitsTable')
    setActiveTab(document.getElementById('tabVisits'))
})

document.getElementById('cardInside').addEventListener('click', function() {
    currentTab = 'inside'
    showTable('insideTable')
    setActiveTab(document.getElementById('tabInside'))
    loadInside()
})


document.getElementById('saveSettingsBtn').addEventListener('click', async function() {
    const newEmail = document.getElementById('newEmail').value.trim()
    const newPassword = document.getElementById('newPassword').value.trim()
    const confirmPassword = document.getElementById('confirmNewPassword').value.trim()
    const currentPassword = document.getElementById('currentPassword').value.trim()
    const settingsError = document.getElementById('settingsError')
    const settingsSuccess = document.getElementById('settingsSuccess')

    settingsError.textContent = ''
    settingsSuccess.textContent = ''

    if (!currentPassword) {
        settingsError.textContent = 'Current password is required!'
        settingsError.style.display = 'block'
        return
    }

    const adminId = localStorage.getItem('userId')
    const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', adminId)
        .eq('password', currentPassword)
        .single()

    if (error || !data) {
        settingsError.textContent = 'Current password is incorrect!'
        settingsError.style.display = 'block'
        return
    }

    if (newPassword && newPassword !== confirmPassword) {
        settingsError.textContent = 'New passwords do not match!'
        settingsError.style.display = 'block'
        return
    }

    const updates = {}
    if (newEmail) updates.email = newEmail
    if (newPassword) updates.password = newPassword

    if (Object.keys(updates).length === 0) {
        settingsError.textContent = 'No changes entered!'
        settingsError.style.display = 'block'
        return
    }

    const { error: updateError } = await supabase
        .from('users')
        .update(updates)
        .eq('id', adminId)

    if (updateError) {
        settingsError.textContent = 'Error saving changes!'
        settingsError.style.display = 'block'
        return
    }

    settingsSuccess.textContent = 'Changes saved! Logging out...'
    settingsSuccess.style.display = 'block'

    setTimeout(function() {
        localStorage.clear()
        window.location.href = '/adminLogin/login.html'
    }, 2000)
})

// test query
const { data, error } = await supabase
    .from('visits')
    .select('*')

console.log('visits data:', data)
console.log('visits error:', error)


loadStats()
loadVisits()