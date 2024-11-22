import 'module-alias/register';
import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import connectDB from "@config/db.js";
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