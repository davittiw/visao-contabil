const express = require('express');
const app = express();
const cors = require('cors');
const db = require('./bd');
let clientes = [];

app.use(cors());
app.use(express.json());

/*app.get('/', async function(req, res){
    try {
        clientes = await db.todosClientes(); 
        res.status(200).json(clientes);
    } catch (error) {
        console.error("Erro ao buscar clientes:", error);
        res.status(500).json({ error: "Erro interno do servidor." });
    }
});*/

app.post('/cadastro', async function(req, res){
    const novoCliente = req.body; 

    if (!novoCliente || !novoCliente.nome || !novoCliente.telefone || !novoCliente.email || !novoCliente.senha) {
        return res.status(400).json({ error: "Nome e Idade são obrigatórios." });
    }

    try {
        await db.insereCliente(novoCliente);
        
        res.status(201).json({ 
            message: "Cliente inserido com sucesso!", 
            cliente: novoCliente 
        });
    } catch (error) {
        console.error("Erro ao inserir cliente:", error);
        res.status(500).json({ error: "Erro interno do servidor ao inserir cliente." });
    }
});

app.post('/login', async (req, res) => {

    const { email, senha } = req.body; 

    if (!email || !senha) {
        return res.status(400).json({ error: "Email e senha são obrigatórios." });
    }

    try {
        const usuario = await db.buscaUsuarioPorEmail(email); 

        if (!usuario) {
            return res.status(401).json({ error: "Credenciais inválidas." });
        }

        if (usuario.senha === senha) { 
            return res.status(200).json({ 
                message: "Login realizado com sucesso!",
                user: { id: usuario.usuario_id, nome: usuario.nome, email: usuario.email }
            });
        } else {
            return res.status(401).json({ error: "Credenciais inválidas." });
        }

    } catch (error) {
        console.error("Erro no processo de login:", error);
        return res.status(500).json({ error: "Erro interno do servidor." });
    }
});

app.get('/BuscarDados/:userId', async (req, res) => {

    const userId = req.params.userId;

    if (!userId) {
        return res.status(400).json({ error: "ID do usuário não fornecido." });
    }

    try {
        const dadosPatrimonio = await db.getDadosCompletosPatrimonio(userId); 
        
        if (dadosPatrimonio) {
            res.status(200).json(dadosPatrimonio);
        } else {
            res.status(404).json({ message: "Nenhum dado encontrado para este usuário." });
        }

    } catch (error) {
        console.error(`Erro ao buscar dados para o usuário ${userId}:`, error);
        res.status(500).json({ error: "Erro interno do servidor ao processar a solicitação." });
    }
});

app.post('/transacao', async (req, res) => {
    const dadosTransacao = req.body; 

    if (!dadosTransacao.nome || !dadosTransacao.valor || !dadosTransacao.status || !dadosTransacao.id) {
        return res.status(400).json({ error: "Título, valor, tipo e ID do usuário são obrigatórios." });
    }

    if (dadosTransacao.status !== 'Ativo' && dadosTransacao.status !== 'Passivo') {
        return res.status(400).json({ error: "O tipo deve ser 'ativo' ou 'passivo'." });
    }
    
    if (!dadosTransacao.vencimento) {
        dadosTransacao.vencimento = new Date();
    }

    try {
        await db.insereAtivoOuPassivo(dadosTransacao);
        
        res.status(201).json({ 
            message: `${dadosTransacao.status} cadastrado com sucesso!`, 
            transacao: dadosTransacao 
        });

    } catch (error) {
        console.error("Erro ao inserir transação:", error);
        res.status(500).json({ error: "Erro interno ao salvar transação." });
    }
});

app.delete('/apagar', async (req, res) => {
    const idGasto = req.query.idGasto;
    const idUsuario = req.query.userId; 

    if (!idGasto || !idUsuario) {
        return res.status(400).json({ error: "IDs necessários para exclusão." });
    }

    try {
        const linhasAfetadas = await db.excluirAtivoOuPassivo(idGasto, idUsuario);

        if (linhasAfetadas === 0) {
            return res.status(404).json({ message: "Transação não encontrada ou acesso negado." });
        }
        
        res.status(200).json({ message: "Transação excluída com sucesso." });

    } catch (error) {
        console.error("Erro ao excluir transação:", error);
        res.status(500).json({ error: "Erro interno do servidor." });
    }
});

app.listen(8081, () => {
    console.log('Servidor rodando na porta 8081');
});

