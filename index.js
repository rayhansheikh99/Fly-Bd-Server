const express = require('express')
const cors = require("cors");
require('dotenv').config()
const { MongoClient } = require('mongodb');
const ObjectId = require('mongodb').ObjectId;

const app = express();
const port = process.env.PORT || 5000

app.use(cors());
app.use(express.json());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ouksj.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function run() {
    try {
        await client.connect();
        const database = client.db('fly_bd');
        const packagesCollection = database.collection('packages');
        const orderCollection = database.collection('orders');
        const userCollection = database.collection('users');
        const reviewCollection = database.collection('reviews');
       
        //GET Products API
        app.get('/packages', async (req, res) => {
            const cursor = packagesCollection.find({});
            const packages = await cursor.toArray();
            res.send(packages);
        });

        app.get('/orders', async (req, res) => {
            const email = req.query.email
            const query = { email: email }
            const cursor = orderCollection.find(query);
            const orders = await cursor.toArray();
            res.send(orders);
            console.log(orders)
        })

        app.get('/reviews', async (req, res) => {
            const cursor = reviewCollection.find({});
            const reviews = await cursor.toArray();
            res.send(reviews);
          
        })

        app.get('/users/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email: email };
            const user = await userCollection.findOne(query);
            let isAdmin = false;
            if (user?.role === 'admin') {
                isAdmin = true;
            }
            res.json({ admin: isAdmin });
        })

        //POST API

        app.post('/reviews', async (req, res) => {
            const review = req.body;
            const result = await reviewCollection.insertOne(review);
            res.json(result);
            console.log(result)
        })

        app.post('/packages', async (req, res) => {
            const package = req.body;
            const result = await packagesCollection.insertOne(package);
            res.json(result);
            console.log(result)
        })

        app.post('/orders', async (req, res) => {
            const order = req.body;
            const result = await orderCollection.insertOne(order);
            res.json(result);
            console.log(result)
        })

        app.post('/users', async (req, res) => {
            const user = req.body;
            const result = await userCollection.insertOne(user);
            res.json(result);
            console.log(result)
        })
        
        //PUT API

        app.put('/users', async (req, res) => {
            const user = req.body;
            const filter = { email: user.email };
            const options = { upsert: true };
            const updateDoc = { $set: user };
            const result = await userCollection.updateOne(filter, updateDoc, options);
            res.json(result);
        });
  
        app.put('/users/admin', async (req, res) => {
          const user = req.body
          console.log('put',user)
          const filter = {email: user.email}
          const updateDoc = {$set: {role: 'admin'}}
          const result = await userCollection.updateOne(filter,updateDoc)
          res.json(result)
        })

           // DELETE API
           app.delete('/orders/:id', async (req,res) => {
            const id = req.params.id;
            const query = {_id: ObjectId(id)};
            const result = await orderCollection.deleteOne(query);
            console.log('deleting user with id', result);
            res.json(result);
        })
        app.delete('/packages/:id', async (req,res) => {
            const id = req.params.id;
            console.log(id)
            const query = {_id: ObjectId(id)};
            const result = await packagesCollection.deleteOne(query);
            console.log('deleting product with id', result);
            res.json(result);
        })

    }

        finally {
            // await client.close();
        }
    }
    run().catch(console.dir);

app.get('/', (req, res) => {
  res.send('Get Ready to Start')
})

app.listen(port, () => {
  console.log(`Server is running`,port)
})