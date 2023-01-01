const express = require("express");
const cors = require("cors");
const app = express();
const port = process.env.port || 5000;
require("dotenv").config();

//middleware
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("simple nodeserver running");
});

const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.jft02cx.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

// add below codes
async function run() {
  try {
    const servicesCollection = client
      .db("downtown-adidas-db")
      .collection("services");
    // write
    app.post("/services", async (req, res) => {
      const service = req.body;
      console.log(service);
      const result = await servicesCollection.insertOne(service);
      res.send(result);
    });
    //read
    app.get("/services", async (req, res) => {
      const query = {};
      const cursor = servicesCollection.find(query);
      const services = await cursor.toArray();
      res.send(services);
    });
    // delete
    app.delete("/services/:id", async (req, res) => {
      const id = req.params.id;
      //query is important
      const query = { _id: ObjectId(id) };
      const result = await servicesCollection.deleteOne(query);
      res.send(result);
    });
    //get
    // get the data to update from client side
    // find a specific document
    app.get("/services/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const service = await servicesCollection.findOne(query);
      res.send(service);
    });
    // update
    app.put("/services/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: ObjectId(id) };
      const newService = req.body;
      const option = { upsert: true }; //upsert -> update whole document
      const updatedService = {
        $set: {
          title: newService.title,
          price: newService.price,
          description: newService.description,
          photoUrl: newService.photoUrl,
        },
      };
      const result = await servicesCollection.updateOne(
        filter,
        updatedService,
        option
      );
      res.send(result);
    });
  } finally {
    //don't add close()
  }
}
run().catch((err) => console.log(err));
app.listen(port, () => {
  client.connect((err) => {
    if (err) {
      //catch database error
      console.log(err);
    } else {
      console.log("Connected to MongoDB");
    }
  });
  console.log(`simple node server running on port ${port}`);
});
