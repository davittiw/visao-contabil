const conectar = async () => {
    if (global.conexao && global.conexao.state != 'disconnected')
        return global.conexao;

    const mysql = require('mysql2/promise');
    const con = mysql.createConnection({
      host: "turntable.proxy.rlwy.net",
      port: 46509,
      user: "root",
      password: "AGwNtryZDNHSIVfwilcAXGpcOEirqgJL",
      database: "visaocontabil",
    });
    global.conexao = con;
    return con;
}

const insereCliente = async (cliente)=>{
    const con = await conectar()
    const sql = 'INSERT INTO cadastro (email, senha, nome, telefone) VALUES (?, ?, ?, ?);'
    const valores = [
        cliente.email, 
        cliente.senha, 
        cliente.nome,
        cliente.telefone
    ];
    await con.query(sql,valores)
}

const buscaUsuarioPorEmail = async (email) => {
    const con = await conectar();
    const sql = 'SELECT usuario_id, email, senha, nome, telefone FROM cadastro WHERE email = ?';
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
            gasto_id AS id,
            titulo AS nome,
            descricao AS categoria,
            valor,
            -- Simula o campo status (Se Manutenção for uma regra de negócio que você deve aplicar)
            CASE
                WHEN descricao LIKE '%Manutenção%' THEN 'Manutenção'
                ELSE 'Ativo'
            END AS status 
        FROM
            entd_psv_atv
        WHERE
            usuario_id = ?
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
            gasto_id AS id,
            titulo AS descricao,
            valor,
            DATE_FORMAT(data_hora, '%Y-%m-%d') AS vencimento,
            'Ativo' AS status
        FROM
            entd_psv_atv
        WHERE
            usuario_id = ? 
            AND tipo = 'ativo'
            AND tipo_ativo = 'direitos' 
        ORDER BY
            data_hora ASC;
    `;

    const [linhas] = await con.query(sql, [userId]);
    return linhas;
};

const queryObrigacoes = async (userId) => {
    const con = await conectar();

    const sql = `
        SELECT
            gasto_id AS id,
            titulo AS descricao,
            valor,
            DATE_FORMAT(data_hora, '%Y-%m-%d') AS vencimento,
            'Pendente' AS status       
        FROM
            entd_psv_atv
        WHERE
            usuario_id = ? 
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
            usuario_id,
            data_hora, 
            titulo, 
            valor, 
            pagamento, 
            tipo, 
            descricao, 
            tipo_ativo 
        ) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;

    let valores = [];

    valores = [
        dados.id,
        dados.data,
        dados.nome, 
        dados.valor, 
        dados.pagamento,
        dados.status,
        dados.descricao, 
        dados.tipoRegistro
    ];
    
    await con.query(sql, valores);
    return true;
};

const excluirAtivoOuPassivo = async (idGasto, idUsuario) =>{
    const con = await conectar();
    
    const sql = `
        DELETE FROM entd_psv_atv
        WHERE gasto_id = ?
          AND usuario_id = ?;
    `;

    const [resultado] = await con.query(sql, [idGasto, idUsuario]);
    return resultado.affectedRows;
}

module.exports = {insereCliente, buscaUsuarioPorEmail, getDadosCompletosPatrimonio, insereAtivoOuPassivo, excluirAtivoOuPassivo}