(function () {
  'use strict';

  describe('Contacts Route Tests', function () {
    // Initialize global variables
    var $scope,
      ContactsService;

    // We can start by loading the main application module
    beforeEach(module(ApplicationConfiguration.applicationModuleName));

    // The injector ignores leading and trailing underscores here (i.e. _$httpBackend_).
    // This allows us to inject a service but then attach it to a variable
    // with the same name as the service.
    beforeEach(inject(function ($rootScope, _ContactsService_) {
      // Set a new global scope
      $scope = $rootScope.$new();
      ContactsService = _ContactsService_;
    }));

    describe('Route Config', function () {
      describe('Main Route', function () {
        var mainstate;
        beforeEach(inject(function ($state) {
          mainstate = $state.get('contacts');
        }));

        it('Should have the correct URL', function () {
          expect(mainstate.url).toEqual('/contacts');
        });

        it('Should be abstract', function () {
          expect(mainstate.abstract).toBe(true);
        });

        it('Should have template', function () {
          expect(mainstate.template).toBe('<ui-view/>');
        });
      });

      describe('List Route', function () {
        var liststate;
        beforeEach(inject(function ($state) {
          liststate = $state.get('contacts.list');
        }));

        it('Should have the correct URL', function () {
          expect(liststate.url).toEqual('');
        });

        it('Should not be abstract', function () {
          expect(liststate.abstract).toBe(undefined);
        });

        it('Should have template', function () {
          expect(liststate.templateUrl).toBe('modules/contacts/client/views/list-contacts.client.view.html');
        });
      });

      describe('View Route', function () {
        var viewstate,
          ContactsController,
          mockContact;

        beforeEach(inject(function ($controller, $state, $templateCache) {
          viewstate = $state.get('contacts.view');
          $templateCache.put('modules/contacts/client/views/view-contact.client.view.html', '');

          // create mock contact
          mockContact = new ContactsService({
            _id: '525a8422f6d0f87f0e407a33',
            title: 'An Contact about MEAN',
            content: 'MEAN rocks!'
          });

          // Initialize Controller
          ContactsController = $controller('ContactsController as vm', {
            $scope: $scope,
            contactResolve: mockContact
          });
        }));

        it('Should have the correct URL', function () {
          expect(viewstate.url).toEqual('/:contactId');
        });

        it('Should have a resolve function', function () {
          expect(typeof viewstate.resolve).toEqual('object');
          expect(typeof viewstate.resolve.contactResolve).toEqual('function');
        });

        it('should respond to URL', inject(function ($state) {
          expect($state.href(viewstate, {
            contactId: 1
          })).toEqual('/contacts/1');
        }));

        it('should attach an contact to the controller scope', function () {
          expect($scope.vm.contact._id).toBe(mockContact._id);
        });

        it('Should not be abstract', function () {
          expect(viewstate.abstract).toBe(undefined);
        });

        it('Should have templateUrl', function () {
          expect(viewstate.templateUrl).toBe('modules/contacts/client/views/view-contact.client.view.html');
        });
      });

      describe('Create Route', function () {
        var createstate,
          ContactsController,
          mockContact;

        beforeEach(inject(function ($controller, $state, $templateCache) {
          createstate = $state.get('contacts.create');
          $templateCache.put('modules/contacts/client/views/form-contact.client.view.html', '');

          // create mock contact
          mockContact = new ContactsService();

          // Initialize Controller
          ContactsController = $controller('ContactsController as vm', {
            $scope: $scope,
            contactResolve: mockContact
          });
        }));

        it('Should have the correct URL', function () {
          expect(createstate.url).toEqual('/create');
        });

        it('Should have a resolve function', function () {
          expect(typeof createstate.resolve).toEqual('object');
          expect(typeof createstate.resolve.contactResolve).toEqual('function');
        });

        it('should respond to URL', inject(function ($state) {
          expect($state.href(createstate)).toEqual('/contacts/create');
        }));

        it('should attach an contact to the controller scope', function () {
          expect($scope.vm.contact._id).toBe(mockContact._id);
          expect($scope.vm.contact._id).toBe(undefined);
        });

        it('Should not be abstract', function () {
          expect(createstate.abstract).toBe(undefined);
        });

        it('Should have templateUrl', function () {
          expect(createstate.templateUrl).toBe('modules/contacts/client/views/form-contact.client.view.html');
        });
      });

      describe('Edit Route', function () {
        var editstate,
          ContactsController,
          mockContact;

        beforeEach(inject(function ($controller, $state, $templateCache) {
          editstate = $state.get('contacts.edit');
          $templateCache.put('modules/contacts/client/views/form-contact.client.view.html', '');

          // create mock contact
          mockContact = new ContactsService({
            _id: '525a8422f6d0f87f0e407a33',
            title: 'An Contact about MEAN',
            content: 'MEAN rocks!'
          });

          // Initialize Controller
          ContactsController = $controller('ContactsController as vm', {
            $scope: $scope,
            contactResolve: mockContact
          });
        }));

        it('Should have the correct URL', function () {
          expect(editstate.url).toEqual('/:contactId/edit');
        });

        it('Should have a resolve function', function () {
          expect(typeof editstate.resolve).toEqual('object');
          expect(typeof editstate.resolve.contactResolve).toEqual('function');
        });

        it('should respond to URL', inject(function ($state) {
          expect($state.href(editstate, {
            contactId: 1
          })).toEqual('/contacts/1/edit');
        }));

        it('should attach an contact to the controller scope', function () {
          expect($scope.vm.contact._id).toBe(mockContact._id);
        });

        it('Should not be abstract', function () {
          expect(editstate.abstract).toBe(undefined);
        });

        it('Should have templateUrl', function () {
          expect(editstate.templateUrl).toBe('modules/contacts/client/views/form-contact.client.view.html');
        });

        xit('Should go to unauthorized route', function () {

        });
      });

      describe('Handle Trailing Slash', function () {
        beforeEach(inject(function ($state, $rootScope) {
          $state.go('contacts.list');
          $rootScope.$digest();
        }));

        it('Should remove trailing slash', inject(function ($state, $location, $rootScope) {
          $location.path('contacts/');
          $rootScope.$digest();

          expect($location.path()).toBe('/contacts');
          expect($state.current.templateUrl).toBe('modules/contacts/client/views/list-contacts.client.view.html');
        }));
      });

    });
  });
}());