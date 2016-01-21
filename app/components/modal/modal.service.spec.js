'use strict';

// load required files
require('./../../helpers/underscore-provider.js')(angular, app);
require('./modal.service.js')(angular, window.app);

describe('Modal directive', function(){

	var modalService;

	beforeEach(angular.mock.module('email-editor'));

	beforeEach(inject(function(_FBModalService_){
		modalService = _FBModalService_;
	}));

	xit('Gets all the library', function(){

	});


});
