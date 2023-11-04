const express = require('express');
const router = express.Router();
const { Order } = require('../models/order')
const { OrderItem } = require('../models/orderItem')


//------- getting order list -------//

router.get(`/`, async (req, res) => {
    const orderList = await Order.find().populate("user", "name")
        .populate('orderItems')
        .sort({ 'dateOrdered': -1 })
    if (!orderList) {
        res.status(500).json({ success: false })
    }
    res.send(orderList);
})
//------- getting order -------//

router.get(`/:id`, async (req, res) => {
    const order = await Order.findById(req.params.id)
        .populate('user', 'name')
        .populate({
            path: 'orderItems', populate: {
                path: 'product',
                populate: 'category'
            }
        }).sort({ 'dateOrdered': -1 })
    if (!order) {
        res.status(500).json({ success: false })
    }
    res.send(order);
})
//------- getting specific order list -------//
router.get(`/get/userorders/:userid`, async (req, res) => {
    const userOrderList = await Order.find({ user: req.params.userid }).populate({
        path: 'orderItems', populate: {
            path: 'product', populate: 'category'
        }
    }).sort({ 'dateOrdered': -1 });
    if (!userOrderList) {
        res.status(500).json({ success: false })
    }
    res.send(userOrderList).status(200);
})

//------- posting order -------//

router.post('/', async (req, res) => {
    console.log('order', req.body)
    const orderItemsIds = Promise.all(req.body.orderItems.map(async (orderItem) => {
        let newOrderItem = new OrderItem({
            quantity: orderItem.quantity,
            product: orderItem.product
        });

        newOrderItem = await newOrderItem.save();

        return newOrderItem._id;
    }));

    const orderItemsIdsResolved = await orderItemsIds;

    const totalPrices = await Promise.all(orderItemsIdsResolved.map(async (orderItemId) => {
        const orderItem = await OrderItem.findById(orderItemId).populate('product', 'price');
        if (!orderItem || !orderItem.product || orderItem.product.price === undefined) {
            return 0;
        }

        const totalPrice = orderItem.product.price * orderItem.quantity;
        return totalPrice;
    }));

    const totalPrice = totalPrices.reduce((a, b) => a + b, 0);

    let order = new Order({
        orderItems: orderItemsIdsResolved,
        shippingAddress1: req.body.shippingAddress1,
        shippingAddress2: req.body.shippingAddress2,
        city: req.body.city,
        zip: req.body.zip,
        country: req.body.country,
        phone: req.body.phone,
        status: req.body.status,
        totalPrice: totalPrice,
        user: req.body.user,
    });

    order = await order.save();

    if (!order)
        return res.status(400).send('the order cannot be created!')

    res.send(order).status(200);
});


//------ updating order -----//

router.put('/:id', async (req, res) => {
    const order = await Order.findByIdAndUpdate(
        req.params.id,
        {
            status: req.body.status
        },
        // return the new updated data
        { new: true }
    )
    if (!order) {
        return res.status(404).send('the order cannot be created')
    }
    res.send(order).status(200)
})

//-------- deleting order ----------//

router.delete('/:id', async (req, res) => {
    console.log(req.params.id);
    try {
        const order = await Order.findByIdAndRemove(req.params.id)
        if(!order){
            res.json('Order cannot be deleted').status(400)
        }
        return res.json('Order deleted successfully!').status(200)
    } catch (error) {
        res.json('Internal Error').status(500)
    }
    
});

router.get('/get/totalsales', async (req, res) => {
    const totalSales = await Order.aggregate([
        { $group: { _id: null, totalsales: { $sum: '$totalPrice' } } }
    ])

    if (!totalSales) {
        return res.status(400).send('The order sales cannot be generated')
    }

    res.send({ totalsales: totalSales.pop().totalsales }).status(200)
})
router.get(`/get/count`, async (req, res) => {
    try {
        const orderCount = await Order.countDocuments();
        console.log(orderCount);
        if (!orderCount) {
            return res.status(500).json({ success: false });
        }
        res.send({ orderCount: orderCount }).status(200)
    } catch (error) {
        res.status(500).json({
            success: false,
            error: "An error occurred while fetching order count."
        });
    }
});
module.exports = router;