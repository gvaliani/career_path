CKEDITOR.plugins.add('updateprofile', {
    init: function (editor) {
        editor.ui.addButton('updateprofile', {
            label: 'Update Profile', // drop down's first option
            title: 'Update Your Profile', // tooltip,
            click: function() {
                editor.focus();
                editor.fire('saveSnapshot');
                editor.insertHtml('<a href="_Profile_" data-cke-saved-href="##_Profile_##">Update Your Profile</a>&nbsp;');
                editor.fire('saveSnapshot');
            }
        });
    }
});