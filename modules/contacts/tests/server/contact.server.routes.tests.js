'use strict';

var should = require('should'),
  request = require('supertest'),
  path = require('path'),
  mongoose = require('mongoose'),
  User = mongoose.model('User'),
  Contact = mongoose.model('Contact'),
  express = require(path.resolve('./config/lib/express'));

/**
 * Globals
 */
var app,
  agent,
  credentials,
  user,
  contact;

/**
 * Contact routes tests
 */
describe('Contact CRUD tests', function () {

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

    // Save a user to the test db and create new contact
    user.save(function () {
      contact = {
        title: 'Contact Title',
        content: 'Contact Content'
      };

      done();
    });
  });

  it('should be able to save an contact if logged in', function (done) {
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

        // Save a new contact
        agent.post('/api/contacts')
          .send(contact)
          .expect(200)
          .end(function (contactSaveErr, contactSaveRes) {
            // Handle contact save error
            if (contactSaveErr) {
              return done(contactSaveErr);
            }

            // Get a list of contacts
            agent.get('/api/contacts')
              .end(function (contactsGetErr, contactsGetRes) {
                // Handle contact save error
                if (contactsGetErr) {
                  return done(contactsGetErr);
                }

                // Get contacts list
                var contacts = contactsGetRes.body;

                // Set assertions
                (contacts[0].user._id).should.equal(userId);
                (contacts[0].title).should.match('Contact Title');

                // Call the assertion callback
                done();
              });
          });
      });
  });

  it('should not be able to save an contact if not logged in', function (done) {
    agent.post('/api/contacts')
      .send(contact)
      .expect(403)
      .end(function (contactSaveErr, contactSaveRes) {
        // Call the assertion callback
        done(contactSaveErr);
      });
  });

  it('should not be able to save an contact if no title is provided', function (done) {
    // Invalidate title field
    contact.title = '';

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

        // Save a new contact
        agent.post('/api/contacts')
          .send(contact)
          .expect(400)
          .end(function (contactSaveErr, contactSaveRes) {
            // Set message assertion
            (contactSaveRes.body.message).should.match('Title cannot be blank');

            // Handle contact save error
            done(contactSaveErr);
          });
      });
  });

  it('should be able to update an contact if signed in', function (done) {
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

        // Save a new contact
        agent.post('/api/contacts')
          .send(contact)
          .expect(200)
          .end(function (contactSaveErr, contactSaveRes) {
            // Handle contact save error
            if (contactSaveErr) {
              return done(contactSaveErr);
            }

            // Update contact title
            contact.title = 'WHY YOU GOTTA BE SO MEAN?';

            // Update an existing contact
            agent.put('/api/contacts/' + contactSaveRes.body._id)
              .send(contact)
              .expect(200)
              .end(function (contactUpdateErr, contactUpdateRes) {
                // Handle contact update error
                if (contactUpdateErr) {
                  return done(contactUpdateErr);
                }

                // Set assertions
                (contactUpdateRes.body._id).should.equal(contactSaveRes.body._id);
                (contactUpdateRes.body.title).should.match('WHY YOU GOTTA BE SO MEAN?');

                // Call the assertion callback
                done();
              });
          });
      });
  });

  it('should be able to get a list of contacts if not signed in', function (done) {
    // Create new contact model instance
    var contactObj = new Contact(contact);

    // Save the contact
    contactObj.save(function () {
      // Request contacts
      request(app).get('/api/contacts')
        .end(function (req, res) {
          // Set assertion
          res.body.should.be.instanceof(Array).and.have.lengthOf(1);

          // Call the assertion callback
          done();
        });

    });
  });

  it('should be able to get a single contact if not signed in', function (done) {
    // Create new contact model instance
    var contactObj = new Contact(contact);

    // Save the contact
    contactObj.save(function () {
      request(app).get('/api/contacts/' + contactObj._id)
        .end(function (req, res) {
          // Set assertion
          res.body.should.be.instanceof(Object).and.have.property('title', contact.title);

          // Call the assertion callback
          done();
        });
    });
  });

  it('should return proper error for single contact with an invalid Id, if not signed in', function (done) {
    // test is not a valid mongoose Id
    request(app).get('/api/contacts/test')
      .end(function (req, res) {
        // Set assertion
        res.body.should.be.instanceof(Object).and.have.property('message', 'Contact is invalid');

        // Call the assertion callback
        done();
      });
  });

  it('should return proper error for single contact which doesnt exist, if not signed in', function (done) {
    // This is a valid mongoose Id but a non-existent contact
    request(app).get('/api/contacts/559e9cd815f80b4c256a8f41')
      .end(function (req, res) {
        // Set assertion
        res.body.should.be.instanceof(Object).and.have.property('message', 'No contact with that identifier has been found');

        // Call the assertion callback
        done();
      });
  });

  it('should be able to delete an contact if signed in', function (done) {
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

        // Save a new contact
        agent.post('/api/contacts')
          .send(contact)
          .expect(200)
          .end(function (contactSaveErr, contactSaveRes) {
            // Handle contact save error
            if (contactSaveErr) {
              return done(contactSaveErr);
            }

            // Delete an existing contact
            agent.delete('/api/contacts/' + contactSaveRes.body._id)
              .send(contact)
              .expect(200)
              .end(function (contactDeleteErr, contactDeleteRes) {
                // Handle contact error error
                if (contactDeleteErr) {
                  return done(contactDeleteErr);
                }

                // Set assertions
                (contactDeleteRes.body._id).should.equal(contactSaveRes.body._id);

                // Call the assertion callback
                done();
              });
          });
      });
  });

  it('should not be able to delete an contact if not signed in', function (done) {
    // Set contact user
    contact.user = user;

    // Create new contact model instance
    var contactObj = new Contact(contact);

    // Save the contact
    contactObj.save(function () {
      // Try deleting contact
      request(app).delete('/api/contacts/' + contactObj._id)
        .expect(403)
        .end(function (contactDeleteErr, contactDeleteRes) {
          // Set message assertion
          (contactDeleteRes.body.message).should.match('User is not authorized');

          // Handle contact error error
          done(contactDeleteErr);
        });

    });
  });

  it('should be able to get a single contact that has an orphaned user reference', function (done) {
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

          // Save a new contact
          agent.post('/api/contacts')
            .send(contact)
            .expect(200)
            .end(function (contactSaveErr, contactSaveRes) {
              // Handle contact save error
              if (contactSaveErr) {
                return done(contactSaveErr);
              }

              // Set assertions on new contact
              (contactSaveRes.body.title).should.equal(contact.title);
              should.exist(contactSaveRes.body.user);
              should.equal(contactSaveRes.body.user._id, orphanId);

              // force the contact to have an orphaned user reference
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

                    // Get the contact
                    agent.get('/api/contacts/' + contactSaveRes.body._id)
                      .expect(200)
                      .end(function (contactInfoErr, contactInfoRes) {
                        // Handle contact error
                        if (contactInfoErr) {
                          return done(contactInfoErr);
                        }

                        // Set assertions
                        (contactInfoRes.body._id).should.equal(contactSaveRes.body._id);
                        (contactInfoRes.body.title).should.equal(contact.title);
                        should.equal(contactInfoRes.body.user, undefined);

                        // Call the assertion callback
                        done();
                      });
                  });
              });
            });
        });
    });
  });

  it('should be able to get a single contact if signed in and verify the custom "isCurrentUserOwner" field is set to "true"', function (done) {
    // Create new contact model instance
    contact.user = user;
    var contactObj = new Contact(contact);

    // Save the contact
    contactObj.save(function () {
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

          // Save a new contact
          agent.post('/api/contacts')
            .send(contact)
            .expect(200)
            .end(function (contactSaveErr, contactSaveRes) {
              // Handle contact save error
              if (contactSaveErr) {
                return done(contactSaveErr);
              }

              // Get the contact
              agent.get('/api/contacts/' + contactSaveRes.body._id)
                .expect(200)
                .end(function (contactInfoErr, contactInfoRes) {
                  // Handle contact error
                  if (contactInfoErr) {
                    return done(contactInfoErr);
                  }

                  // Set assertions
                  (contactInfoRes.body._id).should.equal(contactSaveRes.body._id);
                  (contactInfoRes.body.title).should.equal(contact.title);

                  // Assert that the "isCurrentUserOwner" field is set to true since the current User created it
                  (contactInfoRes.body.isCurrentUserOwner).should.equal(true);

                  // Call the assertion callback
                  done();
                });
            });
        });
    });
  });

  it('should be able to get a single contact if not signed in and verify the custom "isCurrentUserOwner" field is set to "false"', function (done) {
    // Create new contact model instance
    var contactObj = new Contact(contact);

    // Save the contact
    contactObj.save(function () {
      request(app).get('/api/contacts/' + contactObj._id)
        .end(function (req, res) {
          // Set assertion
          res.body.should.be.instanceof(Object).and.have.property('title', contact.title);
          // Assert the custom field "isCurrentUserOwner" is set to false for the un-authenticated User
          res.body.should.be.instanceof(Object).and.have.property('isCurrentUserOwner', false);
          // Call the assertion callback
          done();
        });
    });
  });

  it('should be able to get single contact, that a different user created, if logged in & verify the "isCurrentUserOwner" field is set to "false"', function (done) {
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

      // Sign in with the user that will create the Contact
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

          // Save a new contact
          agent.post('/api/contacts')
            .send(contact)
            .expect(200)
            .end(function (contactSaveErr, contactSaveRes) {
              // Handle contact save error
              if (contactSaveErr) {
                return done(contactSaveErr);
              }

              // Set assertions on new contact
              (contactSaveRes.body.title).should.equal(contact.title);
              should.exist(contactSaveRes.body.user);
              should.equal(contactSaveRes.body.user._id, userId);

              // now signin with the temporary user
              agent.post('/api/auth/signin')
                .send(_creds)
                .expect(200)
                .end(function (err, res) {
                  // Handle signin error
                  if (err) {
                    return done(err);
                  }

                  // Get the contact
                  agent.get('/api/contacts/' + contactSaveRes.body._id)
                    .expect(200)
                    .end(function (contactInfoErr, contactInfoRes) {
                      // Handle contact error
                      if (contactInfoErr) {
                        return done(contactInfoErr);
                      }

                      // Set assertions
                      (contactInfoRes.body._id).should.equal(contactSaveRes.body._id);
                      (contactInfoRes.body.title).should.equal(contact.title);
                      // Assert that the custom field "isCurrentUserOwner" is set to false since the current User didn't create it
                      (contactInfoRes.body.isCurrentUserOwner).should.equal(false);

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
      Contact.remove().exec(done);
    });
  });
});
