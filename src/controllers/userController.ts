import { Response } from "express";
import bcrypt from "bcryptjs";
import User from "@models/user";
import { CustomRequest, UserType } from "@types";
import crypto from "crypto";
import transporter from "@config/mailerConfig";

const isValidEmail = (email: string) => /\S+@\S+\.\S+/.test(email);

const isValidPassword = (password: string) =>
  password.length >= 8 &&
  /[A-Z]/.test(password) &&
  /[a-z]/.test(password) &&
  /[0-9]/.test(password) &&
  /[!@#$%^&*(),.?":{}|<>]/.test(password);

const isValidUsername = (name: string) => /^.{3,30}$/.test(name);

export const updateUserProfile = async (
  req: CustomRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.id;

    // Vérifiez si les données sont présentes dans le corps de la requête
    if (!req.body || typeof req.body !== "object") {
      res.status(400).json({ message: "Invalid data provided." });
      return;
    }

    const { name, email, currentPassword, newPassword, confirmPassword } =
      req.body;

    if (!name && !email && !currentPassword && !newPassword) {
      res.status(400).json({
        message: "You must provide at least one field to update.",
      });
      return;
    }

    // Trouver l'utilisateur dans la base de données
    const user = await User.findById(userId);
    if (!user) {
      res.status(404).json({ message: "User not found." });
      return;
    }

    const updatedData: Partial<UserType> = {};

    // Validation et mise à jour du nom d'utilisateur
    if (name) {
      if (!isValidUsername(name)) {
        res.status(400).json({
          message: "Username must be between 3 and 30 characters.",
        });
        return;
      }
      updatedData.name = name;
    }

    // Validation et mise à jour de l'email
    if (email) {
      if (!isValidEmail(email)) {
        res.status(400).json({ message: "Invalid email format." });
        return;
      }

      // Vérifier si le mot de passe actuel est fourni
      if (!currentPassword) {
        res.status(400).json({
          message: "Current password is required to update the email.",
        });
        return;
      }

      // Vérifier le mot de passe actuel
      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) {
        res.status(400).json({ message: "Current password is incorrect." });
        return;
      }

      // Vérifier si l'email est déjà utilisé par un autre utilisateur
      const existingUser = await User.findOne({ email });
      if (existingUser && existingUser._id.toString() !== userId) {
        res.status(400).json({ message: "Email already in use." });
        return;
      }
      updatedData.email = email;
    }

    // Validation et mise à jour du mot de passe
    if (currentPassword && (newPassword || confirmPassword)) {
      if (!newPassword || !confirmPassword) {
        res.status(400).json({
          message:
            "New password and confirmation password are required for password update.",
        });
        return;
      }

      // Vérifier si les nouveaux mots de passe correspondent
      if (newPassword !== confirmPassword) {
        res.status(400).json({
          message: "New password and confirmation password do not match.",
        });
        return;
      }

      // Valider le nouveau mot de passe
      if (!isValidPassword(newPassword)) {
        res.status(400).json({
          message:
            "New password must be at least 8 characters long, with one uppercase letter, one lowercase letter, one number, and one special character.",
        });
        return;
      }

      // Hash du nouveau mot de passe
      updatedData.password = await bcrypt.hash(newPassword, 10);
    }

    // Mise à jour dans la base de données
    const updatedUser = await User.findByIdAndUpdate(userId, updatedData, {
      new: true, // Renvoie le document mis à jour
      runValidators: true, // Valide les champs modifiés
    });

    if (updatedUser) {
      res.status(200).json(updatedUser);
    } else {
      res.status(404).json({ message: "User not found" });
    }
  } catch (error) {
    console.error("Error updating user profile:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Supprimer le compte de l'utilisateur
export const deleteUserAccount = async (
  req: CustomRequest,

  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.id; // Get user ID from the request

    // Find the user by ID and delete their account
    const deletedUser = await User.findByIdAndDelete(userId);

    if (deletedUser) {
      res.clearCookie("token", { path: "/" });
      res.status(200).send({ message: "Account deleted and cookie cleared" });
    } else {
      res.status(404).json({ message: "User not found" });
    }
  } catch (error) {
    console.error("Error deleting user account:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const generateRandomPassword = () => {
  return crypto.randomBytes(8).toString("hex");
};

// Fonction pour réinitialiser le mot de passe
export const passwordForgotten = async (req: CustomRequest, res: Response) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      res.status(404).json({message: "Utilisateur non trouvé."});
      return
    }

    const newPassword = generateRandomPassword();

    user.password = newPassword;
    await user.save();

    const mailOptions = {
      from: process.env.EMAIL_USER, // Sender address
      to: email, // List of recipients
      subject: "Réinitialisation de votre mot de passe", // Subject line
      text: `Bonjour,
          
          Votre demande de réinitialisation de mot de passe a été traitée avec succès.
          
          Votre nouveau mot de passe est : ${newPassword}
          
          Pour des raisons de sécurité, nous vous recommandons de changer ce mot de passe dès votre prochaine connexion.
          
          Si vous n'avez pas demandé cette réinitialisation, veuillez nous contacter immédiatement.
          
          Merci,
          L'équipe de support`, // Plain text body
      html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
                <h2 style="color: #333;">Bonjour,</h2>
                <p style="color: #333;">
                  Votre demande de réinitialisation de mot de passe a été traitée avec succès.
                </p>
                <p style="color: #333;">
                  <strong>Votre nouveau mot de passe est :</strong> <span style="background-color: #f4f4f4; padding: 5px; border-radius: 5px;">${newPassword}</span>
                </p>
                <p style="color: #333;">
                  Pour des raisons de sécurité, nous vous recommandons de changer ce mot de passe dès votre prochaine connexion.
                </p>
                <p style="color: #333;">
                  Si vous n'avez pas demandé cette réinitialisation, veuillez nous contacter immédiatement.
                </p>
                <p style="color: #333;">
                  Merci,<br>
                  <em>L'équipe de support</em>
                </p>
                <div style="border-top: 1px solid #ddd; padding-top: 10px; margin-top: 20px;">
                  <p style="font-size: 0.9em; color: #999;">
                    Ceci est un message automatique, merci de ne pas y répondre.
                  </p>
                </div>
              </div>
            `,
    };

    await transporter.sendMail(mailOptions);

    res
      .status(200)
      .send("Un nouveau mot de passe a été envoyé à votre adresse e-mail.");
  } catch (error) {
    console.error(error);
    res.status(500).send("Erreur lors de la réinitialisation du mot de passe.");
  }
};
