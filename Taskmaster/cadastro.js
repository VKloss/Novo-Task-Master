function cadastrar(event) {
  event.preventDefault();

  const firstname = document.getElementById('firstName').value.trim();
  const lastname = document.getElementById('lastName').value.trim();
  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value.trim();


  if (!firstname || !lastname || !email || !password) {
    alert("Por favor, preencha todos os campos.");
    return;
  }

  auth.createUserWithEmailAndPassword(email, password)
  .then(userCredential => {
    const user = userCredential.user;

    // 1️⃣ Salva nome completo no Firebase Auth (ESSENCIAL)
    return user.updateProfile({
      displayName: `${firstname} ${lastname}`
    }).then(() => {

      // 2️⃣ Também salva no Realtime Database
      return db.ref('usuarios/' + user.uid).set({
        firstname,
        lastname,
        email
        // ❗ Nunca salve senha no banco
      });
    });
  })
  .then(() => {
    window.location.href = "login.html";
  })
  .catch(error => {
    alert("Erro ao cadastrar: " + error.message);
  });
}

// Botão "Voltar" para a tela de login
document.getElementById('btnVoltar').addEventListener('click', function() {
  window.location.href = 'login.html';
});