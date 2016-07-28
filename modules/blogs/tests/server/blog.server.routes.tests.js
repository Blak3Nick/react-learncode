'use strict';

var should = require('should'),
  request = require('supertest'),
  path = require('path'),
  mongoose = require('mongoose'),
  User = mongoose.model('User'),
  Blog = mongoose.model('Blog'),
  express = require(path.resolve('./config/lib/express'));

/**
 * Globals
 */
var app,
  agent,
  credentials,
  user,
  blog;

/**
 * Blog routes tests
 */
describe('Blog CRUD tests', function () {

  before(function (done) {
    // Get application
    app = express.init(mongoose);
    agent = request.agent(app);

    done();
  });

  beforeEach(function (done) {
    // Create user credentials
    credentials = {
      username: 'username',
      password: 'M3@n.jsI$Aw3$0m3'
    };

    // Create a new user
    user = new User({
      firstName: 'Full',
      lastName: 'Name',
      displayName: 'Full Name',
      email: 'test@test.com',
      username: credentials.username,
      password: credentials.password,
      provider: 'local'
    });

    // Save a user to the test db and create new blog
    user.save(function () {
      blog = {
        title: 'Blog Title',
        content: 'Blog Content'
      };

      done();
    });
  });

  it('should be able to save an blog if logged in', function (done) {
    agent.post('/api/auth/signin')
      .send(credentials)
      .expect(200)
      .end(function (signinErr, signinRes) {
        // Handle signin error
        if (signinErr) {
          return done(signinErr);
        }

        // Get the userId
        var userId = user.id;

        // Save a new blog
        agent.post('/api/blogs')
          .send(blog)
          .expect(200)
          .end(function (blogSaveErr, blogSaveRes) {
            // Handle blog save error
            if (blogSaveErr) {
              return done(blogSaveErr);
            }

            // Get a list of blogs
            agent.get('/api/blogs')
              .end(function (blogsGetErr, blogsGetRes) {
                // Handle blog save error
                if (blogsGetErr) {
                  return done(blogsGetErr);
                }

                // Get blogs list
                var blogs = blogsGetRes.body;

                // Set assertions
                (blogs[0].user._id).should.equal(userId);
                (blogs[0].title).should.match('Blog Title');

                // Call the assertion callback
                done();
              });
          });
      });
  });

  it('should not be able to save an blog if not logged in', function (done) {
    agent.post('/api/blogs')
      .send(blog)
      .expect(403)
      .end(function (blogSaveErr, blogSaveRes) {
        // Call the assertion callback
        done(blogSaveErr);
      });
  });

  it('should not be able to save an blog if no title is provided', function (done) {
    // Invalidate title field
    blog.title = '';

    agent.post('/api/auth/signin')
      .send(credentials)
      .expect(200)
      .end(function (signinErr, signinRes) {
        // Handle signin error
        if (signinErr) {
          return done(signinErr);
        }

        // Get the userId
        var userId = user.id;

        // Save a new blog
        agent.post('/api/blogs')
          .send(blog)
          .expect(400)
          .end(function (blogSaveErr, blogSaveRes) {
            // Set message assertion
            (blogSaveRes.body.message).should.match('Title cannot be blank');

            // Handle blog save error
            done(blogSaveErr);
          });
      });
  });

  it('should be able to update an blog if signed in', function (done) {
    agent.post('/api/auth/signin')
      .send(credentials)
      .expect(200)
      .end(function (signinErr, signinRes) {
        // Handle signin error
        if (signinErr) {
          return done(signinErr);
        }

        // Get the userId
        var userId = user.id;

        // Save a new blog
        agent.post('/api/blogs')
          .send(blog)
          .expect(200)
          .end(function (blogSaveErr, blogSaveRes) {
            // Handle blog save error
            if (blogSaveErr) {
              return done(blogSaveErr);
            }

            // Update blog title
            blog.title = 'WHY YOU GOTTA BE SO MEAN?';

            // Update an existing blog
            agent.put('/api/blogs/' + blogSaveRes.body._id)
              .send(blog)
              .expect(200)
              .end(function (blogUpdateErr, blogUpdateRes) {
                // Handle blog update error
                if (blogUpdateErr) {
                  return done(blogUpdateErr);
                }

                // Set assertions
                (blogUpdateRes.body._id).should.equal(blogSaveRes.body._id);
                (blogUpdateRes.body.title).should.match('WHY YOU GOTTA BE SO MEAN?');

                // Call the assertion callback
                done();
              });
          });
      });
  });

  it('should be able to get a list of blogs if not signed in', function (done) {
    // Create new blog model instance
    var blogObj = new Blog(blog);

    // Save the blog
    blogObj.save(function () {
      // Request blogs
      request(app).get('/api/blogs')
        .end(function (req, res) {
          // Set assertion
          res.body.should.be.instanceof(Array).and.have.lengthOf(1);

          // Call the assertion callback
          done();
        });

    });
  });

  it('should be able to get a single blog if not signed in', function (done) {
    // Create new blog model instance
    var blogObj = new Blog(blog);

    // Save the blog
    blogObj.save(function () {
      request(app).get('/api/blogs/' + blogObj._id)
        .end(function (req, res) {
          // Set assertion
          res.body.should.be.instanceof(Object).and.have.property('title', blog.title);

          // Call the assertion callback
          done();
        });
    });
  });

  it('should return proper error for single blog with an invalid Id, if not signed in', function (done) {
    // test is not a valid mongoose Id
    request(app).get('/api/blogs/test')
      .end(function (req, res) {
        // Set assertion
        res.body.should.be.instanceof(Object).and.have.property('message', 'Blog is invalid');

        // Call the assertion callback
        done();
      });
  });

  it('should return proper error for single blog which doesnt exist, if not signed in', function (done) {
    // This is a valid mongoose Id but a non-existent blog
    request(app).get('/api/blogs/559e9cd815f80b4c256a8f41')
      .end(function (req, res) {
        // Set assertion
        res.body.should.be.instanceof(Object).and.have.property('message', 'No blog with that identifier has been found');

        // Call the assertion callback
        done();
      });
  });

  it('should be able to delete an blog if signed in', function (done) {
    agent.post('/api/auth/signin')
      .send(credentials)
      .expect(200)
      .end(function (signinErr, signinRes) {
        // Handle signin error
        if (signinErr) {
          return done(signinErr);
        }

        // Get the userId
        var userId = user.id;

        // Save a new blog
        agent.post('/api/blogs')
          .send(blog)
          .expect(200)
          .end(function (blogSaveErr, blogSaveRes) {
            // Handle blog save error
            if (blogSaveErr) {
              return done(blogSaveErr);
            }

            // Delete an existing blog
            agent.delete('/api/blogs/' + blogSaveRes.body._id)
              .send(blog)
              .expect(200)
              .end(function (blogDeleteErr, blogDeleteRes) {
                // Handle blog error error
                if (blogDeleteErr) {
                  return done(blogDeleteErr);
                }

                // Set assertions
                (blogDeleteRes.body._id).should.equal(blogSaveRes.body._id);

                // Call the assertion callback
                done();
              });
          });
      });
  });

  it('should not be able to delete an blog if not signed in', function (done) {
    // Set blog user
    blog.user = user;

    // Create new blog model instance
    var blogObj = new Blog(blog);

    // Save the blog
    blogObj.save(function () {
      // Try deleting blog
      request(app).delete('/api/blogs/' + blogObj._id)
        .expect(403)
        .end(function (blogDeleteErr, blogDeleteRes) {
          // Set message assertion
          (blogDeleteRes.body.message).should.match('User is not authorized');

          // Handle blog error error
          done(blogDeleteErr);
        });

    });
  });

  it('should be able to get a single blog that has an orphaned user reference', function (done) {
    // Create orphan user creds
    var _creds = {
      username: 'orphan',
      password: 'M3@n.jsI$Aw3$0m3'
    };

    // Create orphan user
    var _orphan = new User({
      firstName: 'Full',
      lastName: 'Name',
      displayName: 'Full Name',
      email: 'orphan@test.com',
      username: _creds.username,
      password: _creds.password,
      provider: 'local'
    });

    _orphan.save(function (err, orphan) {
      // Handle save error
      if (err) {
        return done(err);
      }

      agent.post('/api/auth/signin')
        .send(_creds)
        .expect(200)
        .end(function (signinErr, signinRes) {
          // Handle signin error
          if (signinErr) {
            return done(signinErr);
          }

          // Get the userId
          var orphanId = orphan._id;

          // Save a new blog
          agent.post('/api/blogs')
            .send(blog)
            .expect(200)
            .end(function (blogSaveErr, blogSaveRes) {
              // Handle blog save error
              if (blogSaveErr) {
                return done(blogSaveErr);
              }

              // Set assertions on new blog
              (blogSaveRes.body.title).should.equal(blog.title);
              should.exist(blogSaveRes.body.user);
              should.equal(blogSaveRes.body.user._id, orphanId);

              // force the blog to have an orphaned user reference
              orphan.remove(function () {
                // now signin with valid user
                agent.post('/api/auth/signin')
                  .send(credentials)
                  .expect(200)
                  .end(function (err, res) {
                    // Handle signin error
                    if (err) {
                      return done(err);
                    }

                    // Get the blog
                    agent.get('/api/blogs/' + blogSaveRes.body._id)
                      .expect(200)
                      .end(function (blogInfoErr, blogInfoRes) {
                        // Handle blog error
                        if (blogInfoErr) {
                          return done(blogInfoErr);
                        }

                        // Set assertions
                        (blogInfoRes.body._id).should.equal(blogSaveRes.body._id);
                        (blogInfoRes.body.title).should.equal(blog.title);
                        should.equal(blogInfoRes.body.user, undefined);

                        // Call the assertion callback
                        done();
                      });
                  });
              });
            });
        });
    });
  });

  it('should be able to get a single blog if signed in and verify the custom "isCurrentUserOwner" field is set to "true"', function (done) {
    // Create new blog model instance
    blog.user = user;
    var blogObj = new Blog(blog);

    // Save the blog
    blogObj.save(function () {
      agent.post('/api/auth/signin')
        .send(credentials)
        .expect(200)
        .end(function (signinErr, signinRes) {
          // Handle signin error
          if (signinErr) {
            return done(signinErr);
          }

          // Get the userId
          var userId = user.id;

          // Save a new blog
          agent.post('/api/blogs')
            .send(blog)
            .expect(200)
            .end(function (blogSaveErr, blogSaveRes) {
              // Handle blog save error
              if (blogSaveErr) {
                return done(blogSaveErr);
              }

              // Get the blog
              agent.get('/api/blogs/' + blogSaveRes.body._id)
                .expect(200)
                .end(function (blogInfoErr, blogInfoRes) {
                  // Handle blog error
                  if (blogInfoErr) {
                    return done(blogInfoErr);
                  }

                  // Set assertions
                  (blogInfoRes.body._id).should.equal(blogSaveRes.body._id);
                  (blogInfoRes.body.title).should.equal(blog.title);

                  // Assert that the "isCurrentUserOwner" field is set to true since the current User created it
                  (blogInfoRes.body.isCurrentUserOwner).should.equal(true);

                  // Call the assertion callback
                  done();
                });
            });
        });
    });
  });

  it('should be able to get a single blog if not signed in and verify the custom "isCurrentUserOwner" field is set to "false"', function (done) {
    // Create new blog model instance
    var blogObj = new Blog(blog);

    // Save the blog
    blogObj.save(function () {
      request(app).get('/api/blogs/' + blogObj._id)
        .end(function (req, res) {
          // Set assertion
          res.body.should.be.instanceof(Object).and.have.property('title', blog.title);
          // Assert the custom field "isCurrentUserOwner" is set to false for the un-authenticated User
          res.body.should.be.instanceof(Object).and.have.property('isCurrentUserOwner', false);
          // Call the assertion callback
          done();
        });
    });
  });

  it('should be able to get single blog, that a different user created, if logged in & verify the "isCurrentUserOwner" field is set to "false"', function (done) {
    // Create temporary user creds
    var _creds = {
      username: 'temp',
      password: 'M3@n.jsI$Aw3$0m3'
    };

    // Create temporary user
    var _user = new User({
      firstName: 'Full',
      lastName: 'Name',
      displayName: 'Full Name',
      email: 'temp@test.com',
      username: _creds.username,
      password: _creds.password,
      provider: 'local'
    });

    _user.save(function (err, _user) {
      // Handle save error
      if (err) {
        return done(err);
      }

      // Sign in with the user that will create the Blog
      agent.post('/api/auth/signin')
        .send(credentials)
        .expect(200)
        .end(function (signinErr, signinRes) {
          // Handle signin error
          if (signinErr) {
            return done(signinErr);
          }

          // Get the userId
          var userId = user._id;

          // Save a new blog
          agent.post('/api/blogs')
            .send(blog)
            .expect(200)
            .end(function (blogSaveErr, blogSaveRes) {
              // Handle blog save error
              if (blogSaveErr) {
                return done(blogSaveErr);
              }

              // Set assertions on new blog
              (blogSaveRes.body.title).should.equal(blog.title);
              should.exist(blogSaveRes.body.user);
              should.equal(blogSaveRes.body.user._id, userId);

              // now signin with the temporary user
              agent.post('/api/auth/signin')
                .send(_creds)
                .expect(200)
                .end(function (err, res) {
                  // Handle signin error
                  if (err) {
                    return done(err);
                  }

                  // Get the blog
                  agent.get('/api/blogs/' + blogSaveRes.body._id)
                    .expect(200)
                    .end(function (blogInfoErr, blogInfoRes) {
                      // Handle blog error
                      if (blogInfoErr) {
                        return done(blogInfoErr);
                      }

                      // Set assertions
                      (blogInfoRes.body._id).should.equal(blogSaveRes.body._id);
                      (blogInfoRes.body.title).should.equal(blog.title);
                      // Assert that the custom field "isCurrentUserOwner" is set to false since the current User didn't create it
                      (blogInfoRes.body.isCurrentUserOwner).should.equal(false);

                      // Call the assertion callback
                      done();
                    });
                });
            });
        });
    });
  });

  afterEach(function (done) {
    User.remove().exec(function () {
      Blog.remove().exec(done);
    });
  });
});
