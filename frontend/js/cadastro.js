const API_URL_INSERE = 'http://localhost:8081/clientes';
const alertContainer = document.getElementById('custom-alert-container');
const alertMessage = document.getElementById('alert-message');
const alertButton = document.getElementById('alert-ok-button');

const form = document.getElementById('Formulario-Cadastro');

form.addEventListener('submit', handleFormSubmit);

async function handleFormSubmit(event) {
    event.preventDefault(); 

    const nome = document.getElementById('nome').value;
    const cpf = parseInt(document.getElementById('cpf').value);
    const email = document.getElementById('email').value;
    const senha = document.getElementById('senha').value;

    const novoCliente = {
        nome: nome,
        cpf: cpf,
        email: email,
        senha: senha
    };

    try {
        const response = await fetch(API_URL_INSERE, {
            method: 'POST', 
            headers: {
                'Content-Type': 'application/json' 
            },
            body: JSON.stringify(novoCliente) 
        });

        const result = await response.json();

        if (response.ok) {
            showAlert(`Sucesso! Cliente ${result.cliente.nome} cadastrado.`);
            form.reset();
            setTimeout(() => {
                window.location.href = "login.html";
            }, 3000);
        } 
        else 
        {
            showAlert(`Erro ao cadastrar: ${result.error || response.statusText}`);
        }

    } catch (error) {
        console.error("Erro na requisição POST:", error);
        alert("Erro de conexão com o servidor. Verifique o console do navegador.");
    }
}

function showAlert(message) {
    alertMessage.textContent = message;
    alertContainer.style.display = 'flex'; 

    setTimeout(() => {
        hideAlert();
    }, 3000); 

    alertButton.onclick = hideAlert;
}

function hideAlert() {
    alertContainer.style.display = 'none';
}