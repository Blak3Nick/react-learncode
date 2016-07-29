(function () {
  'use strict';

  angular
    .module('contacts')
    .controller('ContactsController', ContactsController);

  ContactsController.$inject = ['$scope', '$state', 'contactResolve', '$window', 'Authentication'];

  function ContactsController($scope, $state, contact, $window, Authentication) {
    var vm = this;

    vm.contact = contact;
    vm.authentication = Authentication;
    vm.error = null;
    vm.form = {};
    vm.remove = remove;
    vm.save = save;

    // Remove existing Contact
    function remove() {
      if ($window.confirm('Are you sure you want to delete?')) {
        vm.contact.$remove($state.go('contacts.list'));
      }
    }

    // Save Contact
    function save(isValid) {
      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'vm.form.contactForm');
        return false;
      }

      // Create a new contact, or update the current instance
      vm.contact.createOrUpdate()
        .then(successCallback)
        .catch(errorCallback);

      function successCallback(res) {
        $state.go('contacts.view', {
          contactId: res._id
        });
      }

      function errorCallback(res) {
        vm.error = res.data.message;
      }
    }
  }
}());
