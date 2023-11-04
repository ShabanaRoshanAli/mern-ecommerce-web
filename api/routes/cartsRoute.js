const express = require('express');
const router = express.Router();
const { Cart } = require('../models/cart');
const { CartItem } = require('../models/cartItem')

router.get('/', async (req, res) => {
    const cart = await Cart.find()
        .populate('user', 'name')
        .populate({
            path: 'product',
            populate: 'category'
        }
        ).sort({ 'dateAddedCart': -1 })

    if (!cart) {
        res.status(500).json({ success: false })
    }
    res.send(cart).status(200)
})

// })
// /----------- getting cart by Id  ---------------/
router.get('/:id', async (req, res) => {
    const cart = await Cart.find({ user: req.params.id })
        .populate('user', 'name')
        .populate({
            path: 'product',
            populate: 'category'
        }
        ).sort({ 'dateAddedCart': -1 })

    if (!cart) {
        res.status(500).json({ success: false })
    }
    res.send(cart).status(200)
})
// /----------- posting cart ---------------/
router.post('/:userId', async (req, res) => {
    try {
        const cartItem = new Cart({
            product: req.body.product,
            price: req.body.price,
            quantity: req.body.quantity,
            user: req.body.user
        });
        const savedCartItem = await cartItem.save();
        return res.status(200).json(savedCartItem);
    } catch (error) {
        console.error(error); // Log the error for debugging
        return res.status(500).json({ error: 'An error occurred while processing the request.' });
    }
});

//------ updating cart -----//

router.put('/:id', async (req, res) => {
    const cart = await Cart.findByIdAndUpdate(
        req.params.id,
        {
            price: req.body.price,
            quantity: req.body.quantity
        },
        // return the new updated data
        { new: true }
        )
        console.log(cart);
        if (!cart) {
            return res.status(404).send('the cart cannot be created')
    }
    res.send(cart).status(200)
})

//-------- deleting order ----------//
router.delete('/:id', async (req, res) => {
    try {
        const cart = await Cart.findByIdAndRemove(req.params.id);

        if (!cart) {
            return res.status(404).json({ message: 'Cart not found!' });
        }

        return res.status(200).json({ message: 'Cart is deleted!' });
    } catch (error) {
        return res.status(500).json({ success: false, error });
    }
})

//------- getting specific cart list -------//
router.get(`/get/usercarts/:userid`, async (req, res) => {
    try {
        const userCartList = await Cart.findOne({ user: req.params.userid });
        if (userCartList) {
            res.status(200).json({ success: true, data: userCartList });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Internal server error" });
    };
})

module.exports = router;