const fs = require('fs');
const crypto = require('crypto');
const util = require('util');
const Repository = require('./repository');
const scrypt = util.promisify(crypto.scrypt);

class UsersRepository extends Repository{

    async create(attrs){
        attrs.id = this.randomId();

        const salt = crypto.randomBytes(8).toString('hex');
        const buff = await scrypt(attrs.password, salt, 64);

        const recordsExisting = await this.getAll();
        const newRecord = {
            ...attrs,
            password: `${buff.toString('hex')}.${salt}`
        };
        recordsExisting.push(newRecord);
        await this.writeAll(recordsExisting);
        return newRecord;
    }

    async comparePassword(saved, supplied){
        const [hashedSaved, salt] = saved.split('.');
        const buff = await scrypt(supplied, salt, 64);
        const hashedSupplied = buff.toString('hex');
        return hashedSupplied === hashedSaved;
    }  
};

module.exports = new UsersRepository('users.json');
