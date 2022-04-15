const express = require('express')
const app = express()
const cors = require('cors')
const { MongoClient } = require('mongodb');
const ObjectId = require('mongodb').ObjectId;
require('dotenv').config()
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.tczvb.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;

// console.log(uri);

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

// Main function to connect to the server
async function run() {
  try {
    await client.connect();
    const database = client.db('product_portal');
    const productsCollection = database.collection('products');
    const usersCollection = database.collection('users');
    const ordersCollection = database.collection('orders');
    const reviewCollection = database.collection('reviews');

    // Adding Product to Database 
    app.post('/addProduct', async (req, res) => {
      const result = await productsCollection.insertOne(req.body);
      res.send(result);
    })

    // Getting all the Products from Database 
    app.get('/products', async (req, res) => {
      const result = await productsCollection.find({}).toArray();
      res.send(result);
    })

    // Getting single Product from Database 
    app.get('/purchase/:id', async (req, res) => {
      const result = await productsCollection.find({ _id: ObjectId(req.params.id) }).toArray();
      res.send(result[0]);
    })

    //Sending Checkout/Confirm Order data to database
    app.post('/checkout/', async (req, res) => {
      const result = await ordersCollection.insertOne(req.body);
      res.send(result);
    })

    // Getting orders from database
    app.get('/orders/:email', async (req, res) => {
      const result = await ordersCollection.find({ email: req.params.email }).toArray();
      res.send(result);
    })

    // Delete Orders
    app.delete("/deleteOrder/:id", async (req, res) => {
      const result = await ordersCollection.deleteOne({ _id: ObjectId(req.params.id) });
      res.send(result);
    })

    // Delete Products
    app.delete("/deleteProduct/:id", async (req, res) => {
      const result = await productsCollection.deleteOne({ _id: ObjectId(req.params.id) });
      res.send(result);
    })

    // Adding Reviews to Database 
    app.post('/feedback', async (req, res) => {
      const result = await reviewCollection.insertOne(req.body);
      res.send(result);
    })

    // Getting all the reviews from Database 
    app.get('/reviews', async (req, res) => {
      const result = await reviewCollection.find({}).toArray();
      res.send(result);
    })

    // Getting all Orders 
    app.get('/allOrders', async (req, res) => {
      const result = await ordersCollection.find({}).toArray();
      res.send(result);
    })

    // Updating Status
    app.put('/updateStatus/:id',  (req, res) => {
      const id = req.params.id;
      const updatedStatus = req.body.status;
      const filter = {_id: ObjectId(id)}
      ordersCollection.updateOne(filter, {
        $set: {status: updatedStatus},
      })
      .then(result =>{
        res.send(result);
      })
    })


    app.get('/users/:email', async (req, res) => {
      const email = req.params.email;
      const query = { email: email };
      const user = await usersCollection.findOne(query);
      let isAdmin = false;
      if (user?.role === 'admin') {
        isAdmin = true;
      }
      res.json({admin: isAdmin});
    })



    app.put('/users', async (req, res) => {
      const user = req.body;
      const filter = { email: user.email };
      const options = { upsert: true };
      const updateDoc = { $set: user };
      const result = await usersCollection.updateOne(filter, updateDoc, options);
      res.json(result);
    })

    app.put('/users/admin', async (req, res) => {
      const user = req.body;
      console.log('put', user);
      const filter = { email: user.email };
      const updateDoc = { $set: { role: 'admin' } };
      const result = await usersCollection.updateOne(filter, updateDoc);
      res.json(result);
    })
  }
  finally {
    // await client.close();
  }
}
run().catch(console.dir);


// Express js

app.get('/', (req, res) => {
  res.send('Hello Lucky Bike!')
})

app.listen(port, () => {
  console.log(`listening at ${port}`)
})