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
    session({
        secret: "your_secret_key",
        resave: false,
        saveUninitialized: false,
        cookie: {
            secure: false
        }
    })
);

app.use(
    cors({
        origin: "http://localhost:3000", // Change to frontend URL
        credentials: true, // Allow cookies & session sharing
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
            req.session.isAuth = true;
            req.session.save(err => {
                if (err) console.log("Session save error:", err);
            });

            // Store user data in cookies (e.g., email and name)
            res.cookie("email", foundUser.email, { maxAge: 2000 * 60 * 60 });
            res.cookie("name", foundUser.name, { maxAge: 2000 * 60 * 60 });

            console.log(req.session);
            console.log(req.cookies);
        }

        res.json(resultStatus);
    } catch (err) {
        console.log(err);
        res.status(500).json("No such email in system");
    }
});
//#endregion

//#region Check Session Route
app.get("/check-session", (req, res) => {
    res.json(req.session);
    console.log(req.session);
    if (req.session.isAuth) {
        console.log("redirected");
    } else {
    }
});
//#endregion

//#region init
const PORT = 5001;
app.listen(PORT, () => {
    console.log(`server running on port ${PORT}`);
});
//#endregion