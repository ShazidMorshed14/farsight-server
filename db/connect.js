const mongoose = require("mongoose");

const connecDB = (MONGOURI) => {
  mongoose.connect(MONGOURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  mongoose.connection.on("connected", () => {
    console.log(`we are connected to mongoDB`);
  });

  mongoose.connection.on("error", () => {
    console.log(`we are not connected to mongoDB`);
  });
};

module.exports = connecDB;
