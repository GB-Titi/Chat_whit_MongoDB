const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const MongoClient = require('mongodb').MongoClient;
const url = 'mongodb://localhost:27017'
const dbName = 'MaDBChat';

MongoClient.connect(url, function(err, client) {

    if(err){
        process.exit(1);
    }
    
    else{
        console.log("Connecté à MongoDB");
        const db = client.db(dbName);
        //const db = instance.db('MaDBChat');
        const collection = db.collection('ChatsMessages');
        let nb_user = 0;

        // On gère les requêtes HTTP des utilisateurs en leur renvoyant les fichiers du dossier 'public'
        app.use("/", express.static(__dirname + "/public"));

        io.on('connection', function (socket) {

            // Utilisateur connecté à la socket
            let loggedUser;

            console.log('a user connected');

            //Déconnexion d'un utilisateur : broadcast d'un 'service-message'
            socket.on('disconnect', function () {
                if (loggedUser !== undefined) {
                    console.log('user disconnected : ' + loggedUser.username);
                    nb_user = nb_user - 1;
                    //console.log(nb_user);
                    let serviceMessage = {
                        text: 'User "' + loggedUser.username + '" disconnected',
                        type: 'logout'
                    };

                    socket.broadcast.emit('service-message', serviceMessage);
                    socket.broadcast.emit('nb_users', nb_user);
                }
            });

            /**
             * Connexion d'un utilisateur via le formulaire :
             *  - sauvegarde du user
             *  - broadcast d'un 'service-message'
             */
            socket.on('user-login', function (user) {
                loggedUser = user;
                nb_user = nb_user + 1;
                socket.broadcast.emit('nb_users', nb_user);
                if (loggedUser !== undefined) {
                    let serviceMessage = {
                        text: 'User "' + loggedUser.username + '" logged in',
                        type: 'login'
                    };

                    socket.broadcast.emit('service-message', serviceMessage);
                    socket.broadcast.emit('nb_users', nb_user);
                }
            });

            // Réception de l'événement 'chat-message' et réémission vers tous les utilisateurs
            socket.on('chat-message', function (message) {
                message.username = loggedUser.username;
                io.emit('chat-message', message);
                console.log('Message de ' + loggedUser.username + ': ' + message.text);

                //insertion dans la collection du username et de son message
                collection.insertOne({Pseudo : loggedUser.username, message : message.text}); 
                socket.broadcast.emit('nb_users', nb_user);
            });
        });


        //Lancement du serveur en écoutant les connexions arrivant sur le port 3000
        http.listen(3000, function () {
            console.log('Server is listening on *:3000');
        });
    }
});



