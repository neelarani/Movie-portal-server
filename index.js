require('dotenv').config();
const express = require('express');
const app = express();
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.fdepx.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();

    const database = client.db('moviePortalDB');
    const userCollection = database.collection('users');
    const movieCollection = database.collection('movies');
    const favoriteMovieCollection = database.collection('favoriteMovie');

    app.post('/users', async (req, res) => {
      const user = req.body;
      const result = await userCollection.insertOne(user);
      res.send(result);
    });

    app.post('/favoriteMovie', async (req, res) => {
      const favorite = req.body;
      const result = await favoriteMovieCollection.insertOne(favorite);
      res.send(result);
    });

    app.get('/favoriteMovie/:email', async (req, res) => {
      const email = req.params.email;
      const query = { userEmail: email };
      const result = await favoriteMovieCollection.find(query).toArray();
      res.send(result);
    });

    app.get('/movies', async (req, res) => {
      const cursor = movieCollection.find().sort({ rating: -1 });
      const result = await cursor.toArray();
      res.send(result);
    });

    app.get('/movies-item', async (req, res) => {
      const cursor = movieCollection.find().sort({ rating: -1 }).limit(6);
      const result = await cursor.toArray();
      res.send(result);
    });

    app.get('/movies/:id', async (req, res) => {
      const { id } = req.params;
      const result = await movieCollection.findOne({ _id: new ObjectId(id) });
      res.send(result);
    });

    app.post('/movies', async (req, res) => {
      const newMovie = req.body;
      console.log(newMovie);
      const result = await movieCollection.insertOne(newMovie);
      res.send(result);
    });

    app.get('/movies/:id', async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const result = await movieCollection.findOne(filter);
      res.send(result);
    });

    app.put('/movies/:id', async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const options = { upset: true };
      const updatedMovie = req.body;
      const movie = {
        $set: {
          moviePoster: updatedMovie.moviePoster,
          movieTitle: updatedMovie.movieTitle,
          genre: updatedMovie.genre,
          duration: updatedMovie.duration,
          releaseYear: updatedMovie.releaseYear,
          rating: updatedMovie.rating,
          summary: updatedMovie.summary,
        },
      };
      const result = await movieCollection.updateOne(filter, movie, options);
      res.send(result);
    });

    app.delete('/movies/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await movieCollection.deleteOne(query);
      res.send(result);
    });

    app.delete('/favoriteMovie/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await favoriteMovieCollection.deleteOne(query);
      res.send(result);
    });

    // Send a ping to confirm a successful connection
    await client.db('admin').command({ ping: 1 });
    console.log(
      'Pinged your deployment. You successfully connected to MongoDB!'
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get('/', (req, res) => {
  res.send('Movie Portal is Running');
});

app.listen(port, () => {
  console.log(`Movie portal Running port is: ${port}`);
});
