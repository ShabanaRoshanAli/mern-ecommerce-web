const express = require('express');
const router = express.Router();
const Category = require('../models/category')


//------ getting category -----//
router.get('/', async (req, res) => {
    const categoryList = await Category.find()
    if(!categoryList){
        res.status(500).json({success:false,message: 'The category was not found'})
    }
    res.status(200).send(categoryList)
})

//------ getting category by id -----//
router.get('/:id', async (req, res) => {
    const category = await Category.findById(req.params.id)
    if(!category){
        res.status(500).json({success:false,message: 'The category with the given ID was not found'})
    }
    res.json(category).status(200)
})

//------ posting category -----//
router.post('/', async (req, res) =>{
    let category = new Category({
        name: req.body.name ,
        icon: req.body.icon ,
        color: req.body.color
    })
    category = await category.save();
    if(!category){
        return res.status(404).send('the category cannot be created')
    }
    res.send(category)
})

//------ updating category -----//
router.put('/:id', async (req, res) =>{
    const category = await Category.findByIdAndUpdate(
        req.params.id,
        {
            name: req.body.name,
            icon: req.body.icon,
            color: req.body.color,
        },
        // return the new updated data
        {new: true}
    )
    if(!category){
        return res.status(404).send('the category cannot be created')
    }
    res.send(category)
})


//------ deleting category -----//
router.delete('/:id', (req, res) =>{
    Category.findByIdAndDelete(req.params.id)
    .then(category=>{
        if(category){
            return res.status(200).json({success: true, message: 'the category is deleted'})
        }else{
            return res.status(404).json({success: false ,message: 'category not found'})
        }
    }).catch(err => {
        return res.status(400).json({success:false, error: err})
    })
})

module.exports = router;