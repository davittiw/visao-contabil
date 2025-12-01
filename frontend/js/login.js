const API_URL_LOGIN = 'http://localhost:8081/login';
const form = document.getElementById('Formulario-login');

form.addEventListener('submit', handleLoginSubmit);

async function handleLoginSubmit(event) {
    event.preventDefault(); 

    const email = document.getElementById('email').value;
    const senha = document.getElementById('senha').value;

    const credenciais = {
        email: email,
        senha: senha
    };

    try {
        const response = await fetch(API_URL_LOGIN, {
            method: 'POST', 
            headers: {
                'Content-Type': 'application/json' 
            },
            body: JSON.stringify(credenciais) 
        });

        const result = await response.json();

        if (response.ok) {
            const userId = result.user.id;
            localStorage.setItem('usuarioId', userId);
            alert(`Bem-vindo, ${result.user.nome}! Login realizado.`);
            window.location.href = "dashboard.html";
        } else {
            alert(`Falha no Login: ${result.error}`);
        }

    } catch (error) {
        console.error("Erro na requisição POST de login:", error);
        alert("Erro de conexão com o servidor. Tente novamente.");
    }
}