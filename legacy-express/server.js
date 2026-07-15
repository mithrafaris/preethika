const express = require('express');
const app = express();
const dotenv = require('dotenv');
const cookieParser=require("cookie-parser");
const session=require("express-session");

const connectDB =require("./database/connection")
const bodyParser = require('body-parser');
const path = require('path');

const userRoute = require('./routes/userRoute')
const adminRoute = require('./routes/adminRoute');


dotenv.config({ path: path.join(__dirname, '.env') });
app.use(session({
  secret: "secret",
  resave: false,
  saveUninitialized: true,
  cookieParser: { secure: false, maxAge: 3600000 }
}));

app.use((req, res, next) => {
  res.setHeader('Cache-Control', 'no-store');
  next();
});



const PORT = process.env.PORT || 8080;


// Middleware
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));
// app.use(morgan('tiny'));



connectDB()
app.use(express.static(path.join(__dirname, "public")));
app.use('/', userRoute);
app.use('/admin',adminRoute);

app.set('views', [
    path.resolve(__dirname, 'views/admin'),
    path.resolve(__dirname, 'views/user'),
]);

  


// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
