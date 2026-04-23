import express from "express"

const app = express()

app.use(express.static('public'))
app.set('view engine', 'ejs')
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