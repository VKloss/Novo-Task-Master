document.addEventListener('DOMContentLoaded', () => {
    // Verifica se o usuário está autenticado
    auth.onAuthStateChanged(user => {
        if (user) {
            const userId = user.uid;

            // Busca o nome do usuário no Realtime Database
            db.ref('usuarios/' + userId).once('value')
                .then(snapshot => {
                    const userData = snapshot.val();
                    if (userData && userData.firstname) {
                        // Atualiza o nome do usuário no HTML
                        document.getElementById('userName').textContent = userData.firstname;
                    } else {
                        document.getElementById('userName').textContent = 'Usuário';
                    }
                })
                .catch(error => {
                    console.error('Erro ao buscar os dados do usuário:', error);
                });
        } else {
            // Redireciona para a página de login se o usuário não estiver autenticado
            window.location.href = 'login.html';
        }
    });
});