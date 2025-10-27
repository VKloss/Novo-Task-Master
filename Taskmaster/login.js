const emailInput = document.getElementById('email');
        const passwordInput = document.getElementById('password');
        const loginForm = document.getElementById('loginForm');
        const loginBtn = document.getElementById('loginBtn');
        
        emailInput.addEventListener('blur', validateEmail);
        passwordInput.addEventListener('blur', validatePassword);
        
        function validateEmail() {
            const email = emailInput.value;
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            
            if (email && emailRegex.test(email)) {
                emailInput.classList.remove('error');
                emailInput.classList.add('success');
            } else if (email) {
                emailInput.classList.remove('success');
                emailInput.classList.add('error');
            } else {
                emailInput.classList.remove('success', 'error');
            }
        }
        
        function validatePassword() {
            const password = passwordInput.value;
            
            if (password && password.length >= 6) {
                passwordInput.classList.remove('error');
                passwordInput.classList.add('success');
            } else if (password) {
                passwordInput.classList.remove('success');
                passwordInput.classList.add('error');
            } else {
                passwordInput.classList.remove('success', 'error');
            }
        }
        
        function togglePassword() {
            const passwordField = document.getElementById('password');
            const toggleBtn = document.querySelector('.password-toggle');
            
            if (passwordField.type === 'password') {
                passwordField.type = 'text';
                toggleBtn.textContent = '🙈';
            } else {
                passwordField.type = 'password';
                toggleBtn.textContent = '👁️';
            }
        }
        
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            loginBtn.classList.add('loading');
          
            const email = emailInput.value.trim();
            const password = passwordInput.value.trim();
          
            auth.signInWithEmailAndPassword(email, password)
              .then(() => {
                loginBtn.classList.remove('loading');
                alert('Login efetuado com sucesso! 🎉');
                window.location.href = "dashboard.html"; // ✅ Redireciona
              })
              .catch(error => {
                loginBtn.classList.remove('loading');
                alert("Erro ao fazer login: " + error.message);
              });
          });
        
        
        // Animação nos inputs
        document.querySelectorAll('.form-input').forEach(input => {
            input.addEventListener('focus', function() {
                this.parentElement.classList.add('focused');
            });
            
            input.addEventListener('blur', function() {
                this.parentElement.classList.remove('focused');
            });
        });
        // Navegação para cadastro
        function goToSignup() {
            // Opção 1: Navegação com JavaScript (Single Page App)
            if (window.showSignupScreen) {
                window.showSignupScreen();
                return;
            }
            
            // Opção 2: Navegação tradicional
           window.location.href = "cadastro.html";
        
        }
        
        // Tornar função disponível globalmente
        window.goToLogin = function() {
            alert('Já estamos na tela de login!');
        };