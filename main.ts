import "module-alias/register";
import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import connectDB from "./src/config/db";
import authRoutes from "./src/routes/authRoutes";
import goalsRoutes from "./src/routes/goalsRoutes";
import dailySchedule from "./src/routes/dailyScheduleRoutes";
import userRoutes from "./src/routes/userRoutes";
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

app.use(authRoutes);
app.use(goalsRoutes);
app.use(dailySchedule);
app.use(userRoutes);
app.get("/", (req, res) => {
  res.send("Welcome to the API!");
});
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

export default app;
