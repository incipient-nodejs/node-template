import express from "express";
import cors from "cors";
import "dotenv/config";
import { notFoundHandler, errorHandler } from "./middleware/errorHandler.middleware";
import router from "./services/routes";
import { DbInstance } from "./config/db.config";
import { TTokenUser } from "./services/user/user.interface";
import path from "path";

const app = express();
const port = process.env.PORT;

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(express.static(path.join(__dirname, "./public")));

//For checking the server health :
app.get("/health", (req, res) => {
  res.send(`I am alive :)`);
});

app.use("/api/v1", router);
app.use(notFoundHandler);
app.use(errorHandler);

DbInstance.then(() => {
  console.log("Database Connected 🦊");
  app.listen(port, () => {
    console.log(`🚀 Server is running on port 🚀: ${port}`);
  });
}).catch((err: any) => {
  console.log(`Can't Connect Server!`, err);
  process.exit(1);
});

declare global {
  namespace Express {
    interface Request {
      user: TTokenUser;
    }
  }
}

