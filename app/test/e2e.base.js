    // setup code for protractor

    browser.waitForDeferredAngular = function() {
        return browser.driver.wait(function() {
            return element.all(by.css('.deferred-bootstrap-loading')).then(function() {
                return browser.driver.wait(function() {
                    return element.all(by.css('.deferred-bootstrap-success')).then(function(el) {
                        // no errors, loading done and no errors found
                        return true;
                    }, function(err) {
                        // errors during bootstrap, fail
                        return false;
                    });
                });

            }, function() {
                // It has probably already bootstrapped, we just got to the party late
                return true;
            });
        });
    };

    beforeEach(function(){
         // Tell protractor we are doing it ourself
        browser.ignoreSynchronization = true;

        browser.get('http://localhost:5000').then(function(){
            return browser.waitForDeferredAngular();
        });
    });
