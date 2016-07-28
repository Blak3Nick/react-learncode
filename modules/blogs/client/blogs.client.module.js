(function (app) {
  'use strict';

  app.registerModule('blogs', ['core']);// The core module is required for special route handling; see /core/client/config/core.client.routes
  app.registerModule('blogs.services');
  app.registerModule('blogs.routes', ['ui.router', 'core.routes', 'blogs.services']);
}(ApplicationConfiguration));
