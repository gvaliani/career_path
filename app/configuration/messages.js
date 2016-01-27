function messages(angular, app){
    'use strict';

    app.constant('messages', {
        loyaltyMessageText: {
        1: 'Your Welcome message will be sent to new members when they join your mailing list.',
        2: 'Your Membership Anniversary message will be sent to members on the anniversary of the date they joined your mailing list.',
        3: 'Your Birthday message will be sent to members 7 days before their birthday.',
        4: 'Your Wedding Anniversary message will be sent to members 7 days before their wedding anniversary.',
        5: 'Your Thank You message will be sent to members 2 days after they dined at your restaurant.',
        6: 'Your Miss You message will be sent to members 4 months after they last dined at your restaurant.'
        }
    });
}

module.exports = messages;
