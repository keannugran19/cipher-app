const express = require('express')
const app = express()
const path = require('path')
const hbs = require('hbs')
const collection = require('./mongodb')

// CSS
app.use(express.static('../public'));
// CSS

const templatePath = path.join(__dirname, '../templates')

app.use(express.json())
app.set('view engine', 'hbs')
app.set('views', templatePath)
app.use(express.urlencoded({ extended: false }))

app.get('/', (req, res) => {
    res.render('login')
})

app.get('/login', (req, res) => {
    res.render('login')
})

app.get('/signup', (req, res) => {
    res.render('signup')
})

app.post('/signup', async (req, res) => {
    const data = {
        username: req.body.username,
        password: req.body.password
    }

    await collection.insertMany([data])

    res.render('login')

})

app.post('/login', async (req, res) => {

    try {
        const check = await collection.findOne({ username: req.body.username })

        if (check.password === req.body.password) {
            res.render('home')
        } else {
            res.send('wrong password')
        }
    } catch {

        res.send('Account not found!')

    }

})

app.listen(3000, () => {
    console.log('port connected');
})