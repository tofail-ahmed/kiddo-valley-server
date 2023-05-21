const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const express = require('express');
const cors = require('cors');
const app = express();
require('dotenv').config();
const port = process.env.PORT || 5000;


//middleware
app.use(cors());
app.use(express.json());


app.get('/', (req, res) => {
      res.send('kiddo valley is running')
})
app.get('/test', (req, res) => {
      res.send('kiddo valley is  running fast')
})


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.zhsy6ko.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
      serverApi: {
            version: ServerApiVersion.v1,
            strict: true,
            deprecationErrors: true,
      }
});

async function run() {
      try {
            // Connect the client to the server	(optional starting in v4.7)
            // await client.connect();
            const toyCollection = client.db('toyDB').collection('toys')


            const indexKeys = { toy_name: 1, subcategory: 1 }
            const indexOptions = { name: "categoryName" }


            app.get('/search/:text', async (req, res) => {
                  console.log(req.params.text);
                  const seacrhText = req.params.text;
                  const result = await toyCollection.find({
                        $or: [
                              { toy_name: { $regex: seacrhText, $options: 'i' } },
                              { subcategory: { $regex: seacrhText, $options: 'i' } }
                        ]
                  }).toArray()
                  res.send(result)
            })


            app.get('/alltoys', async (req, res) => {
                  const page = parseInt(req.query.page) || 0
                  const limit = parseInt(req.query.limit) || 0
                  const skip = page * limit
                  const result = await toyCollection.find().skip(skip).limit(limit).toArray()
                  res.send(result)
            })


            app.get('/totalToys', async (req, res) => {
                  const result = await toyCollection.estimatedDocumentCount()
                  console.log(result);
                  res.send({ totalToys: result })
            })

            app.get('/alltoys/:id',async(req,res)=>{
                  const id=req.params.id
                 const query={_id:new ObjectId(id)}
                 const result=await toyCollection.findOne(query)
                 res.send(result)

            })


            app.get('/category/:text',async(req,res)=>{
                  console.log(req.params.text);
                  const result=await toyCollection.find({subcategory:req.params.text}).toArray()
                  res.send(result)
            })


            app.get('/mytoys/:email',async(req,res)=>{
                  console.log(req.params.email);
                  const result=await toyCollection.find({seller_email:req.params.email}).toArray()
                  res.send(result)
            })


            

            app.post('/addtoy',async(req,res)=>{
                  const addToy=req.body
                  console.log(addToy);
                  const result=await toyCollection.insertOne(addToy)
                  res.send(result)
            })



            app.put('/alltoys/:id', async (req, res) => {

                  const id = req.params.id;
                  const body = req.body;
                  const filter = { _id: new ObjectId(id) }
                  const updateDoc = {
                        $set: {
                              toy_name: body.toy_name,
                              description: body.description,
                              rating: body.rating,
                              subcategory: body.subcategory,
                              toy_pic: body.toy_pic,
                              available_quantity: body.available_quantity,
                              price: body.price
                        }
                  }
                  const result=await toyCollection.updateOne(filter,updateDoc)
                  res.send(result)
            })





            app.delete('/alltoys/:id', async (req, res) => {
                  const id = req.params.id
                  const query = { _id: new ObjectId(id) }
                  const result = await toyCollection.deleteOne(query)
                  res.send(result)
            })

            // Send a ping to confirm a successful connection
            await client.db("admin").command({ ping: 1 });
            console.log("Pinged your deployment. You successfully connected to MongoDB!");
      } finally {
            // Ensures that the client will close when you finish/error
            // await client.close();
      }
}
run().catch(console.dir);




app.listen(port, () => {
      console.log(`kiddo valley is running on port ${port}`);
})
