const express = require('express');
const router = express.Router();
const User = require('../models/user')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken');

//------ getting users -----//
router.get('/', async (req, res) => {
    const userList = await User.find().select('-passwordHash')
    if (!userList)
        res.status(500).json({ success: false })

    res.json(userList).status(200)
})
//----- getting user ------//
router.get('/:id', async (req, res) => {
    const user = await User.findById(req.params.id).select('-passwordHash');

    if (!user) {
        res.status(500).json({ message: 'The user with the given ID was not found.' })
    }
    res.status(200).send(user);
})
//------ posting user -----//
router.post('/', async (req, res) => {
    let user = new User({
        name: req.body.name,
        email: req.body.email,
        passwordHash: bcrypt.hashSync(req.body.password, 10),
        phone: req.body.phone,
        isAdmin: req.body.isAdmin,
        street: req.body.street,
        apartment: req.body.apartment,
        zip: req.body.zip,
        city: req.body.city,
        country: req.body.country,
    })
    user = await user.save();
    if (!user) {
        return res.status(404).send('the user cannot be created')
    }
    res.send(user)
})
//------ login user -----//
router.post('/login', async (req, res) => {
    const user = await User.findOne({ email: req.body.email })
    const secret = process.env.SECERET_KEY

    if (!user) {
        return res.status(400).send('The user not found')
    }
    if (user && bcrypt.compareSync(req.body.password, user.passwordHash)) {
        const token = jwt.sign(
            {
                userId: user._id,
                isAdmin: user.isAdmin
            },
            secret,
            { expiresIn: '1d' }
        )
        const currentUser = user.isAdmin ? 'ADMIN_USER' : 'NORMAL_USER';

        res.status(200).send({
            isAdmin: currentUser,
            token: token,
            userId: user.id,
            user: user.name
        })
    } else {
        res.status(400).send('password is wrong!')
    }
})
//------ register user -----//
router.post('/register', async (req, res) => {
    try {
      const existingUser = await User.findOne({ email: req.body.email });
      if (existingUser) {
        return res.status(400).json({ message: 'Email address is already in use!' });
      console.log('Email address is already in use!');
    }
      let user = new User({
        name: req.body.name,
        email: req.body.email,
        passwordHash: bcrypt.hashSync(req.body.password, 10),
        phone: req.body.phone,
        isAdmin: req.body.isAdmin,
        state: req.body.state,
        street: req.body.street,
        apartment: req.body.apartment,
        zip: req.body.zip,
        city: req.body.city,
        country: req.body.country
      });
  
      user = await user.save();
      if (!user) {
        return res.status(404).send('The user cannot be created');
      }
  
      user.password = undefined;
      res.status(200).json(user);
    } catch (error) {
      console.error(error);
      res.status(500).send('Internal server error');
    }
  });
  //--------- getting user count ----------//
router.get(`/get/count`, async (req, res) => {
    try {
        const userCount = await User.countDocuments();

        if (!userCount) {
            return res.status(500).json({ success: false });
        }

        res.send({ userCount: userCount });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: "An error occurred while fetching user count." });
    }
});
//---------deleting user-------------//
router.delete('/:id', (req, res) => {
    User.findByIdAndRemove(req.params.id).then(user => {
        if (user) {
            return res.status(200).json({ success: true, message: 'the user is deleted!' })
        } else {
            return res.status(404).json({ success: false, message: "user not found!" })
        }
    }).catch(err => {
        return res.status(500).json({ success: false, error: err })
    })
})



module.exports = router;