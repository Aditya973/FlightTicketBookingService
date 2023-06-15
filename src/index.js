const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const db = require('./models/index');

const {PORT,DB_SYNC} = require('./config/serverConfig');
const apiRoutes = require('./routes/index');

const setUpAndStartServer = () => {
    app.use(bodyParser.json);
    app.use(bodyParser.urlencoded({extended:true}));
    app.use('/api', apiRoutes);

    app.listen(PORT,() => {
        console.log('server listening to port ',PORT);
        if(DB_SYNC){
            db.sequelize.sync({alter:true});
        }
    });
}

setUpAndStartServer();