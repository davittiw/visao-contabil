let mockData = {};
const userId = localStorage.getItem("usuarioId");

if (!userId) {
  alert("Sessão expirada. Faça login novamente.");
  window.location.href = "login.html";
}

async function BuscarDados() {
  const API_URL_DADOS = `http://localhost:8081/BuscarDados/${userId}`;

  try {
    const response = await fetch(API_URL_DADOS);
    mockData = await response.json();

    // Update summary and render tabs

    filtrarErenderizarDireitos("");
    filtrarErenderizarBens("");
    filtrarErenderizarObrigacoes("");
    updateSummary();
  } catch (error) {
    console.error("Erro ao buscar os dados:", error);
  }
}

BuscarDados();

// Format currency
function formatCurrency(value) {
  return `R$ ${value.toLocaleString("pt-BR")}`;
}

// Get badge class
function getBadgeClass(status) {
  const statusMap = {
    Ativo: "badge-default",
    Pendente: "badge-secondary",
    Vencido: "badge-destructive",
    Manutenção: "badge-outline",
  };
  return statusMap[status] || "badge-default";
}

// Update summary
function updateSummary() {
  const totalBens = mockData.bens.reduce((sum, item) => sum + item.valor, 0);
  const totalDireitos = mockData.direitos.reduce(
    (sum, item) => sum + item.valor,
    0
  );
  const totalObrigacoes = mockData.obrigacoes.reduce(
    (sum, item) => sum + item.valor,
    0
  );
  const patrimonioLiquido = totalBens + totalDireitos - totalObrigacoes;

  document.getElementById("totalBens").textContent = formatCurrency(totalBens);
  document.getElementById(
    "bensMeta"
  ).textContent = `${mockData.bens.length} itens registrados`;

  document.getElementById("totalDireitos").textContent =
    formatCurrency(totalDireitos);
  document.getElementById(
    "direitosMeta"
  ).textContent = `${mockData.direitos.length} direitos ativos`;

  document.getElementById("totalObrigacoes").textContent =
    formatCurrency(totalObrigacoes);
  document.getElementById(
    "obrigacoesMeta"
  ).textContent = `${mockData.obrigacoes.length} obrigações pendentes`;

  const patrimonioEl = document.getElementById("patrimonioLiquido");
  patrimonioEl.textContent = formatCurrency(patrimonioLiquido);
  patrimonioEl.className = `card-value ${
    patrimonioLiquido >= 0 ? "success" : "danger"
  }`;
  document.getElementById("patrimonioMeta").textContent =
    patrimonioLiquido >= 0 ? "Positivo" : "Negativo";
}

// Render bens
function renderBens(dadosCompletos) {
    const grid = document.getElementById("bensGrid");

    grid.innerHTML = ''; 

    dadosCompletos.forEach(bem => {
        const itemCard = document.createElement('div');
        itemCard.className = 'item-card';

        itemCard.innerHTML = `
            <div class="item-content">
                <div class="item-info">
                    <h3>${bem.nome}</h3>
                    <p>${bem.categoria}</p>
                    <div class="item-value primary">${formatCurrency(
                      bem.valor
                    )}</div>
                </div>
                <div class="item-ser">
                  <span class="badge ${getBadgeClass(bem.status)}">
                    ${bem.status}
                  </span>

                  <span id="lixo" class="material-icons delete-icon" data-id="${bem.id}">delete</span>
                <div/>
            </div>
        `;
        
        const deleteIcon = itemCard.querySelector('.delete-icon');
        if (deleteIcon) {
            deleteIcon.addEventListener('click', async () => {
                excluirRegistro(bem.id); 
            });
        }

        grid.appendChild(itemCard);
    });
}

// Render direitos
function renderDireitos(dadosCompletos) {
  const grid = document.getElementById("direitosGrid");
  
  grid.innerHTML = ''; 

  dadosCompletos.forEach(direito =>{
      const itemCard = document.createElement('div');
      itemCard.className = 'item-card';
      const dataVencimento = new Date(direito.vencimento + "T00:00:00");

      itemCard.innerHTML = `<div class="item-content">
                                <div class="item-info">
                                    <h3>${direito.descricao}</h3>                 
                                    <p>Vencimento: ${dataVencimento.toLocaleDateString(
                                      "pt-BR"
                                    )}</p>
                                    <div class="item-value success">${formatCurrency(
                                      direito.valor
                                    )}</div>
                                </div>
                                <div class="item-ser">
                                  <span class="badge ${getBadgeClass(direito.status)}">
                                    ${direito.status}
                                  </span>

                                  <span class="material-icons delete-icon" data-id="${direito.id}">delete</span>
                                <div/>
                            </div>`

      const deleteIcon = itemCard.querySelector('.delete-icon');
      if (deleteIcon) {
          deleteIcon.addEventListener('click', async () => {
              excluirRegistro(direito.id); 
          });
      }

      grid.appendChild(itemCard);
  })
}

