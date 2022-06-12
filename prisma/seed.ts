import { PrismaClient, Prisma } from "@prisma/client";
import { hashPassword } from "../lib/auth";

const prisma = new PrismaClient();

async function seed() {
  console.log("Start seeding ...");

  console.log("Seeding course");
  await prisma.course.upsert({
    where: { id: 1 },
    update: {},
    create: {
      name: "Sedgley Woods",
      location: {
        create: {
          city: "Philadelphia",
          state: "PA",
          lat: 39.9526,
          lon: 75.1652,
        },
      },
      layouts: {
        create: [
          {
            name: "1-9 Blue Front Nine",
            holes: {
              create: [
                {
                  number: 1,
                  par: 3,
                  distance: 186,
                },
                {
                  number: 2,
                  par: 3,
                  distance: 418,
                },
                {
                  number: 3,
                  par: 3,
                  distance: 193,
                },
                {
                  number: 4,
                  par: 3,
                  distance: 233,
                },
                {
                  number: 5,
                  par: 3,
                  distance: 190,
                },
                {
                  number: 6,
                  par: 3,
                  distance: 204,
                },
                {
                  number: 7,
                  par: 3,
                  distance: 257,
                },
                {
                  number: 8,
                  par: 3,
                  distance: 183,
                },
                {
                  number: 9,
                  par: 3,
                  distance: 221,
                },
              ],
            },
          },
        ],
      },
    },
  });
  console.log("Finished seeding course");

  console.log("Seeding user");
  await prisma.user.upsert({
    where: { id: 1 },
    create: {
      fName: "Sean",
      lName: "Messerly",
      email: "sean@example.com",
      username: "smess",
      passwordHash: await hashPassword("password123"),
      scoreCards: {
        create: [
          {
            layoutId: 1,
            date: new Date(Date.UTC(2021, 8, 1, 8, 0)),
            scores: {
              create: [
                {
                  holeId: 1,
                  strokes: 3,
                },
                {
                  holeId: 2,
                  strokes: 2,
                },
                {
                  holeId: 3,
                  strokes: 3,
                },
                {
                  holeId: 4,
                  strokes: 4,
                },
                {
                  holeId: 5,
                  strokes: 3,
                },
                {
                  holeId: 6,
                  strokes: 3,
                },
                {
                  holeId: 7,
                  strokes: 3,
                },
                {
                  holeId: 8,
                  strokes: 1,
                },
                {
                  holeId: 9,
                  strokes: 3,
                },
              ],
            },
          },
        ],
      },
    },
    update: {},
  });
  console.log("Finished seeding user");
}

seed()
  .then(() => {
    console.log("Seeding finished");
  })
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
