https://www.wix.com/website-template/view/html/1622?originUrl=https%3A%2F%2Fwww.wix.com%2Fwebsite%2Ftemplates%2Fhtml%2Fonline-store%3Fsort%3Dtop&tpClick=view_button&esi=aff10902-e311-4954-9ed0-d035168e0b97#


morgan = HTTP request logger middleware for node.js from frontend

api
http://localhost:4000/eshop/api/users
http://localhost:4000/eshop/api/users/login
http://localhost:4000/eshop/api/users/register
http://localhost:4000/eshop/api/products
http://localhost:4000/eshop/api/products/get/count
http://localhost:4000/eshop/api/products/get/featured/:count
http://localhost:4000/eshop/api/products?categories=64a6efc4db64dfa1f3f2ecbc
http://localhost:4000/eshop/api/orders
http://localhost:4000/eshop/api/orders/get/totalsales
http://localhost:4000/eshop/api/orders/get/count
http://localhost:4000/eshop/api/orders/get/userorders/:userid
http://localhost:4000/eshop/api/carts

1-----
how to get table conected in mongoDB
a. create a field in orginal table(product):
category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: true
  }

b. then connect them

product.find().populate('category')
tht will connect both tables

2---------- finding specificy field in given ObjectId
 const products = await Product.find({ isFeatured: true }).limit(count);
  
3------- filtering by category
we use query parameters in this case that is always placed after a question mark (?)
 let filter = {};
    if(req.query.categories)
    {
         filter = {category: req.query.categories.split(',')}
    }

    const productList = await Product.find(filter).populate('category');


4-------if you want to send specific data and exclude the id
    const productList = await Product.find().select('name image -_id'). 

5------- to count total sales:

  const totalSales= await Order.aggregate([
        { $group: { _id: null , totalsales : { $sum : '$totalPrice'}}}
    ])
/*---------ORDER---------*/
1. orders & order-Item Model & Scheme:
2. Array of Refs - Examole of Link Order to Order Items to Products:
3. New Order & Create Order Items on Posting New Order:
4. Get Order Detail and Populate Products in Order Items and Uder Data:
5. Update Order Status & Delete it:
6. Calculating Total Price of one Order:
7. Get Total E-Shop Sales using $sum:


/*---------Image File Uploading---------*/
1. Configure Server Side Upload:
2. Validating Uploaded File Type:
 