import { app } from "./app.js";
import dotenv from "dotenv";
import ConnectDB from "./db/index.js";

dotenv.config({ path: "./src/.env" });

const port = process.env.PORT || 3000;
console.log(process.env.PORT);

ConnectDB()
  .then(() => {
    app.listen(port, () => {
      console.log(`server is listening at  ${port} `);
    });
  })
  .catch((err) => {
    console.log("ERROR in server" + err);
  });
