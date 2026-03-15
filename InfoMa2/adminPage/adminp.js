import { supabase } from '/supabase.js'

// ── PROTECTION ──
const userRole = localStorage.getItem('userRole')
if (!userRole || userRole !== 'admin') {
    window.location.href = '/Login/login.html'
}

// ── LOGOUT ──
document.getElementById('logoutBtn').addEventListener('click', function() {
    localStorage.clear()
    window.location.href = '/Login/login.html'
})

// ── LOAD STATS ──
async function loadStats() {
    const today = new Date().toLocaleDateString('en-CA')

    // today
    const { data: todayData } = await supabase
        .from('visits').select('*').eq('date', today)
    document.getElementById('todayCount').textContent = todayData?.length || 0

    // total
    const { data: totalData } = await supabase
        .from('visits').select('*')
    document.getElementById('totalCount').textContent = totalData?.length || 0

    // week
    const weekAgo = new Date()
    weekAgo.setDate(weekAgo.getDate() - 7)
    const { data: weekData } = await supabase
        .from('visits').select('*')
        .gte('time_in', weekAgo.toISOString())
    document.getElementById('weekCount').textContent = weekData?.length || 0

    // month
    const monthAgo = new Date()
    monthAgo.setMonth(monthAgo.getMonth() - 1)
    const { data: monthData } = await supabase
        .from('visits').select('*')
        .gte('time_in', monthAgo.toISOString())
    document.getElementById('monthCount').textContent = monthData?.length || 0

    // currently inside
    const { data: insideData } = await supabase
        .from('visits').select('*')
        .is('time_out', null)
    document.getElementById('insideCount').textContent = insideData?.length || 0
}

// ── LOAD VISITS ──
async function loadVisits(search = '', filter = 'all', startDate = '', endDate = '') {
    let query = supabase
        .from('visits')
        .select(`*, users(id, first_name, last_name, role, college, department, position, is_blocked)`)
        .order('time_in', { ascending: false })

    // date filter
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

    const { data, error } = await query

    if (error) { console.log(error); return }

    let filtered = data

    // search filter
    if (search) {
        filtered = data.filter(visit => {
            const name = (visit.users?.first_name + ' ' + visit.users?.last_name).toLowerCase()
            const role = visit.users?.role?.toLowerCase() || ''
            const reason = visit.reason?.toLowerCase() || ''
            return name.includes(search.toLowerCase()) ||
                   role.includes(search.toLowerCase()) ||
                   reason.includes(search.toLowerCase())
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
        const roleInfo = visit.users?.college || visit.users?.department || visit.users?.position || '-'
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

    // save for PDF
    window.currentData = filtered
}

// ── LOAD ALL USERS ──
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

// ── LOAD BLOCKED USERS ──
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

// ── LOAD CURRENTLY INSIDE ──
async function loadInside() {
    const { data, error } = await supabase
        .from('visits')
        .select(`*, users(first_name, last_name, role)`)
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

// ── BLOCK/UNBLOCK ──
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

// ── DELETE VISIT ──
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

// ── DELETE USER ──
window.deleteUser = async function(userId) {
    const confirm = window.confirm('Delete this user? This cannot be undone!')
    if (!confirm) return

    // delete visits first
    await supabase.from('visits').delete().eq('user_id', userId)

    // then delete user
    const { error } = await supabase
        .from('users').delete().eq('id', userId)

    if (error) { console.log(error); return }

    alert('User deleted!')
    loadUsers()
    loadStats()
}

// ── TABS ──
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
    document.getElementById(id).style.display = 'block'
}

// ── SEARCH ──
document.getElementById('searchBtn').addEventListener('click', function() {
    loadVisits(document.getElementById('searchInput').value,
        document.getElementById('dateFilter').value)
})

document.getElementById('searchInput').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') loadVisits(this.value,
        document.getElementById('dateFilter').value)
})

// ── DATE FILTER ──
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

// ── PDF EXPORT ──
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

// ── STAT CARD FILTERS ──
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

// ── INIT ──
loadStats()
loadVisits()