// Render obrigações
function renderObrigacoes(dadosCompletos) {
  const grid = document.getElementById("obrigacoesGrid");

  grid.innerHTML = ''; 

  dadosCompletos.forEach(obrigacao =>{
    const itemCard = document.createElement('div');
    itemCard.className = 'item-card';
    const dataVencimento = new Date(obrigacao.vencimento + "T00:00:00");

    itemCard.innerHTML = `<div class="item-content">
                              <div class="item-info">
                                  <h3>${obrigacao.descricao}</h3>
                                  <p>Vencimento: ${dataVencimento.toLocaleDateString(
                                    "pt-BR"
                                  )}</p>
                                  <div class="item-value danger">${formatCurrency(
                                    obrigacao.valor
                                  )}</div>

                              </div>
                              <div class="item-ser">
                                <span class="badge ${getBadgeClass(obrigacao.status)}">
                                  ${obrigacao.status}
                                </span>

                                <span class="material-icons delete-icon" data-id="${obrigacao.id}">delete</span>
                              <div/>
                          </div>`

    const deleteIcon = itemCard.querySelector('.delete-icon');
    if (deleteIcon) {
        deleteIcon.addEventListener('click', async () => {
            excluirRegistro(obrigacao.id); 
        });
    }

    grid.appendChild(itemCard);
  })
}

let tipoRegistroAtual = "";

function abrirModal(tipo) {
  tipoRegistroAtual = tipo;
  document.getElementById("modalTitulo").innerText = `Adicionar ${tipo}`;
  document.getElementById("modalRegistro").style.display = "block";

  // Limpa campos
  document.getElementById("inputTitulo").value = "";
  document.getElementById("inputValor").value = "";
  document.getElementById("inputDescricao").value = "";
  document.getElementById("inputMetodoPagamento").value = "";
  document.getElementById("inputVencimento").value = "";

  // Mostrar vencimento APENAS para Direito e Obrigação
  if (tipo === "Direito" || tipo === "Obrigação") {
    document.getElementById("campoVencimento").style.display = "block";
  } else {
    document.getElementById("campoVencimento").style.display = "none";
  }

  // CSS para centralizar o modal
  const modalOverlay = document.getElementById("modalRegistro");
  modalOverlay.style.display = "flex";
  modalOverlay.style.justifyContent = "center";
  modalOverlay.style.alignItems = "center";
}

function fecharModal() {
  document.getElementById("modalRegistro").style.display = "none";
}

async function salvarRegistro() {
  const titulo = document.getElementById("inputTitulo").value;
  const valor = parseFloat(document.getElementById("inputValor").value);
  const descricao = document.getElementById("inputDescricao").value;
  const tipo = document.getElementById("inputTipo").value;
  const vencimento = document.getElementById("inputVencimento").value;
  const metodoPagamento = document.getElementById("inputMetodoPagamento").value;

  //const id = Date.now();

  if (!titulo || !valor) {
    alert("Preencha título e valor!");
    return;
  }

  let dadosSalvar = {};
  let dataAtual = new Date();
  let dataCorrigida = formatarDataParaMySQL(dataAtual);

  if (tipoRegistroAtual === "Bem") {
    dadosSalvar = {
      id: userId,
      nome: titulo,
      descricao: descricao,
      valor,
      status: tipo,
      pagamento: metodoPagamento,
      data: dataCorrigida,
      tipoRegistro: "bens",
    };
    await enviarAtualizacao(dadosSalvar);
    filtrarErenderizarBens("");
  } else if (tipoRegistroAtual === "Direito") {
    dadosSalvar = {
      id: userId,
      nome: titulo,
      descricao: descricao,
      valor,
      status: tipo,
      pagamento: metodoPagamento,
      data: vencimento || "Não informado",
      tipoRegistro: "direitos",
    };
    await enviarAtualizacao(dadosSalvar);
    filtrarErenderizarDireitos("");
  } else if (tipoRegistroAtual === "Obrigação") {
    dadosSalvar = {
      id: userId,
      nome: titulo,
      descricao: descricao,
      valor,
      status: tipo,
      pagamento: metodoPagamento,
      data: vencimento || "Não informado",
      tipoRegistro: "obrigacoes",
    };
    await enviarAtualizacao(dadosSalvar);
    filtrarErenderizarObrigacoes("");
  }

  fecharModal();
  updateSummary();
}

