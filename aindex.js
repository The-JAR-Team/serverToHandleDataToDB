const express = require("express");
const { MongoClient } = require("mongodb");

const app = express();
const port = 3000;

const MONGODB_URI = process.env.MONGODB_URI;
const client = new MongoClient(MONGODB_URI);
const dbName = "viewsAna";
const collectionName = "simpleData";


app.use(express.json());

app.post("/data", async (req, res) => {
  try {
    const data = req.body;

  
    await client.connect();
    const db = client.db(dbName);
    const collection = db.collection(collectionName);

    await collection.insertOne(data);

    res.status(200).send("Data added to MongoDB successfully!");
  } catch (error) {
    console.error("Error saving data:", error);
    res.status(500).send("An error occurred while saving data.");
  }
});


app.get("/data", async (req, res) => {
  try {
   
    await client.connect();
    const db = client.db(dbName);
    const collection = db.collection(collectionName);

    const data = await collection.find({}).toArray();

    res.status(200).json(data);
  } catch (error) {
    console.error("Error retrieving data:", error);
    res.status(500).send("An error occurred while retrieving data.");
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
