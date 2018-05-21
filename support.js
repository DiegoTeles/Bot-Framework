module.exports = function (session) {
    // Generate ticket
    var tickerNumber = Math.ceil(Math.random() * 20000);

    // Responde e reorna para o dialogo parente
    session.send('Sua mensagem \'%s\' foi registrado. Depois de resolvê-lo; nós entraremos em contato com você.', session.message.text);
    
    session.send('Obrigado por entrar em contato com nossa equipe de suporte. O seu número de bilhete é %s.', tickerNumber);

    session.endDialogWithResult({
        response: tickerNumber
    });
};