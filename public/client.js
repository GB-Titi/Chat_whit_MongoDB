//global io
var socket = io();

//Connexion d'un utilisateur:
$('#login form').submit(function (e) {
    //evite le rechargement
    e.preventDefault();

    //création d'un objet user
    var user = {
        username : $('#login input').val().trim()
    };

    // Si le champ de connexion n'est pas vide
    if (user.username.length > 0) { 
        socket.emit('user-login', user);

        // On cache formulaire de connexion
        $('body').removeAttr('id');

        // On focus sur le champ du message
        $('#chat input').focus(); 
    }
});


//Envoi d'un message
$('#chat form').submit(function (e) {
    //evite le rechargement
    e.preventDefault();

    //création d'un objet message
    var message = {
        text : $('#m').val()
    };

    //on vide le champs message
    $('#m').val(''); 

    // Gestion message vide
    if (message.text.trim().length !== 0) { 
        socket.emit('chat-message', message);
    }

    // Focus sur le champ du message
    $('#chat input').focus(); 
});

// Réception d'un message
socket.on('chat-message', function (message) {
    $('#messages').append($('<li>').html('<span class="username">' + message.username + '</span> ' + message.text));
});


// Réception d'un message de service    
socket.on('service-message', function (message) {
    $('#messages').append($('<li class="' + message.type + '">').html('<span class="info">information</span> ' + message.text));
});
