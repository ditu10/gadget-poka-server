const express = require('express')
const app = express()
const PORT = process.env.PORT || 5000;
const cors = require('cors');
const ObjectId = require('mongodb').ObjectId;
app.use(cors());
require('dotenv').config()
app.use(express.json())



const { MongoClient } = require('mongodb');

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.dyya6.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

app.get('/', (req, res) => {
    console.log('server connected')
    res.send('gadget poka server')
})
async function run() {
    try {
        await client.connect()
        const database = client.db("gadgetPoka");
        const phonesCollection = database.collection("iPhones");
        const orderCollection = database.collection("orders")
        const usersCollection = database.collection("users")
        const reviewCollection = database.collection("reviews")

        // find all the phones from db
        app.get('/phones', async (req, res) => {
            const phones = await phonesCollection.find({}).toArray();
            res.send(phones)

        })

        // find a specific phone from db
        app.get('/phone/:id', async (req, res) => {
            const id = req.params.id;
            // console.log(ObjectId(id));
            const query = { _id: ObjectId(id) };
            const product = await phonesCollection.findOne(query);
            console.log(product)
            res.send(product)
        })
        app.post('/order', async (req, res) => {
            const order = req.body;
            console.log(order);
            const newOrder = { ...order, status: 'Pending' }
            const result = await orderCollection.insertOne(newOrder);
            console.log(result)
            res.send(result)
        })

        app.post('/users', async (req, res) => {
            const newUser = req.body;
            console.log(newUser)
            const result = usersCollection.insertOne(newUser);
            // console.log(result)

            res.send(result);
        })
        // get orders by an email
        app.get('/myorder', async (req, res) => {
            const email = req.query.email;
            // console.log(email);
            const query = { email: email };
            const orders = await orderCollection.find(query).toArray()
            // console.log(orders)
            res.send(orders);
        })
        //get all orders
        app.get('/orders', async (req, res) => {
            const allOrders = await orderCollection.find({}).toArray()
            // console.log(allOrders)
            res.send(allOrders);
        })
        //delete an order
        app.delete('/deleteorder', async (req, res) => {
            const id = req.query.id;
            const query = { _id: ObjectId(id) };
            const result = await orderCollection.deleteOne(query)
            console.log(result)
            res.send(result)
        })
        // update status of an order
        app.put('/updateorder', async (req, res) => {
            const id = req.query.id;
            const filter = { _id: ObjectId(id) };
            const updateDoc = {
                $set: {
                  status: 'Approved'
                },
              };
            const result = await orderCollection.updateOne(filter,updateDoc)
            console.log(result)
            res.send(result)
        })
        // find an user
        app.get('/users/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email: email };
            const user = await usersCollection.findOne(query);
            let admin = false;
            if (user?.role == "admin") {
                admin = true;
            }
            
            res.send({admin:admin});
        })

        //make an email admin
        app.put('/makeadmin/:email', async (req, res) => {
            const email = req.params.email;
            const filter = { email: email };
            
            const updateDoc = {
                $set: {
                  role:'admin'
                },
            };
            const result = await usersCollection.updateOne(filter, updateDoc);
            console.log(result)
            res.send(result);
        })
        app.post('/review', async (req, res) => {
            const review = req.body;
            const result = await reviewCollection.insertOne(review);
            res.send(result);
        })
        app.get('/review', async (req, res) => {
            const reviews = await reviewCollection.find({}).toArray();
            res.send(reviews);
        })
        
        app.delete('/phone/:id', async (req, res) => {
            const id = req.params.id;
            // console.log(id);
            const query = { _id: ObjectId(id) }
            // console.log(query)
            const result = await phonesCollection.deleteOne(query);
            res.send(result);
        })

        //add a new product
        app.post('/addProduct', async (req, res) => {
            const phone = req.body;
            // console.log(phone);
            const result = await phonesCollection.insertOne(phone);
            console.log(result)


            res.send(result)
        })


        //done everything



    }
    finally {
        // client.close()
    }
}
run().catch(console.dir)


app.listen(PORT, () => {
    console.log('server is listening at port', PORT);
})