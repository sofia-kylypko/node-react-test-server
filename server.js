const express = require('express');
const app = express();

const mongoose = require('mongoose');
require('dotenv').config();

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

app.get("/data", async (req, res) => {
    try {
        res.set('Access-Control-Allow-Origin', '*');

        const users = await User.find(); // Fetch all users
        if (users.length === 0) {
            return res.status(404).json({ message: "No users found" });
        }
        res.json({ users });
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: 'Error fetching data' });
    }
    // res.json({ "users": ["user1", "user2", "user3"] });
});

const PORT = 5001;
app.listen(PORT, () => {
    console.log(`server running on port ${PORT}`);
});