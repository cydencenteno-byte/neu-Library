import { supabase } from "/InfoMa2/supabase.js";

const existingUser = localStorage.getItem('userId')
const existingRole = localStorage.getItem('userRole')

if (existingUser && existingRole === 'admin') {
    window.location.href = '/InfoMa2/adminPage/adminp.html'
} else if (existingUser) {
    window.location.href = '/InfoMa2/WelcomPage/welcome.html'
}

const form = document.querySelector('form');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const emailError = document.getElementById('emailError');
const passwordError = document.getElementById('passwordError');
const  loginError = document.getElementById('loginError');

function clearErrors() {
    emailError.textContent = '';
    passwordError.textContent = '';
    loginError.textContent = '';
}

form.addEventListener('submit',async function (e) {
    e.preventDefault();
    clearErrors();

    const email = emailInput.value.trim();
    const password = passwordInput.value.trim();


    if(email === '') {
        emailError.textContent = 'Email is required.';
        emailError.style.display = 'block';
        emailError.style.color = 'red';
        return; 
    }

    if(password === '') {
        passwordError.textContent = 'Password is required.';
        passwordError.style.display = 'block';
        passwordError.style.color = 'red';
        return; 
    }

    if(!email.endsWith('@neu.edu.ph')) {
        emailError.textContent = 'Please user your NEU email address.';
        emailError.style.display = 'block';
        emailError.style.color = 'red';
        return;
    }

    const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .eq('password', password)
        .single()
   
        if(error || !data) {
        loginError.textContent = 'Invalid email or password. Please try again.';
        loginError.style.display = 'block';
        loginError.style.color = 'red';
        return;
    }

         if(data.is_blocked) {
        loginError.textContent = 'Your account is blocked. Please contact the administrator.';
        loginError.style.display = 'block';
        loginError.style.color = 'red';
        return;
    }
        localStorage.setItem('userId', data.id)
        localStorage.setItem('firstName', data.first_name)
        localStorage.setItem('lastName', data.last_name)
        localStorage.setItem('userRole', data.role)

        localStorage.setItem('college', data.college)
        localStorage.setItem('department', data.department)
        localStorage.setItem('position', data.position)
        

        console.log('Saved to localStorage:')
        console.log('firstName:', data.first_name) 
        console.log('userId:', data.id)

        if (data.role === 'admin') {
            window.location.href = '/adminPage/adminp.html';
        } else {
            window.location.href = '/WelcomPage/welcome.html';
        }       

});