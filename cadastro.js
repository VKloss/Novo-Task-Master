// Elementos do formulário
const signupForm = document.getElementById('signupForm');
const signupBtn = document.getElementById('signupBtn');
const termsCheckbox = document.getElementById('terms');

// Validação em tempo real
document.getElementById('firstName').addEventListener('input', validateName);
document.getElementById('lastName').addEventListener('input', validateName);
document.getElementById('email').addEventListener('blur', validateEmail);
document.getElementById('password').addEventListener('input', validatePassword);
document.getElementById('confirmPassword').addEventListener('input', validateConfirmPassword);
termsCheckbox.addEventListener('change', toggleSubmitButton);

signupForm.addEventListener('submit', async function (e) {
    e.preventDefault(); // Impede o envio padrão do formulário

    signupBtn.classList.add('loading'); // Mostra o spinner de carregamento

    // Captura os dados do formulário
    const formData = {
        firstName: document.getElementById('firstName').value,
        lastName: document.getElementById('lastName').value,
        email: document.getElementById('email').value,
        password: document.getElementById('password').value,
    };

    try {
        // Envia os dados para o backend
        const response = await fetch('https://seu-backend.com/api/signup', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData),
        });

        if (response.ok) {
            const result = await response.json();
            alert('Conta criada com sucesso! 🎉');
            // Redireciona para a página de login ou dashboard
            window.location.href = 'login.html';
        } else {
            const error = await response.json();
            alert(`Erro: ${error.message}`);
        }
    } catch (err) {
        console.error('Erro ao criar conta:', err);
        alert('Ocorreu um erro ao criar a conta. Tente novamente mais tarde.');
    } finally {
        signupBtn.classList.remove('loading'); // Remove o spinner de carregamento
    }
});

// Funções de validação
const passwordInput = document.getElementById('password');
const password = passwordInput.value;
const strengthBar = document.querySelector('.strength-bar');
const strengthText = document.getElementById('strengthText');

if (password.length === 0) {
    strengthBar.className = 'strength-bar';
    strengthText.textContent = 'Digite uma senha';
    passwordInput.classList.remove('success', 'error');
    return;
}

let strength = 0;
let feedback = '';

// Critérios de força da senha
if (password.length >= 8) strength++;
if (/[a-z]/.test(password)) strength++;
if (/[A-Z]/.test(password)) strength++;
if (/[0-9]/.test(password)) strength++;
if (/[^A-Za-z0-9]/.test(password)) strength++;

// Atualizar visual
strengthBar.className = 'strength-bar';

if (strength <= 2) {
    strengthBar.classList.add('strength-weak');
    feedback = 'Senha fraca';
    passwordInput.classList.add('error');
    passwordInput.classList.remove('success');
} else if (strength === 3) {
    strengthBar.classList.add('strength-fair');
    feedback = 'Senha razoável';
    passwordInput.classList.add('error');
    passwordInput.classList.remove('success');
} else if (strength === 4) {
    strengthBar.classList.add('strength-good');
    feedback = 'Senha boa';
    passwordInput.classList.remove('error');
    passwordInput.classList.add('success');
} else {
    strengthBar.classList.add('strength-strong');
    feedback = 'Senha forte';
    passwordInput.classList.remove('error');
    passwordInput.classList.add('success');
}

strengthText.textContent = feedback;
validateConfirmPassword();
toggleSubmitButton();


function validateConfirmPassword() {
const passwordInput = document.getElementById('password');
const confirmPasswordInput = document.getElementById('confirmPassword');
const password = passwordInput.value;
const confirmPassword = confirmPasswordInput.value;

if (confirmPassword.length === 0) {
    confirmPasswordInput.classList.remove('success', 'error');
} else if (password === confirmPassword && password.length >= 6) {
    confirmPasswordInput.classList.remove('error');
    confirmPasswordInput.classList.add('success');
} else {
    confirmPasswordInput.classList.remove('success');
    confirmPasswordInput.classList.add('error');
}

toggleSubmitButton();
}

function togglePassword(fieldId) {
const field = document.getElementById(fieldId);
const toggleBtn = field.nextElementSibling;

if (field.type === 'password') {
    field.type = 'text';
    toggleBtn.textContent = '🙈';
} else {
    field.type = 'password';
    toggleBtn.textContent = '👁️';
}
}

function toggleSubmitButton() {
const firstName = document.getElementById('firstName').value.trim();
const lastName = document.getElementById('lastName').value.trim();
const email = document.getElementById('email').value.trim();
const password = document.getElementById('password').value;
const confirmPassword = document.getElementById('confirmPassword').value;
const termsChecked = document.getElementById('terms').checked;

const isValid = firstName.length >= 2 && 
               lastName.length >= 2 && 
               /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) &&
               password.length >= 6 &&
               password === confirmPassword &&
               termsChecked;

signupBtn.disabled = !isValid;
}

// Envio do formulário
signupForm.addEventListener('submit', function(e) {
e.preventDefault();

signupBtn.classList.add('loading');

// Simular criação da conta
setTimeout(() => {
    signupBtn.classList.remove('loading');
    alert('Conta criada com sucesso! 🎉\n\nVerifique seu e-mail para confirmar a conta.');
    
    // Aqui você redirecionaria para o dashboard ou tela de verificação
    goToLogin();
}, 2500);
});

// Navegação
function goToLogin() {
// Opção 1: Navegação com JavaScript (Single Page App)
if (window.showLoginScreen) {
    window.showLoginScreen();
    return;
}

// Opção 2: Navegação tradicional
// window.location.href = 'login.html';

// Opção 3: Para demonstração
alert('Navegando para tela de login...\n\nImplementar: window.location.href = "login.html"');
}

// Tornar função disponível globalmente para navegação entre telas
window.goToSignup = function() {
alert('Já estamos na tela de cadastro!');
};
  

function toggleSubmitButton() {
    const firstName = document.getElementById('firstName').value.trim();
    const lastName = document.getElementById('lastName').value.trim();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    const termsChecked = document.getElementById('terms').checked;

    // Adicione a lógica para habilitar/desabilitar o botão de envio aqui
}