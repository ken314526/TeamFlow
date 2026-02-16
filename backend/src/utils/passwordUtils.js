import bcrypt from 'bcryptjs';

export const passwordUtils = {
  hashPassword: async (password) => {
    return bcrypt.hash(password, 10);
  },

  comparePassword: async (password, hashedPassword) => {
    return bcrypt.compare(password, hashedPassword);
  },
};
