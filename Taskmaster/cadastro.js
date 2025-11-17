function cadastrar(event) {
  event.preventDefault();

  const firstname = document.getElementById('firstName').value.trim();
  const lastname = document.getElementById('lastName').value.trim();
  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value.trim();

  // Verifica se os campos estão preenchidos
  if (!firstname || !lastname || !email || !password) {
    alert("Por favor, preencha todos os campos.");
    return;
  }

  auth.createUserWithEmailAndPassword(email, password)
    .then(userCredential => {
      const user = userCredential.user;

     
      return db.ref('usuarios/' + user.uid).set({
        firstname,
        lastname,
        email
      });
    })
    .then(() => {
      alert("Conta criada com sucesso! 🎉");
      window.location.href = "login.html"; // Redireciona para a tela de login
    })
    .catch(error => {
      alert("Erro ao cadastrar: " + error.message); // Exibe mensagem de erro
    });
}


// Botão "Voltar" para a tela de login
document.getElementById('btnVoltar').addEventListener('click', function() {
  window.location.href = 'login.html';
});