import User, { Role } from "../models/User";
import bcrypt from "bcryptjs";

export const createDefaultAdmin = async () => {
  const exists = await User.findOne({ role: Role.ADMIN });

  if (!exists) {
    const hashed = await bcrypt.hash("Admin@123", 10);

    await User.create({
      name: "Administrator",
      email: "admin@example.com",
      password: hashed,
      role: [Role.ADMIN],
    });

    console.log("Default ADMIN created (admin@example.com / Admin@123)");
  }
};
