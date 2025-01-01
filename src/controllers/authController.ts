import { ObjectId } from "mongoose";
import { Request, Response } from "express";
import User from "@models/user.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const generateToken = (id: ObjectId) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || "", { expiresIn: "1d" });
};

// Helper function to validate email, password, and username
const isValidEmail = (email: string) => /\S+@\S+\.\S+/.test(email);

const isValidPassword = (password: string) =>
  password.length >= 6 && /[A-Za-z0-9]/.test(password);


  const isValidUsername = (name: string) => /^.{3,30}$/.test(name);
export const getUserInfo = async (req: Request, res: Response) => {
  const token = req.cookies.token || req.headers.authorization?.split(" ")[1];

  if (!token) {
    res.status(401).json({ message: "Unauthorized. Token is missing." });
    return;
  }

  try {
    // Décoder le token
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || ""
    ) as jwt.JwtPayload;

    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      res.status(404).json({ message: "User not found." });
      return;
    }

    res.status(200).json({
      message: "User information retrieved successfully.",
      user,
    });
  } catch (error) {
    console.error("Error fetching user information:", error);
    res.status(500).json({
      message: "An error occurred while fetching user information.",
      error,
    });
  }
};
export const register = async (req: Request, res: Response) => {
  const { email, password, name } = req.body;

  if (!email || !password || !name) {
    res.status(400).json({ message: "All fields are required." });
    return;
  }

  if (!isValidEmail(email)) {
    res.status(400).json({ message: "Invalid email format." });
    return;
  }

  if (!isValidPassword(password)) {
    res.status(400).json({
      message:
        "Password must be at least 6 characters long and include at least one alphanumeric character.",
    });
    return;
  }

  if (!isValidUsername(name)) {
    res.status(400).json({
      message:
        "Username must be between 3 and 30 characters long.",
    });
    return;
  }

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      res.status(400).json({ message: "Email is already in use." });
      return;
    }

    const user = await User.create({ email, password, name });
    const token = generateToken(user._id as unknown as ObjectId);

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "none",
      maxAge: 24 * 60 * 60 * 1000*60, // 2 mois
    });
    res
      .status(201)
      .json({ message: "User registered successfully.", token, user });
  } catch (error) {
    console.error("Error during registration:", error);
    res.status(500).json({
      message: "An error occurred while registering the user.",
      error,
    });
  }
};

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400).json({ message: "All fields are required." });
    return;
  }

  if (!isValidEmail(email)) {
    res.status(400).json({ message: "Invalid email format." });
    return;
  }

  try {
    const user = await User.findOne({ email });
    if (!user) {
      res.status(401).json({
        message: "Incorrect email or password.",
      });
      return;
    }

    // Compare the hashed password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      res.status(401).json({
        message: "Incorrect email or password.",
      });
      return;
    }

    // Generate the token
    const token = generateToken(user._id as unknown as ObjectId);

    // Remove the password before returning the user
    const { password: _, ...userWithoutPassword } = user.toObject();

    // Add the cookie with the token
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "none",
      maxAge: 24 * 60 * 60 * 1000, // 1 day
    });

    res.json({
      message: "User logged in successfully.",
      token,
      user: userWithoutPassword,
    });
  } catch (error) {
    console.error("Error during login:", error);
    res.status(500).json({
      message: "An error occurred while logging in the user.",
      error,
    });
  }
};

// Logout function
export const logout = (req: Request, res: Response) => {
  res.clearCookie("token");
  res.json({ message: "User logged out successfully." });
};
