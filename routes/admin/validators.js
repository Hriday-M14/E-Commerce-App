const { check } = require('express-validator');
const usersRepo = require('../../repositories/users');

module.exports = {
    requireTitle: check('title')
        .trim()
        .isLength({ min: 5, max: 40 })
        .withMessage('Must be between 5 and 40 Characters'),
    requirePrice: check('price')
        .trim()
        .toFloat()
        .isFloat({ min: 1 })
        .withMessage('Must be a Number greater than 1'),
    requireEmail: check('email')
        .trim()
        .normalizeEmail()
        .isEmail()
        .withMessage('Must Be a Valid Email')
        .custom(async email => {
            const userExisting = await usersRepo.getOneBy({email});
            if(userExisting){
               throw new Error('Email Already In Use');
            }
        }),
    requirePassword: check('password')
        .trim()
        .isLength({ min: 4, max: 20 })
        .withMessage('Must be between 4 and 20 Characters'),
    requirePasswordConfirmation: check('passwordConfirm')
        .trim()
        .isLength({ min: 4, max: 20 })
        .withMessage('Must be between 4 and 20 Characters')
        .custom((confirmPassword, { req }) => {
            if(confirmPassword !== req.body.password){
                throw new Error('Password and Password Confirmation Input Fields Should Match.');
            }
            else{
                return true;
            }
        }),
    requireEmailExists: check('email')
        .trim()
        .normalizeEmail()
        .isEmail()
        .withMessage('Must Provide a Valid Email')
        .custom(async email => {
            const userExisting = await usersRepo.getOneBy({email});
            if(!userExisting){
               throw new Error('Email Not Found!');
            }
        }),
    requireValidPasswordForUser: check('password')
        .trim()
        .custom(async (password, { req }) => {
            const user = await usersRepo.getOneBy({ email: req.body.email });
            if (!user) {
              throw new Error('Invalid password');
            }

            const validPassword = await usersRepo.comparePassword(
                user.password,
                password
            );
            if(!validPassword){
                throw new Error('Invalid Password');
            }
        })
};