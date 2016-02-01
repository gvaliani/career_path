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
        showNewEditorTour: '',
        droppableOptions: {
            tolerance: 'touch',
            hoverClass: 'active'
        }
    };

    _.extend(defaultValues, options);

    app.value('values', defaultValues);
}

module.exports = values;