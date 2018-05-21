var builder = require('botbuilder');
var Store = require('./store');

var DialogLabels = {
    Plano10: 'Plano 10mb',
    Plano20: 'Plano 20mb',
    Support: 'Support'
};

module.exports =  [  
    // Planos
    (session, results, next) => {
        session.send('Bem vindo ao nosso portal 4G!');
        //builder.Prompts.text(session, 'Qual seu nome?');
        if (!session.userData.nome) {
            builder.Prompts.text(session, `Qual seu nome?`);
          } else {
            next();
            console.log("Aquiiii no next !!!");
            //session.beginDialog('/awnserTwo');
          }
    },
    (session, results) => {
           if (results.response) {
            var msg = results.response;
            session.userData.nome = msg;
          }

          //session.send(`Como posso te ajudar, *${session.userData.nome}*?`);
          builder.Prompts.choice(
            session,`Buscando pacotes melhores de Internet, **${session.userData.nome}** ? \n`,
            [DialogLabels.Plano10, DialogLabels.Plano20],{
                maxRetries: 3, // Defino quantas tentativas
                retryPrompt: 'Não é uma opção válida. \n escolha entre: \n' // Disparo erro pelas tentativas
            });
    },

    (session, result) => {
        if (!result.response) {
            // Quando passar das quantidade de tentativas fazemos isso
            session.send('Ooops! Muitas ***tentativas sem sucesso*** :( \n Mas não se preocupe, você pode tentar de novo!');
            return session.endDialog();
        }

        // Quando houver erro, começamos de novo
        session.on('error', (err) => {
            session.send('Falha com a Mensagem: %s', err.message);
            session.endDialog();
        });

        //  Continuamos no dialogo apropriado usando Cases
        var selection = result.response.entity;
        switch (selection) {
            case DialogLabels.SemNet:
                return session.beginDialog('plano10');
            case DialogLabels.Plano4G:
                return session.beginDialog('plano20');
        }
    }
];
