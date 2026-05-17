import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import session from "express-session";
import bcrypt from "bcrypt";
import 'dotenv/config'

const app = express();
const port = 3000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));

app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        maxAge: 3600000
    }
}))
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

function requireAuth(req, res, next) {
    if (req.session.usuarioLogado) {
        return next();
    }
    res.redirect('/login');
}

app.get('/', requireAuth, (req, res) => {
    res.render('index', { user: req.session.usuarioLogado });
})

app.get('/login', (req, res) => {

    res.render('login')
})

app.get('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return console.log(err);
        }
        res.redirect('/');
    });
});


app.get('/cadastro', (req, res) => {

    res.render('cadastro')
})

app.post('/login', async (req, res) => {
    const { email, password } = req.body;
    console.log("Tentativa de login:", { email });

    const dadosBrutos = fs.readFileSync(path.join(__dirname, 'usuarios.json'), 'utf8');
    const usuarios = JSON.parse(dadosBrutos);

    const usuarioEncontrado = usuarios.find(usuario => usuario.email === email);

    if (usuarioEncontrado && await bcrypt.compare(password, usuarioEncontrado.password)) {
        req.session.usuarioLogado = usuarioEncontrado;
        console.log("Login bem-sucedido:", { email });
        res.redirect('/');
    } else {
        console.log("Login falhou:", { email });
        res.send('E-mail ou senha incorretos');
    }
});

app.post('/cadastro', async (req, res) => {
    const { name, email, password, confirmPassword } = req.body;

    const dadosBrutos = fs.readFileSync(path.join(__dirname, 'usuarios.json'), 'utf8');
    const usuarios = JSON.parse(dadosBrutos)

    const cadastroEncontrado = usuarios.find(usuario => usuario.email === email);

    if (password.length < 8) {
        return res.send('A senha deve ter pelo menos 8 caracteres');
    }
    if (password !== confirmPassword){
        return res.send('As senhas não conferem');
    }
    if (cadastroEncontrado){
        return res.send('Usuário já cadastrado');
    }

    const senhaHash = await bcrypt.hash(password, 10);

    const novoUsuario = {
        id: Date.now(),
        name: name,
        email: email,
        password: senhaHash,
        type: 'user'
    }

    usuarios.push(novoUsuario);
    fs.writeFileSync(path.join(__dirname, 'usuarios.json'), JSON.stringify(usuarios, null, 2), 'utf8');

    console.log("Novo cadastro:", { name, email });

    res.redirect('/login');
});


app.listen(port, () => {
    console.log(`Servidor rodando em http://localhost:${port}`);
});
