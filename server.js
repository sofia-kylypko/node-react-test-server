const express = require('express');
const session = require("express-session");
const cookieParser = require("cookie-parser");
const mongoose = require('mongoose');
const cors = require("cors");
require('dotenv').config();

const app = express();
app.use(cookieParser());

//#region db
mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.log(err));

const userSchema = new mongoose.Schema({
    _id: { String },
    name: String,
    email: String,
    password: String
});

const User = mongoose.model('User', userSchema);

// app.get("/data", query("search").optional().trim().notEmpty(), async (req, res) => {
app.get("/data", async (req, res) => {
    try {
        res.set('Access-Control-Allow-Origin', '*');

        const users = await User.find(); // Fetch all users
        if (users.length === 0) {
            return res.status(404).json({ message: "No users found" });
        }
        res.json(users);
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: 'Error fetching data' });
    }
    // res.json({ "users": ["user1", "user2", "user3"] });
});
//#endregion

//#region login

app.use(
    cors({
        origin: "http://localhost:3000", // Change to frontend URL
        credentials: true, // Allow cookies & session sharing
    })
);

app.use(
    session({
        secret: "your_secret_key",
        resave: false,
        saveUninitialized: false,
        cookie: {
            secure: false
        }
    })
);

app.get("/login", async (req, res) => {
    try {
        const { email, password } = req.query;
        let resultStatus = '';

        // res.set('Access-Control-Allow-Origin', '*');

        const users = await User.find(); // Fetch all users
        if (users.length === 0) {
            return res.status(404).json({ message: "No user found" });
        }

        const foundUser = users.filter(element => {
            return element.email == email
        })[0];

        if (foundUser) {
            resultStatus = foundUser.password == password ? "Success" : "Wrong password";
        } else {
            resultStatus = "Email is not in system";
        }

        if (resultStatus == "Success") {
            req.session.user = {
                email: foundUser.email,
                name: foundUser.name,
            };

            res.cookie("email", foundUser.email);
            res.cookie("name", foundUser.name);
            res.cookie("id", foundUser._id);
        }

        res.json(resultStatus);
    } catch (err) {
        console.log(err);
        res.status(500).json("No such email in system");
    }
});
//#endregion

//#region Check Session Route
app.get("/get-credentials", (req, res) => {
    res.json(req.cookies);
});

app.get("/clean-credentials", (req, res) => {
    req.session.destroy(err => {
        if (err) {
            return res.status(500).send('Could not log out');
        }

        // Clear cookies
        res.clearCookie('connect.sid'); // Clear session cookie (adjust if you have other cookies)
        res.clearCookie('email'); // Clear other cookies as necessary
        res.clearCookie('name');
        res.clearCookie('id');
        res.send('Logged out successfully');
    });
});
//#endregion

//#region init
const PORT = 5001;
app.listen(PORT, () => {
    console.log(`server running on port ${PORT}`);
});
//#endregion