var builder = require('botbuilder');
var Store = require('./store');

var DialogLabels = {
    Plano10: 'Plano 10mb',
    Plano20: 'Plano 20mb',
    Support: 'Support'
};
module.exports = [  
    // Destino
    (session) => {
        session.send('Bem vindo ao nosso portal!');
        builder.Prompts.text(session, 'Qaual seu nome?');
    },
    (session, results, next) => {
           if (results.response) {
            var msg = results.response;
            session.userData.nome = msg;
          }
          session.send(`Como posso te ajudar, *${session.userData.nome}*?`);builder.Prompts.choice(
            session,'Buscando pacotes melhores de Internet? \n',[DialogLabels.Plano10, DialogLabels.Plano20],{
                maxRetries: 3, // Defino quantas tentativas
                retryPrompt: 'Não é uma opção válida.' // Disparo erro pelas tentativas
            });

            
    },

    (session, results, next) => {
        //session.dialogData.destination = results.response;
        session.send(`Buscando pacotes melhores de Internet?`);
        
        builder.Prompts.choice(
            session,'Buscando pacotes melhores de Internet? \n',[DialogLabels.Plano10, DialogLabels.Plano20],{
                maxRetries: 3, // Defino quantas tentativas
                retryPrompt: 'Não é uma opção válida.' // Disparo erro pelas tentativas
            });
        next();
    },

    // Check-in
    (session) => {
        builder.Prompts.time(session, 'Quando você quer fazer o check-in?');
    },
    (session, results, next) => {
        session.dialogData.checkIn = results.response.resolution.start;
        next();
    },

    // Noites
    (session) => {
        builder.Prompts.number(session, 'Quantas noites você quer ficar?');
    },
    (session, results, next) => {
        session.dialogData.nights = results.response;
        next();
    },

    // Pesquisar...
    (session) => {
        var destination = session.dialogData.destination;
        var checkIn = new Date(session.dialogData.checkIn);
        var checkOut = checkIn.addDays(session.dialogData.nights);

        session.send(
            'Ok. Procurando por Hotéis em %s from %d/%d to %d/%d...',
            destination,
            checkIn.getMonth() + 1, checkIn.getDate(),
            checkOut.getMonth() + 1, checkOut.getDate());

        // Pesquisa Async
        Store
            .searchHotels(destination, checkIn, checkOut)
            .then((hotels) => {
                // Resultados
                session.send('Eu encontrei um total de %d hotéis para a data:', hotels.length);

                var message = new builder.Message()
                    .attachmentLayout(builder.AttachmentLayout.carousel)
                    .attachments(hotels.map(hotelAsAttachment));

                session.send(message);

                // Fim
                session.endDialog();
            });
    }
];

// Helpers
function hotelAsAttachment(hotel) {
    return new builder.HeroCard()
        .title(hotel.name)
        .subtitle('%d stars. %d reviews. Para $%d por noite.', hotel.rating, hotel.numberOfReviews, hotel.priceStarting)
        .images([new builder.CardImage().url(hotel.image)])
        .buttons([
            new builder.CardAction()
                .title('Mais detalhes?')
                .type('openUrl')
                .value('https://www.bing.com/search?q=hotels+in+' + encodeURIComponent(hotel.location))
        ]);
}

Date.prototype.addDays = (days) => {
    var date = new Date(this.valueOf());
    date.setDate(date.getDate() + days);
    return date;
};