const express = require('express');

const app = express();

const connectDB = require('./db');
const Users = require('./routes/api/users');
const Auth = require('./routes/api/auth');

// Middlewares
const auth = require('./middleware/auth');

connectDB();

// Init Middleware
app.use(express.json({ extended: false }));

const PORT = process.env.PORT || 5000;

app.use('/api/users', Users);
app.use('/api/auth', Auth);

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.listen(PORT, () => console.log(`App listening at port ${PORT}`));
