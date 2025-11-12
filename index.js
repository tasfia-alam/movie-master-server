const express = require('express');
const app = express();
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.t8ykfq3.mongodb.net/?appName=Cluster0`;



const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

// async function run() {
//   try {
//     await client.connect();
//     console.log("✅ Connected to MongoDB!");

//     const db = client.db("movie_master");
//     const moviesCollection = db.collection("movies");

//     // All routes inside run()
//     app.get("/", (req, res) => {
//       res.send("🎬 MovieMasterPro server is running!");
//     });

//     app.get("/movies", async (req, res) => {
//       const result = await moviesCollection.find().toArray();
//       res.send(result);
//     });

//     app.get("/movies/:id", async (req, res) => {
//       const id = req.params.id;
//       const result = await moviesCollection.findOne({ _id: new ObjectId(id) });
//       res.send(result);
//     });

//     app.post("/movies", async (req, res) => {
//       const newMovie = req.body;
//       const result = await moviesCollection.insertOne(newMovie);
//       res.send(result);
//     });

//     app.patch("/movies/:id", async (req, res) => {
//       const id = req.params.id;
//       const updated = req.body;
//       const result = await moviesCollection.updateOne(
//         { _id: new ObjectId(id) },
//         { $set: updated }
//       );
//       res.send(result);
//     });







async function run() {
  try {
    const db = client.db("movie_master");
    const moviesCollection = db.collection("movies");
    console.log("MongoDB Connected Successfully");

    // GET all movies with optional filtering
    app.get("/movies", async (req, res) => {
      try {
        const { addedBy, genres, minRating, maxRating } = req.query;

        let query = {};

        // Filter by user
        if (addedBy) query.addedBy = addedBy;

        // Filter by multiple genres
        if (genres) {
          const genresArray = genres.split(",");
          query.genre = { $in: genresArray };
        }

        // Filter by rating range
        if (minRating || maxRating) {
          query.rating = {};
          if (minRating) query.rating.$gte = parseFloat(minRating);
          if (maxRating) query.rating.$lte = parseFloat(maxRating);
        }

        const movies = await moviesCollection.find(query).toArray();
        res.send(movies);
      } catch (error) {
        res.status(500).send({ error: "Failed to fetch movies" });
      }
    });

    // GET single movie
    app.get("/movies/:id", async (req, res) => {
      try {
        const id = req.params.id;
        const movie = await moviesCollection.findOne({ _id: new ObjectId(id) });
        res.send(movie);
      } catch (error) {
        res.status(500).send({ error: "Failed to fetch movie" });
      }
    });

    // POST add new movie
    app.post("/movies", async (req, res) => {
      try {
        const movie = req.body;
        const result = await moviesCollection.insertOne(movie);
        res.status(201).send({ success: true, data: result });
      } catch (error) {
        res.status(500).send({ success: false, message: error.message });
      }
    });

    // PATCH update movie fields (e.g., inWatchlist)
    app.patch("/movies/:id", async (req, res) => {
      try {
        const id = req.params.id;
        const updates = req.body; // { inWatchlist: true/false } বা অন্য fields
        const result = await moviesCollection.updateOne(
          { _id: new ObjectId(id) },
          { $set: updates }
        );
        res.send({ success: true, data: result });
      } catch (error) {
        res.status(500).send({ success: false, message: error.message });
      }
    });

    app.put("/movies/:id", async (req, res) => {
      try {
        const id = req.params.id;
        const updatedMovie = req.body;
        const result = await moviesCollection.updateOne(
          { _id: new ObjectId(id) },
          { $set: updatedMovie }
        );
        res.send({ success: true, data: result });
      } catch (error) {
        res.status(500).send({ success: false, message: error.message });
      }
    });

    app.delete("/movies/:id", async (req, res) => {
      try {
        const id = req.params.id;
        const result = await moviesCollection.deleteOne({
          _id: new ObjectId(id),
        });
        res.send({ success: true, data: result });
      } catch (error) {
        res.status(500).send({ success: false, message: error.message });
      }
    });
  } finally {
  }
}

run().catch(console.dir);

app.listen(port, () => {
  console.log(`🚀 MovieMasterPro Server is Running on Port ${port}`);
});