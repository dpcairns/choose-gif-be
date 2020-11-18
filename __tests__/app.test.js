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

      const newFavorites2 =
        {
          giphy_id: 'cfuL5gqFDreXxkWQQQ',
          title: 'Qwerty'
        };

      const expectation = 
        {
          giphy_id: 'cfuL5gqFDreXxkWPPP',
          id: 4,
          owner_id: 2,
          title: 'Rainbow Pizza'
        };

      const expectation2 = 
        {
          giphy_id: 'cfuL5gqFDreXxkWQQQ',
          id: 5,
          owner_id: 2,
          title: 'Qwerty'
        };
      
      const data = await fakeRequest(app)
        .post('/api/favorites')
        .set('Authorization', token)
        .send(newFavorites)
        .expect('Content-Type', /json/)
        .expect(200);

      const data2 = await fakeRequest(app)
        .post('/api/favorites')
        .set('Authorization', token)
        .send(newFavorites2)
        .expect('Content-Type', /json/)
        .expect(200);

      expect(expectation).toEqual(data.body);
      expect(expectation2).toEqual(data2.body);
    });

    test('get all favorites', async() => {

      const expectation = [
        {
          giphy_id: 'cfuL5gqFDreXxkWPPP',
          id: 4,
          owner_id: 2,
          title: 'Rainbow Pizza'
        },
        {
          giphy_id: 'cfuL5gqFDreXxkWQQQ',
          id: 5,
          owner_id: 2,
          title: 'Qwerty'
        }
      ];

      const data = await fakeRequest(app)
        .get('/api/favorites')
        .set('Authorization', token)
        .expect('Content-Type', /json/)
        .expect(200);

      expect(expectation).toEqual(data.body);
    });

    test('get one favorite by id', async() => {

      const expectation = 
        {
          giphy_id: 'cfuL5gqFDreXxkWPPP',
          id: 4,
          owner_id: 2,
          title: 'Rainbow Pizza'
        };
      
      const data = await fakeRequest(app)
        .get('/api/favorites/cfuL5gqFDreXxkWPPP')
        .set('Authorization', token)
        .expect('Content-Type', /json/)
        .expect(200);

      expect(expectation).toEqual(data.body);
    });

    test('delete one favorite', async() => {

      const deletedFavorite = 
        {
          giphy_id: 'cfuL5gqFDreXxkWPPP',
          id: 4,
          owner_id: 2,
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
        .delete(`/api/favorites/${deletedFavorite.giphy_id}`)
        .set('Authorization', token)
        // .send(deletedFavorite)
        .expect('Content-Type', /json/)
        .expect(200);

      await fakeRequest(app)
        .get('/api/favorites')
        .set('Authorization', token)
        .expect('Content-Type', /json/)
        .expect(200);

      expect(expectation).toEqual(data.body);
    });

    test('get search results from search bar', async() => {

      const expectation = true;

      let isTrue = false;
      
      const data = await fakeRequest(app)
        .get('/search?query=cart')
        .expect('Content-Type', /json/)
        .expect(200);

      if(data.body.data[0].id && data.body.data[0].title) {
        isTrue = true;
      } else {
        isTrue = false;
      }

      expect(expectation).toEqual(isTrue);
    });

    test('get search results from search by id', async() => {

      const expectation = true;

      let isTrue = false;
      
      const data = await fakeRequest(app)
        .get('/search/2p15M2c5lmc7u')
        .expect('Content-Type', /json/)
        .expect(200);

      if(data.body.data.id === '2p15M2c5lmc7u' && data.body.data.title === 'trash GIF') {
        isTrue = true;
      } else {
        isTrue = false;
      }

      expect(expectation).toEqual(isTrue);
    });

    test('get search results from trending endpoint', async() => {

      const expectation = true;

      let isTrue = false;
      
      const data = await fakeRequest(app)
        .get('/trending')
        .expect('Content-Type', /json/)
        .expect(200);

      if(data.body.data[0].id && data.body.data[0].title) {
        isTrue = true;
      } else {
        isTrue = false;
      }

      expect(expectation).toEqual(isTrue);
    });

    test('get search results from trendinglist endpoint', async() => {

      const expectation = true;

      let isTrue = false;
      
      const data = await fakeRequest(app)
        .get('/trendinglist')
        .expect('Content-Type', /json/)
        .expect(200);

      if(data.body.data.length > 10 && data.body.data[1]) {
        isTrue = true;
      } else {
        isTrue = false;
      }

      expect(expectation).toEqual(isTrue);
    });

    test('get search results from categories endpoint', async() => {

      const expectation = true;

      let isTrue = false;
      
      const data = await fakeRequest(app)
        .get('/categories')
        .expect('Content-Type', /json/)
        .expect(200);

      if(data.body.data[0].name && data.body.data[0].subcategories[0].name && data.body.data[0].gif['id']) {
        isTrue = true;
      } else {
        isTrue = false;
      }

      expect(expectation).toEqual(isTrue);
    });











  });
});
