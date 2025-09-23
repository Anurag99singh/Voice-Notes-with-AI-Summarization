const app = require("./app");
const mongoose = require("mongoose");
const PORT = process.env.PORT || 5000;
const DB = process.env.MONGO_URI.replace(
  "<db_password>",
  process.env.MONGODB_PASSWORD
);
mongoose
  .connect(DB, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log(`Db is connected `));
app.listen(PORT, () => {
  console.log(`App is listening at the port ${PORT}`);
});
