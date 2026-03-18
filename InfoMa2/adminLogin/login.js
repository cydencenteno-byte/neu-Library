import { supabase } from '/supabase.js'

const existingRole = localStorage.getItem('userRole')
if (existingRole === 'admin') {
    window.location.href = '/adminPage/adminp.html'
}

const form = document.querySelector('form')
const emailInput = document.getElementById('email')
const passwordInput = document.getElementById('password')
const emailError = document.getElementById('emailError')
const passwordError = document.getElementById('passwordError')
const loginError = document.getElementById('loginError')

function clearErrors() {
    emailError.textContent = ''
    passwordError.textContent = ''
    loginError.textContent = ''
}

document.getElementById('togglePassword').addEventListener('click', function() {
    const passwordInput = document.getElementById('password')
    if (passwordInput.type === 'password') {
        passwordInput.type = 'text'
        this.textContent = '🙈'
    } else {
        passwordInput.type = 'password'
        this.textContent = '👁'
    }
})

form.addEventListener('submit', async function(e) {
    e.preventDefault()
    clearErrors()

    const email = emailInput.value.trim()
    const password = passwordInput.value.trim()


    if (email === '') {
        emailError.textContent = 'Email is required.'
        emailError.style.display = 'block'
        return
    }

    if (password === '') {
        passwordError.textContent = 'Password is required.'
        passwordError.style.display = 'block'
        return
    }


    if (!email.endsWith('@neu.edu.ph')) {
        emailError.textContent = 'Please use your NEU email.'
        emailError.style.display = 'block'
        return
    }


    const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .eq('password', password)
        .single()

    if (error || !data) {
        loginError.textContent = 'Invalid email or password.'
        loginError.style.display = 'block'
        return
    }


    if (data.role !== 'admin') {
        loginError.textContent = 'You are not authorized as admin!'
        loginError.style.display = 'block'
        return
    }


    localStorage.setItem('userId', data.id)
    localStorage.setItem('firstName', data.first_name)
    localStorage.setItem('lastName', data.last_name)
    localStorage.setItem('userRole', data.role)

    window.location.href = '/adminPage/adminp.html'
})