const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [
    {
        "username": "rel",
        "password": "rel123"
    },
    {
        "username": "exa",
        "password": "exa213"
    },
    {
        "username": "hge",
        "password": "hge23"
    }
];

const isValid = (username)=>{ //returns boolean
//write code to check is the username is valid
}

const authenticatedUser = (username, password) => {
    
    let validusers = users.filter((user) => {
        return (user.username === username && user.password === password);
    });
    
    if (validusers.length > 0) {
        return true;
    } else {
        return false;
    }
}

//only registered users can login
regd_users.post("/login", (req,res) => {
    const username = req.body.username;
    const password = req.body.password;
    
    if (!username || !password) {
        return res.status(404).json({ message: "Error logging in" });
    }
    
    if (authenticatedUser(username, password)) {
        
        let accessToken = jwt.sign({
            data: password
        }, 'access', { expiresIn: 60 * 60 });
        
        req.session.authorization = {
            accessToken, username
        }
        return res.status(200).send("User successfully logged in");
    } else {
        return res.status(208).json({ message: "Invalid Login. Check username and password" });
    }
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
   
    const isbn = parseInt(req.params.isbn, 10);
    const review = req.query.review;
    const username = req.query.username;

    
    console.log("Books data:", books);
    console.log("Requested ISBN:", isbn);

    const book = books[isbn]; 
    console.log("Found book:", book);

    if (!book) {
        return res.status(404).send(`Book with isbn ${isbn} not found.`);
    }

    const bookReviews = book.reviews || {}; // Ensure bookReviews is an object

    
    if (!username || !review) {
        return res.status(400).send('Review or user name is missing');
    }

    
    if (!bookReviews[username]) {
        bookReviews[username] = review;
        res.send(`Review added for user ${username} on book with isbn ${isbn}`);
    } else {
        
        bookReviews[username] = review;
        res.send(`Review updated for user ${username} on book with isbn ${isbn}`);
    }
});

regd_users.delete("/auth/review/:isbn", (req, res) => {
    const isbn = req.params.isbn;
    const username = req.session.authorization.username; 
    const book = Object.values(books).find(book => book.isbn === isbn);
    const bookReviews = book.reviews;

    if (!book) {
        res.send(`Book with isbn ${isbn} not found.`);
    } else if (!username) {
        res.send(`User is not authenticated. Please log in.`);
    } else {
        const userReviewIndex = bookReviews.findIndex(review => review.username === username);

        if (userReviewIndex !== -1) {
            bookReviews.splice(userReviewIndex, 1);
            res.send(`Review deleted for user ${username} on book with isbn ${isbn}`);
        } else {
            
            res.send(`The user ${username} has no review on book with isbn ${isbn}`);
        }
    }
});
  

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;

