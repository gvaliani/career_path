CKEDITOR.plugins.add('personalization', {
    init: function (editor) {
        editor.ui.addRichCombo('personalization', {
            label: 'Personalization', // drop down's first option
            title: 'Insert Personalization', // tooltip            
            panel: {
                css: [CKEDITOR.skin.getPath('editor')].concat('/MemberPages/NewEditor/Css/personalization.css'),
                multiSelect: false
            },

            init: function () {
                this.startGroup('Personalization'); // Heading for options list

                this.add('##FirstName##', 'First Name', 'FirstName');
                this.add('##LastName##', 'Last Name', 'LastName');
                this.add('##EmailAddress##', 'Email Address', 'EmailAddress');
                this.add('##Birthdate##', 'Birthday', 'Birthdate');
                this.add('##Anniversary##', 'Anniversary', 'Anniversary');
            },

            onClick: function (value) {
                editor.focus();
                editor.fire('saveSnapshot');
                editor.insertText(value);
                editor.fire('saveSnapshot');
            }
        });
    }
});