const mongooes = require("mongoose");
const bcryptjs = require("bcryptjs");
const jwt = require("jsonwebtoken");
require('dotenv').config();


const addBooksSchema = new mongooes.Schema({
    title: {
        type: String,
        required : true
    },
    category: {
        type: String,
        required : true
    },
    description: {
        type: String,
        required : true,
    },
    price: {
        type: String,
        required : true
    }
});


const Book = new mongooes.model("Book",addBooksSchema);
module.exports = Book;