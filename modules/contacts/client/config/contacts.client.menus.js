(function () {
  'use strict';

  angular
    .module('contacts')
    .run(menuConfig);

  menuConfig.$inject = ['menuService'];

  function menuConfig(menuService) {
    menuService.addMenuItem('topbar', {
      title: 'Contacts',
      state: 'contacts',
      type: 'dropdown',
      roles: ['*']
    });

    // Add the dropdown list item
    menuService.addSubMenuItem('topbar', 'contacts', {
      title: 'Contact Curt Nicholson',
      state: 'contacts.list'
    });

    // Add the dropdown create item
    menuService.addSubMenuItem('topbar', 'contacts', {
      title: 'Create Contact',
      state: 'contacts.create',
      roles: ['user']
    });
  }
}());
