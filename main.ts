import "module-alias/register";

// Configure module-alias pour corriger les chemins
import moduleAlias from "module-alias";

if (process.env.NODE_ENV === "production") {
  moduleAlias.addAliases({
    "@models": __dirname + "/src/models",
    "@controllers": __dirname + "/src/controllers",
    "@middlewares": __dirname + "/src/middlewares",
    "@routes": __dirname + "/src/routes",
    "@config": __dirname + "/src/config",
    "@types": __dirname + "/types",
  });
}

import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import connectDB from "@config/db";
import authRoutes from "@routes/authRoutes";
import goalsRoutes from "@routes/goalsRoutes";
import dailySchedule from "@routes/dailyScheduleRoutes";
import userRoutes from "@routes/userRoutes";
import cors from "cors";

dotenv.config();
connectDB();

const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());

app.use(
  cors({
    origin: process.env.HOST_NAME,
    credentials: true,
  })
);
app.options("*", cors());

app.use(authRoutes);
app.use(goalsRoutes);
app.use(dailySchedule);
app.use(userRoutes);
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", process.env.HOST_NAME || "*");
  res.header("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.setHeader(
    "Cache-Control",
    "no-store, no-cache, must-revalidate, proxy-revalidate"
  );
  res.setHeader("Pragma", "no-cache");
  res.setHeader("Expires", "0");

  next();
});
app.get("/", (req, res) => {
  res.send("Welcome to the API!");
});
const PORT = process.env.PORT || 5000;
// app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

export default app;
