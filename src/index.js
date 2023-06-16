const express = require('express');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const app = express();
const ApiRoutes = require('./routes/index');
dotenv.config();


const PORT = process.env.PORT || 3002;

const createAndSetUpServer = () => {
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({extended:true}));
    app.use('/api',ApiRoutes);
    app.listen(PORT,() =>{
        console.log('server listening to port ',PORT);
    });
}

createAndSetUpServer();