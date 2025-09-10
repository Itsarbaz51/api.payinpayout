import Prisma from "../src/db/db.js";
import { hashPassword } from "../src/utils/lib.js";

async function main() {
  const hashedPassword = await hashPassword("admin123");

  const superAdmin = await Prisma.user.upsert({
    where: { email: "admin@gmail.com", role: "ADMIN" },
    update: {},
    create: {
      name: "Admin",
      email: "admin@gmail.com",
      phone: "9999999999",
      password: hashedPassword,
      role: "ADMIN",
      isAuthorized: true,
      status: "ACTIVE",
    },
  });

  console.log("✅ Super Admin Seeded:", superAdmin.email);
}

main()
  .then(async () => {
    await Prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await Prisma.$disconnect();
    process.exit(1);
  });
