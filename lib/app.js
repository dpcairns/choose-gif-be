const express = require('express');
const cors = require('cors');
const client = require('./client.js');
const app = express();
const morgan = require('morgan');
const ensureAuth = require('./auth/ensure-auth');
const createAuthRoutes = require('./auth/create-auth-routes');
const request = require('superagent');

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(morgan('dev')); // http logging

const authRoutes = createAuthRoutes();

// setup authentication routes to give user an auth token
// creates a /auth/signin and a /auth/signup POST route. 
// each requires a POST body with a .email and a .password
app.use('/auth', authRoutes);

// everything that starts with "/api" below here requires an auth token!
app.use('/api', ensureAuth);

// and now every request that has a token in the Authorization header will have a `req.userId` property for us to see who's talking
app.get('/api/test', (req, res) => {
  res.json({
    message: `in this proctected route, we get the user's id like so: ${req.userId}`
  });
});

app.get('/search', async(req, res) => {
  try {
    const data = await request.get(`https://api.giphy.com/v1/gifs/search?api_key=${process.env.GIPHY_KEY}&q=${req.query.query}&limit=30&rating=pg-13&lang=en`);
    
    res.json(data.body);
  } catch(e) {
    
    res.status(500).json({ error: e.message });
  }
});

app.get('/trending', async(req, res) => {
  try {
    const data = await request.get(`https://api.giphy.com/v1/gifs/trending?api_key=${process.env.GIPHY_KEY}&limit=6&rating=pg-13&lang=en`);
    
    res.json(data.body);
  } catch(e) {
    
    res.status(500).json({ error: e.message });
  }
});

app.get('/trendinglist', async(req, res) => {
  try {
    const data = await request.get(`https://api.giphy.com/v1/trending/searches?api_key=${process.env.GIPHY_KEY}`);
    
    res.json(data.body);
  } catch(e) {
    
    res.status(500).json({ error: e.message });
  }
});

app.get('/categories', async(req, res) => {
  try {
    const data = await request.get(`https://api.giphy.com/v1/gifs/categories?api_key=${process.env.GIPHY_KEY}`);
    
    res.json(data.body);
  } catch(e) {
    
    res.status(500).json({ error: e.message });
  }
});

app.get('/favorites', async(req, res) => {
  try {
    const data = await client.query('SELECT * from favorites');
    
    res.json(data.rows);
  } catch(e) {
    
    res.status(500).json({ error: e.message });
  }
});

app.get('/api/favorites', async(req, res) => {
  try {
    const data = await client.query(`
    SELECT * FROM FAVORITES
    WHERE OWNER_ID = $1
    `, [req.userId]);
    res.json(data.rows);
  } catch(e) {
    
    res.status(500).json({ error: e.message });
  }
});
app.post('/api/favorites', async(req, res) => {
  try {
    const data = await client.query(`
      INSERT INTO FAVORITES (giphy_id, title, owner_id)
      VALUES ($1, $2, $3)
      RETURNING *;
      `,
    [req.body.giphy_id, req.body.title, req.userId]);
    res.json(data.rows[0]);
  } catch(e) {
    
    res.status(500).json({ error: e.message });
  }
});

app.get('/api/favorites/:id', async(req, res) => {
  try {
    const data = await client.query(`
      SELECT * FROM FAVORITES
      WHERE GIPHY_ID = $1 AND OWNER_ID = $2
      `, [req.params.id, req.userId]);
    res.json(data.rows[0]);
  } catch(e) {
    
    res.status(500).json({ error: e.message });
  }
});

app.delete('/api/favorites/:id', async(req, res) => {
  try {
    const data = await client.query(`
    DELETE FROM FAVORITES
    WHERE GIPHY_ID = $1
    RETURNING *;
    `,
    [req.params.id]);
    res.json(data.rows[0]);
  } catch(e) {
    
    res.status(500).json({ error: e.message });
  }
});

app.use(require('./middleware/error'));

module.exports = app;
