const conectar = async () => {
    if (global.conexao && global.conexao.state != 'disconnected')
        return global.conexao;

    const mysql = require('mysql2/promise');
    const con = mysql.createConnection("mysql://root:marcolimaoJNRA121@localhost:3306/patrimonio_db");
    global.conexao = con;
    return con;
}

//const todosClientes = async ()=>{
//    const con = await conectar();
//    const [linhas] = await con.query('SELECT * FROM FUNCIONARIO');
//    return await linhas;
//}

const insereCliente = async (cliente)=>{
    const con = await conectar()
    const sql = 'INSERT INTO cadastro (nome, email, senha, telefone) VALUES (?, ?, ?, ?);'
    const valores = [
        cliente.nome, 
        cliente.email, 
        cliente.senha,
        cliente.telefone
    ];
    await con.query(sql,valores)
}

const buscaUsuarioPorEmail = async (email) => {
    const con = await conectar();
    const sql = 'SELECT id, nome, email, senha, telefone FROM cadastro WHERE email = ?';
    const [linhas] = await con.query(sql, [email]);
    return linhas[0]; 
};

const getDadosCompletosPatrimonio = async (userId) => {
    // 1. Executa a primeira consulta (Bens)
    const bens = await queryBens(userId); 
    
    // 2. Executa a segunda consulta (Direitos)
    const direitos = await queryDireitos(userId);
    
    // 3. Executa a terceira consulta (Obrigações)
    const obrigacoes = await queryObrigacoes(userId);

    const resultadoFinal = {
        bens: bens,
        direitos: direitos,
        obrigacoes: obrigacoes
    };

    return resultadoFinal;
};

const queryBens = async (userId) => {
    const con = await conectar();

    const sql = `
        SELECT
            id_do_gasto AS id,
            titulo_gasto AS nome,
            descricao_gasto AS categoria,
            valor,
            -- Simula o campo status (Se Manutenção for uma regra de negócio que você deve aplicar)
            CASE
                WHEN descricao_gasto LIKE '%Manutenção%' THEN 'Manutenção'
                ELSE 'Ativo'
            END AS status 
        FROM
            entd_psv_atv
        WHERE
            id_usuario = ?
            AND tipo = 'ativo'
            AND tipo_ativo = 'bens'
        ORDER BY
            valor DESC;
    `;

    const [linhas] = await con.query(sql, [userId]);
    return linhas;
};

const queryDireitos = async (userId) => {
    const con = await conectar();

    const sql = `
        SELECT
            id_do_gasto AS id,
            titulo_gasto AS descricao,
            valor,
            DATE_FORMAT(data_e_hora, '%Y-%m-%d') AS vencimento,
            'Ativo' AS status
        FROM
            entd_psv_atv
        WHERE
            id_usuario = ? 
            AND tipo = 'ativo'
            AND tipo_ativo = 'direitos' 
        ORDER BY
            data_e_hora ASC;
    `;

    const [linhas] = await con.query(sql, [userId]);
    return linhas;
};

const queryObrigacoes = async (userId) => {
    const con = await conectar();

    const sql = `
        SELECT
            id_do_gasto AS id,
            titulo_gasto AS descricao,
            valor,
            DATE_FORMAT(data_e_hora, '%Y-%m-%d') AS vencimento,
            'Pendente' AS status       
        FROM
            entd_psv_atv
        WHERE
            id_usuario = ? 
            AND tipo_ativo = 'obrigacoes'
        ORDER BY
            valor DESC;
    `;

    const [linhas] = await con.query(sql, [userId]);
    return linhas;
};

const insereAtivoOuPassivo = async (dados) => {
    const con = await conectar();
    
    const sql = `
        INSERT INTO entd_psv_atv (
            data_e_hora, 
            titulo_gasto, 
            valor, 
            metodo_pagamento, 
            tipo, 
            descricao_gasto, 
            id_usuario,
            tipo_ativo 
        ) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;

    let valores = [];

    valores = [
        dados.data,
        dados.nome, 
        dados.valor, 
        dados.pagamento,
        dados.status,
        dados.descricao, 
        dados.id,
        dados.tipoRegistro
    ];
    
    await con.query(sql, valores);
    return true;
};

//const atualizaUsuario = async (id,cliente)=>{
//    const con = await conectar()
//    const sql = 'UPDATE cliente_node SET nome=?,idade=? WHERE id=?'
//    const valores=[cliente.nome,cliente.idade,id]
//    console.log(id)
//    console.log(cliente.nome)
//    console.log(cliente.idade)
//    await con.query(sql,valores)
//}

module.exports = {insereCliente, buscaUsuarioPorEmail, getDadosCompletosPatrimonio, insereAtivoOuPassivo}