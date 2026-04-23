import express from "express"
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express()

app.use(express.static(path.join(__dirname, 'public')));
app.set('views', path.join(__dirname, 'views'));
app.set('views', './views')

app.get('/', (req, res) => {

    res.render('index')
})

app.get('/login', (req, res) => {

    res.render('login')
})

app.get('/cadastro', (req, res) => {

    res.render('cadastro')
})


app.listen(3000)

export default app;