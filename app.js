// This loads the environment variables from the .env file
require('dotenv-extended').load();

var builder = require('botbuilder');
var restify = require('restify');

// Chamamos o Restify Server
var server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 3979, function () {
    console.log('%s escutando --->  %s', server.name, server.url);
});

// Criamos o chat bot e escutamos a porta
var connector = new builder.ChatConnector({
    appId: process.env.MICROSOFT_APP_ID,
    appPassword: process.env.MICROSOFT_APP_PASSWORD,
});
server.post('/api/messages', connector.listen());

// Aqui setamos nossos dialogos para serem chamados nas Sessions
var DialogLabels = {
    Plano4G: 'Plano 4G',
    SemNet: 'Sem Internet',
    Support: 'Support'
};
// Usamos armazenamento em memória
var inMemoryStorage = new builder.MemoryBotStorage();

var bot = new builder.UniversalBot(connector, [
     (session) => {
        session.preferredLocale("pt"); // Passamos o Bot para português
        // prompt para pesquisar opção
        builder.Prompts.choice(
            session,'Qual opção você deseja? \n',[DialogLabels.SemNet, DialogLabels.Plano4G],{
                maxRetries: 3, // Defino quantas tentativas
                retryPrompt: 'Não é uma opção válida. \n escolha entre: \n' // Disparo erro pelas tentativas
            });
        //     builder.Prompts.choice(session, `Olá ${session.userData.nome}, qual seu plano atual?`,
        //     "4G | Sem Internet " , { listStyle: builder.ListStyle.button }
        // );
            
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
                return session.beginDialog('semInternet');
            case DialogLabels.Plano4G:
                return session.beginDialog('plano4G');
        }
    }
]).set('storage', inMemoryStorage); // Registramos os dados em "memory storage"

//bot.dialog('semInternet', require('./noInternet'));
bot.dialog('plano4G', require('./planos'));
bot.dialog('support', require('./support'))
    .triggerAction({
        matches: [/help/i, /support/i, /problem/i]
    });

// Registramos quaisquer erros do bot no console
bot.on('error', function (e) {
    console.log('E ocorreu o erro ', e);
});