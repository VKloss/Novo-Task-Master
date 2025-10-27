function cadastrar(event) {
    event.preventDefault();
    const firstname = document.getElementById('firstName').value.trim();
    const lastname = document.getElementById('lastName').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    const novoRegistro = {
        firstname,
        lastname,
        email,
        password
    };

  db.ref('uservitor').push(novoRegistro)
    .then(() => {
      alert("Registrado com sucesso! ");
        document.getElementById('firstName').value = '';
        document.getElementById('lastName').value = '';
        document.getElementById('email').value = '';
        document.getElementById('password').value = '';
    });
}