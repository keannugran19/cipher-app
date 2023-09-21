const mongoose = require('mongoose')

mongoose.connect('mongodb://127.0.0.1:27017/cipherAppDB')

    .then(() => {
        console.log('mongoDB connected');
    })
    .catch(() => {
        console.log('failed to connect');
    })

const LogInSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    }
})

const collection = new mongoose.model('LogInCollection', LogInSchema)

module.exports = collection