Configuração e dependências 

É necessário ter node.js e mysql instalados para executar o programa.

O gerenciador de pacotes utilizado foi -> npm.

Abra o terminal na pasta raiz do projeto (VISAO-CONTABIL) e execute: npm install

Para que o projeto funcione, as seguintes bibliotecas devem ser instaladas:
express -> npm install express
mysql2 -> npm install mysql2
cors -> npm install cors
nodemon -> npm install -g nodemon

--------------------------------------------------------------------------------------------------------------------------------

Rodar o projeto:

Rode o servidor MYSQL com o banco de dados
Rode o servidor backend -> abra o terminal -> tire o powershell e coloque cmd -> entre na pasta visao-contabil/backend -> e rode o código: nodemon back.js

Obs: caso o codigo: nodemon back.js não rodar use esse -> node back.js
Obs: Apos inserir o codigo o cursor ficará parado indicando que o servidor ta rodando
Obs: Endereço do servidor: http://localhost:8081/