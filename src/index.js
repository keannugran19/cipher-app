const express = require('express')
const app = express()
const path = require('path')
const hbs = require('hbs')
const collection = require('./mongodb')

// CSS
app.use(express.static('public'));
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

app.get('/home', (req, res) => {
    res.render('home')
})

app.get('/atbash', (req, res) => {
    res.render('atbash')
})

app.get('/caesar', (req, res) => {
    res.render('caesar')
})

app.get('/vigenere', (req, res) => {
    res.render('vigenere')
})

app.post('/signup', async (req, res) => {
    const data = {
        name: req.body.name,
        username: req.body.username,
        password: req.body.password
    }

    await collection.insertMany([data])

    res.render('login')
    res.render('home.hbs', { name: data.name })
})

const loginAttempts = {};

app.post('/login', async (req, res) => {
    try {
        const username = req.body.username;
        const password = req.body.password;
        const check = await collection.findOne({ username: username });

        if (!check) {
            // User not found
            res.send('Account not found!');
            return;
        }

        if (check.password === password) {
            // Successful login, reset login attempts
            loginAttempts[username] = 0;
            res.render('home');
        } else {
            // Wrong password
            if (loginAttempts[username]) {
                loginAttempts[username]++;
            } else {
                loginAttempts[username] = 1;
            }

            if (loginAttempts[username] >= 3) {
                // Block the user after 3 failed attempts
                res.send('Account blocked due to too many login attempts.');
            } else {
                res.send(`Wrong password. ${3 - loginAttempts[username]} attempts remaining.`);
            }
        }
    } catch (error) {
        console.error(error);
        res.status(500).send('Server error');
    }
});

// app.post('/login', async (req, res) => {

//     try {
//         const check = await collection.findOne({ username: req.body.username })

//         if (check.password === req.body.password) {
//             res.render('home')
//         } else {
//             res.send('wrong password')
//         }
//     } catch {

//         res.send('Account not found!')

//     }

// })

app.listen(3000, () => {
    console.log('port connected');
})