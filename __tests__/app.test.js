require('dotenv').config();

const { execSync } = require('child_process');

const fakeRequest = require('supertest');
const app = require('../lib/app');
const client = require('../lib/client');

describe('app routes', () => {
  describe('routes', () => {
    let token;
  
    beforeAll(async done => {
      execSync('npm run setup-db');
  
      client.connect();
  
      const signInData = await fakeRequest(app)
        .post('/auth/signup')
        .send({
          email: 'jon@user.com',
          password: '1234'
        });
      
      token = signInData.body.token; // eslint-disable-line
  
      return done();
    });
  
    afterAll(done => {
      return client.end(done);
    });

    test('create new favorite', async() => {

      const newFavorites =
        {
          giphy_id: 'cfuL5gqFDreXxkWPPP',
          title: 'Rainbow Pizza'
        };

      const expectation = 
      {
        giphy_id: 'cfuL5gqFDreXxkWPPP',
        id: 4,
        owner_id: 2,
        title: 'Rainbow Pizza'
      };
      

      const data = await fakeRequest(app)
        .post('/api/favorites')
        .set('Authorization', token)
        .send(newFavorites)
        .expect('Content-Type', /json/)
        .expect(200);
console.log(token);
      expect(expectation).toEqual(data.body);
    });
  });
});
