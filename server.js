import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import session from "express-session";


const app = express();
const port = 3000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));

app.use(session({
    secret: '040512142023dr',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: false,
        httpOnly: true,
        maxAge: 3600000
    }
}))
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.get('/', (req, res) => {

    const usuarioLogado = req.session.usuarioLogado;

    res.render('index', { user: usuarioLogado });
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

app.post('/login', (req, res) => {
    const { email, password } = req.body;
    console.log("Tentativa de login:", { email, password });
    
    const dadosBrutos = fs.readFileSync('usuarios.json');
    const usuarios = JSON.parse(dadosBrutos);
    
    const usuarioEncontrado = usuarios.find(usuario => usuario.email === email && usuario.password === password);

    if(usuarioEncontrado){
        req.session.usuarioLogado = usuarioEncontrado;
        res.redirect('/');
        console.log("Login bem-sucedido:", { email, password });
    }else{
        res.send('Usuário não encontrado')
        console.log("Login falhou:", { email, password });
    }

});

app.post('/cadastro', (req, res) => {
    const { name, email, password, confirmPassword } = req.body;
    
    const dadosBrutos = fs.readFileSync('usuarios.json')
    const usuarios = JSON.parse(dadosBrutos)

    const cadastroEncontrado = usuarios.find(usuario => usuario.email === email);

    if (password !== confirmPassword){
        return res.send('As senhas não conferem');
    }
    if (cadastroEncontrado){
        return res.send('Usuário já cadastrado');
    }

    const novoUsuario = {
        id: Date.now(),
        name: name,
        email: email,
        password: password,
        type: 'user'
    }

    usuarios.push(novoUsuario);
    fs.writeFileSync('usuarios.json', JSON.stringify(usuarios, null, 2));
    
    console.log("Novo cadastro:", { name, email, password });
    
    res.redirect('/login');
});


app.listen(port, () => {
    console.log(`Servidor rodando em http://localhost:${port}`);
});
