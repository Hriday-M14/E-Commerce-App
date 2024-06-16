const express = require('express');

const { handleErrors } = require('./middleware');
const usersRepo = require('../../repositories/users');
const signupTemplate = require('../../views/admin/auth/signup');
const signinTemplate = require('../../views/admin/auth/signin');
const {
    requireEmail,
    requirePassword,
    requirePasswordConfirmation,
    requireEmailExists,
    requireValidPasswordForUser
} = require('./validators');

const router = express.Router();
// router here is essentially an object that's going to keep track of all the different route handlers
// that we set up. 

router.get('/signup', (req, res) => {
    if(req.session.userId)
    {
        res.send("You are Already Signed In. First Signout from Application and then continue to Sign Up .... ");
        return;
    }
    res.send(signupTemplate({req}));
});


router.post(
    '/signup',
    [requireEmail, requirePassword, requirePasswordConfirmation], 
    handleErrors(signupTemplate),
    async (req, res) => {

        const {email, password} = req.body;

        const user = await usersRepo.create({email, password});
        req.session.userId = user.id;

        res.redirect('/admin/products');
    }
);

router.get('/signout', (req, res) => {
    req.session = null;
    res.send('You are Logged Out');
});

router.get('/signin', (req, res) => {
    if(req.session.userId)
    {
        res.send("You are Already Signed In. First Signout from Application and then continue to Sign In .... ");
        return;
    }
    res.send(signinTemplate({}));
});

router.post(
    '/signin', 
    [requireEmailExists, requireValidPasswordForUser],
    handleErrors(signinTemplate),
    async (req, res) => {
        
        const {email} = req.body;
        const user = await usersRepo.getOneBy({email});

        req.session.userId = user.id;
        res.redirect('admin/products');
});

module.exports = router;