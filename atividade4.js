const express = require('express');
const session = require('express-session');
const app = express();
const porta = 3001;
const host = '0.0.0.0';

app.use(express.urlencoded({ extended: true }));
app.use(express.static('./pages/public'));

app.use(session({
    secret: 'minha_chave_secreta',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }
}));

let listaProdutos = [];

function autenticar(req, res, next) {
    if (req.session && req.session.logado) {
        next();
    } else {
        res.redirect('/login');
    }
}

app.get('/', (req, res) => {
    res.send(`
        <html>
            <head>
                <title>Bem-vindo</title>
                <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
            </head>
            <body class="bg-light d-flex justify-content-center align-items-center vh-100">
                <div class="text-center">
                    <h1>Bem-vindo</h1>
                    <a class="btn btn-primary btn-lg" href="/login">Login</a>
                </div>
            </body>
        </html>
    `);
});

app.get('/login', (req, res) => {
    res.sendFile(__dirname + '/pages/public/login.html');
});

app.post('/login', (req, res) => {
    const { usuario, senha } = req.body;

    if (usuario === 'admin' && senha === '123') {
        req.session.logado = true;
        res.redirect('/cadastrarProduto');
    } else {
        res.send(`
            <div class="alert alert-danger" role="alert">
                Usuário ou senha inválidos!
            </div>
            <a href="/login" class="btn btn-primary">Tentar Novamente</a>
        `);
    }
});

app.get('/cadastrarProduto', autenticar, (req, res) => {
    res.send(`
        <html>
            <head>
                <title>Cadastro de Produtos</title>
                <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
            </head>
            <body class="bg-light">
                <div class="container mt-5">
                    <h1>Cadastro de Produtos</h1>
                    <form method="POST" action="/cadastrarProduto" class="border p-4">
                        <div class="mb-3">
                            <label for="codigoBarras" class="form-label">Código de Barras</label>
                            <input type="text" class="form-control" id="codigoBarras" name="codigoBarras" required>
                        </div>
                        <div class="mb-3">
                            <label for="descricao" class="form-label">Descrição</label>
                            <input type="text" class="form-control" id="descricao" name="descricao" required>
                        </div>
                        <div class="mb-3">
                            <label for="precoCusto" class="form-label">Preço de Custo</label>
                            <input type="number" step="0.01" class="form-control" id="precoCusto" name="precoCusto" required>
                        </div>
                        <div class="mb-3">
                            <label for="precoVenda" class="form-label">Preço de Venda</label>
                            <input type="number" step="0.01" class="form-control" id="precoVenda" name="precoVenda" required>
                        </div>
                        <div class="mb-3">
                            <label for="dataValidade" class="form-label">Data de Validade</label>
                            <input type="date" class="form-control" id="dataValidade" name="dataValidade" required>
                        </div>
                        <div class="mb-3">
                            <label for="qtdEstoque" class="form-label">Qtd em Estoque</label>
                            <input type="number" class="form-control" id="qtdEstoque" name="qtdEstoque" required>
                        </div>
                        <div class="mb-3">
                            <label for="nomeFabricante" class="form-label">Nome do Fabricante</label>
                            <input type="text" class="form-control" id="nomeFabricante" name="nomeFabricante" required>
                        </div>
                        <button type="submit" class="btn btn-primary">Cadastrar</button>
                    </form>
                    <a class="btn btn-secondary mt-2" href="/listarProdutos">Ver Produtos</a>
                </div>
            </body>
        </html>
    `);
});

app.post('/cadastrarProduto', autenticar, (req, res) => {
    const { codigoBarras, descricao, precoCusto, precoVenda, dataValidade, qtdEstoque, nomeFabricante } = req.body;
    const erros = [];

    if (!codigoBarras) erros.push("Código de barras é obrigatório.");
    if (!descricao) erros.push("Descrição é obrigatória.");
    if (Number(precoCusto) > Number(precoVenda)) erros.push("Preço de custo não pode ser maior que o preço de venda.");
    if (new Date(dataValidade) < new Date()) erros.push("Data de validade deve ser futura.");
    if (Number(qtdEstoque) < 0) erros.push("Quantidade em estoque não pode ser negativa.");
    if (!nomeFabricante) erros.push("Nome do fabricante é obrigatório.");

    if (erros.length > 0) {
        return res.send(`
            <div class="alert alert-danger" role="alert">
                ${erros.join('<br>')}
            </div>
            <a href="/cadastrarProduto" class="btn btn-primary">Voltar</a>
        `);
    }

    listaProdutos.push({ codigoBarras, descricao, precoCusto, precoVenda, dataValidade, qtdEstoque, nomeFabricante });
    res.redirect('/listarProdutos');
});

app.get('/listarProdutos', autenticar, (req, res) => {
    res.send(`
        <html>
            <head>
                <title>Produtos Cadastrados</title>
                <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
            </head>
            <body class="bg-light">
                <div class="container mt-5">
                    <h1>Produtos Cadastrados</h1>
                    <table class="table">
                        <thead>
                            <tr>
                                <th>Código de Barras</th>
                                <th>Descrição</th>
                                <th>Preço de Custo</th>
                                <th>Preço de Venda</th>
                                <th>Data de Validade</th>
                                <th>Qtd Estoque</th>
                                <th>Fabricante</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${listaProdutos.map(produto => `
                                <tr>
                                    <td>${produto.codigoBarras}</td>
                                    <td>${produto.descricao}</td>
                                    <td>R$ ${produto.precoCusto}</td>
                                    <td>R$ ${produto.precoVenda}</td>
                                    <td>${produto.dataValidade}</td>
                                    <td>${produto.qtdEstoque}</td>
                                    <td>${produto.nomeFabricante}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                    <a class="btn btn-primary" href="/cadastrarProduto">Cadastrar Novo Produto</a>
                    <a class="btn btn-danger" href="/logout">Sair</a>
                </div>
            </body>
        </html>
    `);
});

app.get('/logout', (req, res) => {
    req.session.destroy(() => {
        res.redirect('/login');
    });
});

app.listen(porta, host, () => {
    console.log(`Servidor rodando em http://${host}:${porta}`);
});
