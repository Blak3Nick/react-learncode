(function () {
  'use strict';

  angular
    .module('blogs')
    .controller('BlogsController', BlogsController);

  BlogsController.$inject = ['$scope', '$state', 'blogResolve', '$window', 'Authentication'];

  function BlogsController($scope, $state, blog, $window, Authentication) {
    var vm = this;

    vm.blog = blog;
    vm.authentication = Authentication;
    vm.error = null;
    vm.form = {};
    vm.remove = remove;
    vm.save = save;

    // Remove existing Blog
    function remove() {
      if ($window.confirm('Are you sure you want to delete?')) {
        vm.blog.$remove($state.go('blogs.list'));
      }
    }

    // Save Blog
    function save(isValid) {
      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'vm.form.blogForm');
        return false;
      }

      // Create a new blog, or update the current instance
      vm.blog.createOrUpdate()
        .then(successCallback)
        .catch(errorCallback);

      function successCallback(res) {
        $state.go('blogs.view', {
          blogId: res._id
        });
      }

      function errorCallback(res) {
        vm.error = res.data.message;
      }
    }
  }
}());
