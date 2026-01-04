import User, { Role } from "../models/User";
import bcrypt from "bcryptjs";

export const createDefaultAdmin = async () => {
  const exists = await User.findOne({ role: { $in: [Role.ADMIN] } });

  if (!exists) {
    const password = process.env.DEFAULT_ADMIN_PASSWORD;
    if (!password) {
      throw new Error("DEFAULT_ADMIN_PASSWORD not set");
    }

    const hashed = await bcrypt.hash(password, 10);

    await User.create({
      name: "Administrator",
      email: process.env.DEFAULT_ADMIN_EMAIL,
      password: hashed,
      role: [Role.ADMIN],
    });

    console.log("Default ADMIN created !");
  }
};
