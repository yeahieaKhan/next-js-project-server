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
    const usersCollections = nextProjects.collection("users");

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

    // ✅ API: Get all products sorted by top price
    app.get("/top-price", async (req, res) => {
      const products = await productsCollection
        .find()
        .sort({ price: -1 })
        .limit(6) // descending order
        .toArray();
      res.json(products);
    });

    // users

    // Register API

    app.post("/api/register", async (req, res) => {
      try {
        const { username, password } = req.body;

        if (!username || !password) {
          return res
            .status(400)
            .json({ message: "username and password are required" });
        }

        const existingUser = await usersCollections.findOne({ username });
        if (existingUser) {
          return res.status(400).json({ message: "User already exists" });
        }

        const result = await usersCollections.insertOne({ username, password });
        res
          .status(201)
          .json({
            message: "User registered successfully!",
            userId: result.insertedId,
          });
      } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error registering user", error });
      }
    });

    // Login API
    app.post("/api/login", async (req, res) => {
      try {
        const { username, password } = req.body;

        // Find user in MongoDB collection
        const user = await usersCollections.findOne({
          username: username,
          password: password, // plain password
        });

        if (!user) {
          return res.status(401).json({ message: "Invalid credentials" });
        }

        // Return full user including password
        return res.json({ user });
      } catch (error) {
        console.error("Login error:", error);
        res.status(500).json({ message: "Server error" });
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