async function enviarAtualizacao(dadosSalvar) {
  const API_URL_SALVAR = "http://localhost:8081/transacao";

  try {
    const response = await fetch(API_URL_SALVAR, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(dadosSalvar),
    });

    const result = await response.json();

    if (response.ok) {
      await BuscarDados();
      //alert(`Bem-vindo, ${result.user.nome}! Login realizado.`);
    } else {
      alert(`Falha no cadastro de ativos ou passivos: ${result.error}`);
    }
  } catch (error) {
    console.error(
      "Erro na requisição POST de atualizar passivos e ativos:",
      error
    );
    alert("Erro de conexão com o servidor. Tente novamente.");
  }
}

function formatarDataParaMySQL(dataObj) {
  const isoString = dataObj.toISOString();
  const mysqlDateTime = isoString.slice(0, 19).replace("T", " ");
  return mysqlDateTime;
}

const campoBuscaDireitos = document.getElementById("campo-busca-direitos");
const campoBuscaBens = document.getElementById("campo-busca-bens");
const campoBuscaObrigacoes = document.getElementById("campo-busca-obrigacoes");

campoBuscaDireitos.addEventListener("keyup", (event) => {
  const termo = event.target.value.toLowerCase();
  filtrarErenderizarDireitos(termo);
});

campoBuscaBens.addEventListener("keyup", (event) => {
  const termo = event.target.value.toLowerCase();
  filtrarErenderizarBens(termo);
});

campoBuscaObrigacoes.addEventListener("keyup", (event) => {
  const termo = event.target.value.toLowerCase();
  filtrarErenderizarObrigacoes(termo);
});

function filtrarErenderizarDireitos(termoDeBusca) {
  const dadosCompletos = mockData.direitos;

  if (!termoDeBusca) {
    // Se o campo de busca estiver vazio, renderiza todos os dados
    return renderDireitos(dadosCompletos);
  }

  const resultadosFiltrados = dadosCompletos.filter((item) => {
    return item.descricao.toLowerCase().startsWith(termoDeBusca);
  });

  renderDireitos(resultadosFiltrados);
}

function filtrarErenderizarBens(termoDeBusca) {
  const dadosCompletos = mockData.bens;

  if (!termoDeBusca) {
    // Se o campo de busca estiver vazio, renderiza todos os dados
    return renderBens(dadosCompletos);
  }

  const resultadosFiltrados = dadosCompletos.filter((item) => {
    return item.nome.toLowerCase().startsWith(termoDeBusca);
  });

  renderBens(resultadosFiltrados);
}

function filtrarErenderizarObrigacoes(termoDeBusca) {
  const dadosCompletos = mockData.obrigacoes;

  if (!termoDeBusca) {
    // Se o campo de busca estiver vazio, renderiza todos os dados
    return renderObrigacoes(dadosCompletos);
  }

  const resultadosFiltrados = dadosCompletos.filter((item) => {
    return item.descricao.toLowerCase().startsWith(termoDeBusca);
  });

  renderObrigacoes(resultadosFiltrados);
}

async function excluirRegistro(idGasto) {

    let id = parseInt(userId);

    const urlExclusao = `http://localhost:8081/apagar?idGasto=${idGasto}&userId=${id}`;

    try {
        const response = await fetch(urlExclusao, {
            method: 'DELETE',
        });

        if (response.ok) {
            //alert("Registro excluído com sucesso!");
            //await BuscarDados(); 
            //await window.location.reload();
            await BuscarDados();
        } else {
            const result = await response.json();
            alert(`Falha na exclusão: ${result.message || result.error}`);
        }
    } catch (error) {
        console.error("Erro ao tentar excluir registro:", error);
        alert("Erro de conexão ao excluir. Tente novamente.");
    }
}

// Initialize
document.addEventListener("DOMContentLoaded", function () {
  lucide.createIcons();

  // Mobile menu toggle
  const mobileMenuBtn = document.getElementById("mobileMenuBtn");
  const mobileMenu = document.getElementById("mobileMenu");

  if (mobileMenuBtn && mobileMenu) {
    mobileMenuBtn.addEventListener("click", function () {
      mobileMenu.classList.toggle("open");

      const icon = mobileMenuBtn.querySelector("i");
      if (mobileMenu.classList.contains("open")) {
        icon.setAttribute("data-lucide", "x");
      } else {
        icon.setAttribute("data-lucide", "menu");
      }
      lucide.createIcons();
    });
  }

  // Tab functionality
  const tabTriggers = document.querySelectorAll(".tab-trigger");
  const tabContents = document.querySelectorAll(".tab-content");

  tabTriggers.forEach((trigger) => {
    trigger.addEventListener("click", function () {
      const tabName = this.getAttribute("data-tab");

      // Remove active class from all triggers and contents
      tabTriggers.forEach((t) => t.classList.remove("active"));
      tabContents.forEach((c) => c.classList.remove("active"));

      // Add active class to clicked trigger and corresponding content
      this.classList.add("active");
      document.getElementById(`${tabName}-tab`).classList.add("active");
    });
  });
});
