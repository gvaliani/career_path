describe('The email editor widget was created', function() {
    'use e2e base code';

    it('should see the email editor', function() {

        var editorContainer = element.all(by.css('.editorContainer'));
        expect(editorContainer.count()).toEqual(1);

    });
});