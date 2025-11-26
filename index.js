const express = require('express');
const cors = require('cors');
require('dotenv').config()
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
// ========= Initialize Express app ========= //
const app = express();
const port = process.env.PORT || 5000;


app.use(cors());
app.use(express.json());

// ========== MONGODB CONNECTION ========== //
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_KEY}@clustersm.e6uuj86.mongodb.net/?appName=ClusterSM`;

// ========== Create MongoDB client instance ========= //
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

// ========= Connection set function ========== //
async function run() {
    try {
        // await client.connect();

        // ========== MAIN FUNCTION ========== //

        const db = client.db("gadget_zone_db");
        const productsCollection = db.collection("products");

        // ========== Products Related API ======== //
        // Get All Data From Database

        // app.get("/products", async(req, res) => {
        //     const query = {}

        //     const cursor = productsCollection.find(query);
        //     const result = await cursor.toArray();
        //     res.send(result);
        // })

        // Get API
        app.get("/products", async (req, res) => {
            const query = {}
            const { email } = req.query;
            // products?email=""&
            if (email) {
                query.userEmail = email;
            }
            const options = { sort: { createdAt: -1 } }

            const cursor = productsCollection.find(query, options);
            const result = await cursor.toArray();
            res.send(result);
        })

        // GET: Get a specific ID
        app.get("/products/:id", async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await productsCollection.findOne(query);
            res.send(result);
        });

        // // GET: Get latest 6 Bills (sorted by date)
        // app.get("/latest-products", async (req, res) => {
        //     const cursor = productsCollection.find().sort({ date: -1 }).limit(6);
        //     const result = await cursor.toArray();
        //     res.send(result);
        // });

        // GET: Get latest 6 Bills (sorted by date)
        app.get("/latest-products", async (req, res) => {
            const products = await productsCollection.find().toArray();

            // Convert 'dd/mm/yyyy' to Date and sort
            products.sort((a, b) => {
                const [dayA, monthA, yearA] = a.createdAt.split("/").map(Number);
                const [dayB, monthB, yearB] = b.createdAt.split("/").map(Number);
                const dateA = new Date(yearA, monthA - 1, dayA);
                const dateB = new Date(yearB, monthB - 1, dayB);
                return dateB - dateA; // descending
            });

            res.send(products.slice(0, 6));
        });



        // Create or Post one Data to the Database
        app.post("/products", async (req, res) => {
            const product = req.body;
            // Product Created Time
            const dhakaDate = new Date().toLocaleDateString("en-GB", {
                timeZone: "Asia/Dhaka"
            });
            product.createdAt = dhakaDate;


            const result = await productsCollection.insertOne(product);
            res.send(result);
        })

        // Delete a specific paid bill 
        app.delete("/products/:id", async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await productsCollection.deleteOne(query);
            res.send(result);
        });


        // await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {

        // await client.close();
    }
}
run().catch(console.dir);

// ========== Root route for testing server ========== //
app.get("/", (req, res) => {
    res.send("GadGet Zone Server is going on");
})


// ========== SERVER LISTEN ========== //
app.listen(port, () => {
    console.log(`GadGet Zone Server at port: ${port}`)
});
