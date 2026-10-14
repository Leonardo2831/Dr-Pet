const bcrypt = require('bcryptjs');

module.exports = class Criptografia {
    static checkHash(password, hashUser) {
        return bcrypt.compareSync(password, hashUser);
    }

    static generateHash(password) {
        const salt = bcrypt.genSaltSync(10);
        const passwordHash = bcrypt.hashSync(password, salt);
        return passwordHash;
    }
}