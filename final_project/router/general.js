const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

const doesExist = (username) => {
    let userswithsamename = users.filter((user) => {
        return user.username === username;
    });
    if (userswithsamename.length > 0) {
        return true;
    } else {
        return false;
    }
};

public_users.post("/register", (req,res) => {
  //Write your code here
  const username = req.body.username;
  const password = req.body.password;

  if (username && password) {
    if (!doesExist(username)) {
        users.push({"username": username , "password":password});
        return res.status(200).json({message: "User successfully registered. Now you can login"});
        } else {
            return res.status(404).json({message: "User already exists!"});
        }
    }
});

public_users.get('/', async (req, res) => {
    try {
        const allBooks = await new Promise((resolve) => {
            resolve(books);
        });
        res.json(allBooks);
    } catch (error) {
        res.status(500).send('Error retrieving books');
    }
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn', async (req, res) => {
    try {
        const isbn = req.params.isbn;

        const book = await new Promise((resolve) => {
            resolve(books[isbn]);
        });

        if (book) {
            res.json(book);
        } else {
            res.status(404).send(`Book with ISBN ${isbn} not found.`);
        }
    } catch (error) {
        res.status(500).send('Error retrieving book');
    }
});

// Get all books based on author
public_users.get('/author/:author', async (req, res) => {
    try {
        const author = req.params.author;
        
        const booksByAuthor = await new Promise((resolve) => {
            const booksFound = Object.values(books).filter(book => book.author === author);
            resolve(booksFound);
        });

        if (booksByAuthor.length > 0) {
            res.json(booksByAuthor);
        } else {
            res.status(404).send(`Book with author name ${author} not found.`);
        }
    } catch (error) {
        res.status(500).send('Error retrieving books by author');
    }
});

// Get all books based on title
public_users.get('/title/:title', async (req, res) => {
    try {
        const title = req.params.title;
        
        const booksByTitle = await new Promise((resolve) => {
            const booksFound = Object.values(books).filter(book => book.title === title);
            resolve(booksFound);
        });

        if (booksByTitle.length > 0) {
            res.json(booksByTitle);
        } else {
            res.status(404).send(`Book with title ${title} not found.`);
        }
    } catch (error) {
        res.status(500).send('Error retrieving books by title');
    }
});

module.exports = public_users;

//  Get book review
public_users.get('/review/:isbn', function (req, res) {
    const isbn = req.params.isbn;
    const book = books[isbn]; 

    if (book) {
        const review = book.reviews; 
        res.send(JSON.stringify(review, null, 4)); 
    } else {
        res.status(404).send(`Book with ISBN ${isbn} not found.`); 
    }
});

module.exports.general = public_users;

