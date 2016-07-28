(function () {
  'use strict';

  angular
    .module('blogs.services')
    .factory('BlogsService', BlogsService);

  BlogsService.$inject = ['$resource'];

  function BlogsService($resource) {
    var Blog = $resource('api/blogs/:blogId', {
      blogId: '@_id'
    }, {
      update: {
        method: 'PUT'
      }
    });

    angular.extend(Blog.prototype, {
      createOrUpdate: function () {
        var blog = this;
        return createOrUpdate(blog);
      }
    });

    return Blog;

    function createOrUpdate(blog) {
      if (blog._id) {
        return blog.$update(onSuccess, onError);
      } else {
        return blog.$save(onSuccess, onError);
      }

      // Handle successful response
      function onSuccess(blog) {
        // Any required internal processing from inside the service, goes here.
      }

      // Handle error response
      function onError(errorResponse) {
        var error = errorResponse.data;
        // Handle error internally
        handleError(error);
      }
    }

    function handleError(error) {
      // Log error
      console.log(error);
    }
  }
}());
