const bcrypt = require('bcrypt');

async function test() {

  const password = "adminew##2026";

  const hash = await bcrypt.hash(password, 10);

  console.log("HASH NUEVO:");
  console.log(hash);

}

test();