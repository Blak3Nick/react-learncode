(function (app) {
  'use strict';

  app.registerModule('blog');// The core module is required for special route handling; see /core/client/config/core.client.routes
  app.registerModule('blog.services');
  app.registerModule('blog.routes', ['ui.router', 'core.routes', 'blog.services']);
}(ApplicationConfiguration));
