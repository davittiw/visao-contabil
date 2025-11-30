const conectar = async () => {
    if (global.conexao && global.conexao.state != 'disconnected')
        return global.conexao;

    const mysql = require('mysql2/promise');
    const con = mysql.createConnection("mysql://root:senha@localhost:3306/bancoAqui");
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
    const sql = 'INSERT INTO USUARIO (cd_cpf, nome, email, senha_hash) VALUES (?, ?, ?, ?);'
    const valores = [
        cliente.cpf,
        cliente.nome, 
        cliente.email, 
        cliente.senha
    ];
    await con.query(sql,valores)
}

const buscaUsuarioPorEmail = async (email) => {
    const con = await conectar();
    const sql = 'SELECT cd_cpf, nome, email, senha_hash FROM USUARIO WHERE email = ?';
    const [linhas] = await con.query(sql, [email]);
    return linhas[0]; 
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

module.exports = {insereCliente, buscaUsuarioPorEmail}