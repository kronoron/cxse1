import { PrismaClient, Role } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const company = await prisma.company.upsert({
    where: { id: "seed-company" },
    update: {},
    create: { id: "seed-company", name: "Acme Corp", domain: "acme.test" },
  });

  const passwordHash = await bcrypt.hash("Password123!", 10);

  const owner = await prisma.user.upsert({
    where: { email: "owner@acme.test" },
    update: {},
    create: {
      email: "owner@acme.test",
      name: "Owner One",
      passwordHash,
      isOwner: true,
      role: Role.OWNER,
      companyId: company.id,
    },
  });

  const sdr = await prisma.user.upsert({
    where: { email: "sdr@acme.test" },
    update: {},
    create: {
      email: "sdr@acme.test",
      name: "Sally SDR",
      passwordHash,
      role: Role.SDR,
      companyId: company.id,
    },
  });

  await prisma.scenario.create({
    data: {
      title: "AE call with SaaS buyer",
      description: "Discovery call with budget objection",
      role: Role.AE,
      industry: "SaaS",
      companyId: company.id,
      createdById: owner.id,
      isCustom: false,
    },
  });

  console.log({ company, owner, sdr });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });


