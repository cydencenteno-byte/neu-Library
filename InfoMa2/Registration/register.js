import { supabase } from "../supabase.js";

const roleSelect = document.getElementById('role');

roleSelect.addEventListener('change', function() {
    let role = this.value;
    

    document.querySelector('.studentRole').style.display = 'none';
    document.querySelector('.facultyRole').style.display = 'none';
    document.querySelector('.staffRole').style.display = 'none';    

    if (role === 'student') {
        document.querySelector('.studentRole').style.display = 'block';
        document.querySelector('.defaultform').style.display = 'block';
    } else if (role === 'faculty') {
        document.querySelector('.facultyRole').style.display = 'block';
        document.querySelector('.defaultform').style.display = 'block';
    } else if (role === 'staff') {
        document.querySelector('.staffRole').style.display = 'block';
        document.querySelector('.defaultform').style.display = 'block';
    }

});



    const form = document.querySelector('form')
    const firstName = document.getElementById('firstName')
    const lastName = document.getElementById('lastName')
    const email = document.getElementById('email')
    const password = document.getElementById('password')
    const confirmPassword = document.getElementById('confirmPassword')
    const nameError = document.getElementById('nameError')
    const emailError = document.getElementById('emailError')
    const passwordError = document.getElementById('passwordError')
    const generalError = document.getElementById('generalError')

    function clearErrors(){
        nameError.textContent = ''
        emailError.textContent = ''
        passwordError.textContent = ''
        generalError.textContent = ''
    }

    form.addEventListener('submit', async function(e) {

        e.preventDefault()
        clearErrors();

        const roleVal = roleSelect.value
        const firstNameVal = firstName.value.trim()
        const lastNameVal = lastName.value.trim()
        const emailVal = email.value.trim()
        const passwordVal = password.value.trim()
        const confirmPasswordVal = confirmPassword.value.trim()

        let collegeVal = null
        let departmentVal = null
        let positionVal = null

        if (roleVal === 'student') {
        collegeVal = document.getElementById('college')?.value || null
        } else if (roleVal === 'faculty') {
            departmentVal = document.getElementById('department')?.value || null
        } else if (roleVal === 'staff') {
            positionVal = document.getElementById('position')?.value || null
        }
        
        if(!roleVal){
            generalError.textContent = 'Please Select Role'
            generalError.style.display = 'block'
            generalError.style.color = 'red'
            return
        }

        if(!firstNameVal || !lastNameVal){
            nameError.textContent = 'Please Enter your Full Name'
            nameError.style.display = 'block'
            nameError.style.color = 'red'
            return

        }

        if(!emailVal.endsWith('@neu.edu.ph')){

            emailError.textContent = "Invalid Email Adress"
            emailError.style.display = 'block'
            emailError.style.color = 'red'
            return
        }

        if(passwordVal.length < 6){
            passwordError.textContent = 'Password must be at least 6 Characters'
            passwordError.style.display = 'block'
            passwordError.style.color = 'red'
            return
        }

        if(confirmPasswordVal !== passwordVal){
            passwordError.textContent = 'Password Dont Match'
            passwordError.style.display = 'block'
            passwordError.style.color = 'red'
            return
        }

        const {data, error} = await supabase
        .from('users')
        .insert({

             first_name: firstNameVal,
            last_name: lastNameVal,
            email: emailVal,
            password: passwordVal,
            role: roleVal,
            college: document.getElementById('college')?.value || null,
            department: document.getElementById('department')?.value || null,
            position: document.getElementById('position')?.value || null

        })

        console.log('data', data)
        console.log('error', error)

         if (error) {
        generalError.textContent = 'Registration failed. Email may already exist.'
        generalError.style.display = 'block'
        return
        
    }
        alert('Registration successful!')
        window.location.href = '/Login/login.html'
        

    })