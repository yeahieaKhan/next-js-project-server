import express from "express";
import cors from "cors";
import { MongoClient, ObjectId, ServerApiVersion } from "mongodb";

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

const uri =
  "mongodb+srv://next_js_project:najYUQ3YbQCH6OAk@cluster0.3b745ya.mongodb.net/nextjsDB?retryWrites=true&w=majority";

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

    // Send a ping to confirm a successful connection

    // POST a new product (no validation)

    const nextProjects = client.db("next_projectDB");
    const productsCollection = nextProjects.collection("products");

    // GET all products
    app.get("/api/productItem", async (req, res) => {
      try {
        const products = await productsCollection.find({}).toArray();
        res.json(products);
      } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to fetch products" });
      }
    });

    app.post("/api/addproducts", async (req, res) => {
      console.log(req.body);
      const product = req.body;
      const result = await productsCollection.insertOne(product);
      res.json({ message: "Product added successfully!", product: result });
    });

    // Get single product by ID
    app.get("/api/productItem/:id", async (req, res) => {
      const id = req.params.id;
      console.log("Requested ID:", id);
      try {
        const result = await productsCollection.findOne({
          _id: new ObjectId(id),
        });
        res.send(result);
      } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Failed to get product" });
      }
    });

    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.listen(PORT, () => {
  console.log(`✅ Express API running at http://localhost:${PORT}`);
});
