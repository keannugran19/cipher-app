const express = require('express')
const app = express()
const path = require('path')
const hbs = require('hbs')
const collection = require('./mongodb')
const passport = require('passport')
const session = require('express-session')
require('./auth')

// path
app.use(express.static('public'))
// path

const templatePath = path.join(__dirname, '../templates')

app.use(express.json())
app.set('view engine', 'hbs')
app.set('views', templatePath)
app.use(express.urlencoded({ extended: false }))

app.get('/', (req, res) => {
    res.render('login')
})

// Google LOGIN
function isLoggedIn(req, res, next) {
    req.user ? next() : res.sendStatus(401)
}

app.use(session({
    secret: 'mysecret',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }
}))

app.use(passport.initialize())
app.use(passport.session())
// END of Google LOGIN

app.get('/login', (req, res) => {
    res.render('login')
})

app.get('/signup', (req, res) => {
    res.render('signup')
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

// Google Authorization LOGIN
app.get('/auth/google',
    passport.authenticate('google', {
        scope:
            ['email', 'profile']
    }
    ));

app.get('/auth/google/callback',
    passport.authenticate('google', {
        successRedirect: '/auth/protected',
        failureRedirect: '/auth/google/failure'
    }));

app.get('/auth/google/failure', (req, res) => {
    res.send('Something went wrong!')
})

app.get('/auth/protected', isLoggedIn, (req, res) => {
    res.redirect('/home')
})

app.get('/home', isLoggedIn, (req, res) => {

    const name = req.user.displayName;

    res.render('home', { name: name })
})
// END of Google Authorization LOGIN

// Logout from Google
app.use('/auth/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/login')
})


app.listen(3000, () => {
    console.log('port connected');
})