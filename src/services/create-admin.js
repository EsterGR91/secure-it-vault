require('dotenv').config();

const hash = require('../security/hash');

async function createAdmin() {

    const password = "adminew##2026";

    const hashedPassword = await hash.hashPassword(password);

    console.log("Password original:", password);
    console.log("Password hash:", hashedPassword);

}

createAdmin();