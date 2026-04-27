import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";


const app = express();
const port = 3000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));


app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.get('/', (req, res) => {

    res.render('index')
})

app.get('/login', (req, res) => {

    res.render('login')
})

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
        res.redirect('/');
    }else{
        res.send('Usuário não encontrado')
    }

});

app.post('/cadastro', (req, res) => {
    const { nome, email, password, confirmPassword } = req.body;
    
    if (password !== confirmPassword){
        res.send('As senhas não conferem');
    }
    const dadosBrutos = fs.readFileSync('usuarios.json')
    const usuarios = JSON.parse(dadosBrutos)

    const novoUsuario = {
        id: Date.now(),
        nome: nome,
        email: email,
        password: password
    }

    usuarios.push(novoUsuario);
    fs.writeFileSync('usuarios.json', JSON.stringify(usuarios, null, 2));
    
    console.log("Novo cadastro:", { nome, email, password });
    
    res.redirect('/login');
});


app.listen(port, () => {
    console.log(`Servidor rodando em http://localhost:${port}`);
});
