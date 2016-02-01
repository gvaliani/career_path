function values(angular, app, options, _){
    'use strict';

    var defaultValues = {
        isSuperUser: '',
        timeZone: '',
        isFullSupportedClient: '',
        autoSpellCheck: '',
        couponCodeLabelText: '',
        hasReservationLink: '',
        hasWebpageLinks: '',
        showNewEditorTour: ''
    };

    _.extend(defaultValues, options);

    app.value('values', defaultValues);
}

module.exports = values;