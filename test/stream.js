/**
* Testing for stream api
*
* @see test/file to verify that the /library/other code is working
* @author ojourmel
*/

let request = require('supertest');

if ('coverage' == process.env.NODE_ENV) {
    request = request(require('../server'));
} else {
    request = request('http://localhost:8001');
}

// Use the README.md file for testing purposes
// This file is mounted in .travis-docker-compose.yml
const file = {
    name: 'README.md',
    mimetype: 'text/plain'
};

// Use a relative path regardelss if running in docker or locally.
// Use OMP_LIBRARY_ROOT to change file location
file.path = './README.md';

describe('stream api', function () {

    it('should 404 a bad id /stream/:id get', function (done) {
        request
            .get('/stream/' + 'badid')
            .expect(404, done);
    });

    // chain requests as they are done asynchronously
    it('should respond to /stream/:id get', function (done) {

        // Ugly dependency on /library/other/ to populate test data
        request
            .post('/library/other/')
            .set('Content-Type', 'application/json')
            .send(file)
            .end(function (perr, res) {
                file._id = res.body._id;

                // here is the actual test
                request
                    .get('/stream/' + file._id)
                    .expect(200)
                    .expect('Content-Type', new RegExp('^' + file.mimetype + '.*'))
                    .end(function () {

                        // Clean up test data, again, dependent on /other/
                        request
                            .delete('/library/other/' + file._id)
                            .end(function (derr, res){

                                if (derr) {
                                    done(derr);
                                } else {
                                    done();
                                }
                            });
                    });
            });
    });

    it('should 404 a bad path /stream/:id get', function (done) {
        file.path = 'nothere';

        // Ugly dependency on /library/other/ to populate test data
        request
            .post('/library/other/')
            .set('Content-Type', 'application/json')
            .send(file)
            .end(function (perr, res) {
                file._id = res.body._id;

                // here is the actual test
                request
                    .get('/stream/' + file._id)
                    .expect(404)
                    .end(function () {

                        // Clean up test data, again, dependent on /other/
                        request
                            .delete('/library/other/' + file._id)
                            .end(function (derr, res){

                                if (derr) {
                                    done(derr);
                                } else {
                                    done();
                                }
                            });
                    });
            });
    });
});
