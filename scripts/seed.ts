import "dotenv/config";
import { auth } from "../src/auth/auth";
import { prisma } from "../src/database/client";

const seedUser = {
  name: "Usuario Seed",
  email: "seed@bework.local",
  password: "SenhaSeed123!",
};

async function ensureSeedUser() {
  const existingUser = await prisma.user.findUnique({
    where: { email: seedUser.email },
  });

  if (existingUser) {
    return existingUser;
  }

  await auth.api.signUpEmail({
    body: seedUser,
  });

  const user = await prisma.user.findUnique({
    where: { email: seedUser.email },
  });

  if (!user) {
    throw new Error("Seed user was not created");
  }

  return user;
}

async function main() {
  const user = await ensureSeedUser();

  await prisma.project.deleteMany({
    where: { userId: user.id },
  });
  await prisma.parameter.deleteMany({
    where: { userId: user.id },
  });

  const [utmSource, utmMedium, utmCampaign] = await Promise.all([
    prisma.parameter.create({
      data: {
        key: "utm_source",
        value: "google",
        userId: user.id,
      },
    }),
    prisma.parameter.create({
      data: {
        key: "utm_medium",
        value: "cpc",
        userId: user.id,
      },
    }),
    prisma.parameter.create({
      data: {
        key: "utm_campaign",
        value: "lancamento",
        userId: user.id,
      },
    }),
  ]);

  const project = await prisma.project.create({
    data: {
      name: "Campanha de Lancamento",
      slug: "campanha-lancamento",
      userId: user.id,
    },
  });

  const link = await prisma.link.create({
    data: {
      name: "Anuncio principal",
      baseUrl: "https://example.com/produto",
      redirectUrl: "https://lp.example.com/oferta",
      projectId: project.id,
      parameters: {
        create: [
          { parameterId: utmSource.id, order: 0 },
          { parameterId: utmMedium.id, order: 1 },
          { parameterId: utmCampaign.id, order: 2 },
        ],
      },
    },
  });

  console.log("Seed completed");
  console.log(`User: ${seedUser.email}`);
  console.log(`Password: ${seedUser.password}`);
  console.log(`Project id: ${project.id}`);
  console.log(`Link id: ${link.id}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
