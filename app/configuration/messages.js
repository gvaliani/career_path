function messages(angular, app){
  'use strict';

  app.constant('messages', {
    error: {
      required: 'Your %0 is required.',
    }
  });
}

module.exports = messages;
