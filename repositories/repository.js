const fs = require('fs');
const crypto = require('crypto');

module.exports = class Repository{
    constructor(filename){
        if(!filename)
        {
            throw new Error('Creating a Repository requires a Filename.')
        }
        this.filename = filename;
        try
        {
            fs.accessSync(this.filename);
        }
        catch(err)
        {
            fs.writeFileSync(this.filename, '[]');
        }
    }

    async create(attrs){
        attrs.id = this.randomId();
        const records = await this.getAll();
        records.push(attrs);
        await this.writeAll(records);

        return attrs;
    }

    async getAll(){

        return JSON.parse(
            await fs.promises.readFile(this.filename, {
            encoding: 'utf8'
        }));
    }
    async writeAll(records){
        await fs.promises.writeFile(this.filename, JSON.stringify(records, null, 2));
    }

    randomId(){
        return crypto.randomBytes(4).toString('hex');
    }

    async getOne(id){
        const recordsExisting = await this.getAll();
        return recordsExisting.find(record => record.id === id);
    }

    async delete(id){
        const recordsExisting = await this.getAll();
        const fileteredRecords = recordsExisting.filter(record => record.id !== id);
        await this.writeAll(fileteredRecords);
    }

    async update(id, attrs){
        const recordsExisting = await this.getAll();
        const recordToUpdate = recordsExisting.find(record => record.id === id);

        if(!recordToUpdate){
            throw new Error(`Record with ID ${id} Not Found.`);
        }
        Object.assign(recordToUpdate, attrs);
        await this.writeAll(recordsExisting);
    }

    async getOneBy(filters){
        const allRecords = await this.getAll();
        for(let record of allRecords)
        {
            let found = true;
            for(let key in filters)
            {
                if(record[key] !== filters[key])
                    found = false;
            }
            if(found)
                return record;
        }
    }
};