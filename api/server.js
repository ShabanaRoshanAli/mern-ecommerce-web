const express = require("express");
const app = express();
const dotenv = require('dotenv');
const cors = require('cors');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const database = require('./config/database');
const productRoute = require('./routes/productsRoute');
const categoryRoutes = require('./routes/categoriesRoute');
const ordersRoute = require('./routes/ordersRoute');
const cartsRoute = require('./routes/cartsRoute');
const usersRoute = require('./routes/usersRoute');
const blogsRoute = require('./routes/blogRoute');

dotenv.config()
database()
app.use(cors())
app.use(express.json())
app.options('*', cors())

app.use(bodyParser.json())
app.use(morgan('tiny'))
app.use('/public/uploads', express.static(__dirname + '/public/uploads'));

app.get('/', (req,res) =>{
    res.send('hello API !')
})
const api = process.env.API_URL
app.use(`${api}/products`,productRoute)
app.use(`${api}/categories`,categoryRoutes)
app.use(`${api}/orders`,ordersRoute)
app.use(`${api}/carts`,cartsRoute)
app.use(`${api}/users`,usersRoute)
app.use(`${api}/blogs`,blogsRoute)

app.listen(4000, () => {
    console.log(`server is running ${api}`)
    console.log('server',
     process.env.API_URL)
})