const express = require('express');
const router = express.Router();
const Product = require('../models/product')
const Category = require('../models/category')
const mongoose = require('mongoose');
const multer = require('multer');

const FILE_TYPE_MAP = {
    'image/png': 'png',
    'image/jpeg': 'jpeg',
    'image/jpg': 'jpg'
}

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const isValid = FILE_TYPE_MAP[file.mimetype];
        let uploadError = new Error('invalid image type');

        if (isValid) {
            uploadError = null
        }
        cb(uploadError, 'public/uploads')
    },
    filename: function (req, file, cb) {

        const fileName = file.originalname.split(' ').join('-');
        const extension = FILE_TYPE_MAP[file.mimetype];
        cb(null, `${fileName}-${Date.now()}`)
    }
})

const uploadOptions = multer({ storage: storage })


//---------- getting product -----------//

router.get('/', async (req, res) => {
    let filter = {};
    if (req.query.categories) {
        filter = { category: req.query.categories.split(',') }
    }

    const productList = await Product.find(filter).populate('category');

    if (!productList)
        res.status(500).json({ success: false })

    res.json(productList).status(200)
})

//---------- getting product by ID -----------//
router.get('/:id', async (req, res) => {
    const product = await Product.findById(req.params.id).populate('category')
    if (!product) {
        res.status(500).json({ success: false })
    }
    res.json(product).status(200)
})

//---------- posting product -----------//

router.post('/', uploadOptions.single('image'), async (req, res) => {
    try {
        const { name, description, richDescription, brand, price, category, countInStock, isFeatured } = req.body;

        // Validate category
        const updatedCategory = await Category.findById(category);
        if (!updatedCategory) {
            return res.status(400).send('Invalid category');
        }

        // Validate image
        if (!req.file) {
            return res.status(400).send('No image in the request');
        }
        // Construct image URL
        const basePath = `${req.protocol}://${req.get('host')}/public/uploads/`;
        const imageURL = `${basePath}${req.file.filename}`;

        // Create product
        const product = new Product({
            name,
            description,
            richDescription,
            image: imageURL,
            brand,
            price,
            category,
            countInStock,
            isFeatured,
        });

        const savedProduct = await product.save();

        if (!savedProduct) {
            return res.status(500).send('The product cannot be created');
        }

        return res.status(201).send(savedProduct); // Use 201 for successful creation
    } catch (error) {
        console.error(error);
        return res.status(500).send('An error occurred while processing the request');
    }
});

//--------- updating product ----------//
router.put('/:id', uploadOptions.single('image'), async (req, res) => {
    const product = await Product.findByIdAndUpdate(
        req.params.id,
        {
            name: req.body.name,
            description: req.body.description,
            richDescription: req.body.richDescription,
            image: req.body.image,
            brand: req.body.brand,
            price: req.body.price,
            category: req.body.category,
            countInStock: req.body.countInStock,
            isFeatured: req.body.isFeatured,
        },
        // return the new updated data
        { new: true }
    )
    if (!product) {
        res.json('Product cannot be updated!').status(400)
    }
    res.json(product).status(200)
})

//--------- deleting product ----------//

router.delete('/:id', (req, res) => {
    Product.findByIdAndRemove(req.params.id).then(product => {
        if (product) {
            return res.status(200).json({ success: true, message: 'the product is deleted!' })
        } else {
            return res.status(404).json({
                success: false, message: "product not found!"
            })
        }
    }).catch(err => {
        return res.status(500).json({ success: false, error: err })
    })
})

//--------- getting product count ----------//
router.get(`/get/count`, async (req, res) => {
    try {
        const productCount = await Product.countDocuments();

        if (!productCount) {
            return res.status(500).json({ success: false });
        }

        res.send({ productCount: productCount }).status(200)
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: "An error occurred while fetching product count." });
    }
});

//------- getting featured product count--------//

router.get(`/get/featured/:count`, async (req, res) => {
    try {
        const featuredProduct = await Product.find({ isFeatured: true }).countDocuments()
        console.log(featuredProduct);

        if (!featuredProduct) {
            return res.status(500).json({ success: false });
        }

        res.send({ featuredProduct: featuredProduct }).status(200)
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: "An error occurred while fetching featured product count." });
    }

});

//------- getting featured product --------//

router.get(`/get/featured`, async (req, res) => {
    const products = await Product.find({ isFeatured: true })

    if (!products) {
        res.status(500).json({ success: false })
    }
    res.send(products)
});

//------- getting product by category --------//
router.get('/category/:id', async (req, res) => {
    const { id } = req.params;

    try {
        // Find products that belong to the specified category ID
        const products = await Product.find({ category: id });

        if (!products || products.length === 0) {
            return res.status(404).json({ message: 'No products found for the specified category.' });
        }

        return res.status(200).json(products);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal server error.' });
    }
});




module.exports = router;