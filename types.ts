import { Request } from "express";

export interface CustomRequest extends Request {
  user?: UserInterface;
}

export interface UserType {
  _id: string;
  name: string;
  email: string;
  currentPassword: string;
  newPassword: string;
  confirmPassword: string
  password: string
}

export interface UserInterface {
  _id: string;
  id: string;
  name: string;
  email: string;
  password: string;
}
