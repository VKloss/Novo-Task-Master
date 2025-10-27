function cadastrar(event) {
  event.preventDefault();

  const firstname = document.getElementById('firstName').value.trim();
  const lastname = document.getElementById('lastName').value.trim();
  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value.trim();

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
      window.location.href = "login.html";
    })
    .catch(error => {
      alert("Erro ao cadastrar: " + error.message);
    });
}

document.getElementById('btnVoltar').addEventListener('click', function() {
  window.location.href = 'login.html';
});
document.getElementById('signup-btn').addEventListener('click', function() {
    window.location.href = 'login.html';
});