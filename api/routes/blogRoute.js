const express = require('express');
const router = express.Router();
const { Blog } = require('../models/blog');
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


// get blogs 
router.get('/', async (req, res) => {
    const blogList = await Blog.find().populate('user');
    if (!blogList) {
        res.status(500).json({ success: false });
    }
    res.status(200).json(blogList);
});
//   get blog by id
router.get('/:id', async (req, res) => {
    try {
        const blog = await Blog.findById(req.params.id);
        if (!blog) {
            return res.status(404).json({ success: false, message: 'Blog not found' });
        }
        res.status(200).json(blog);
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'An error occurred while fetching the blog' });
    }
});
//   post blog 
router.post('/:userId', uploadOptions.single('image'), async (req, res) => {
    console.log(req.body);
    console.log(req.file);
    try {
        // Validate image
        if (!req.file) {
            return res.status(400).send('No image in the request');
        }
        // Construct image URL
        const basePath = `${req.protocol}://${req.get('host')}/public/uploads/`;
        const imageURL = `${basePath}${req.file.filename}`;

        const blog = new Blog({
            title: req.body.title,
            image: imageURL,
            content: req.body.content,
            author: req.body.author,
            user: req.params.userId
        });
        const savedBlog = await blog.save();
        return res.status(200).json(savedBlog);
    } catch (error) {
        return res.status(500).json({ error: 'An error occurred while processing the request.' });
    }

})
//   update blog
router.put('/:id', uploadOptions.single('image'), async (req, res) => {
    try {
        // Validate image
        if (!req.file) {
            return res.status(400).send('No image in the request');
        }
        // Construct image URL
        const basePath = `${req.protocol}://${req.get('host')}/public/uploads/`;
        const imageURL = `${basePath}${req.file.filename}`;
        const blog = await Blog.findByIdAndUpdate(req.params.id,
            {
                title: req.body.title,
                image: imageURL,
                content: req.body.content,
                author: req.body.author,
                user: req.body.user
            },
            { new: true }
        );
        if (!blog) {
            return res.status(400).json('Blog cannot be updated!');
        }
        return res.status(200).json(blog);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'An error occurred while updating the blog' });
    }
});
//   delete blog 
router.delete('/:id', async (req, res) => {
    Blog.findByIdAndRemove(req.params.id).then(blog => {
        if (blog) {
            return res.status(200).json({ success: true, message: 'the blog is deleted!' })
        } else {
            return res.status(404).json({
                success: false, message: "blog not found!"
            })
        }
    }).catch(err => {
        return res.status(500).json({ success: false, error: err })
    })
})

module.exports = router;