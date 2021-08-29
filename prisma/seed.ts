import { PrismaClient, Prisma } from "@prisma/client";

const prisma = new PrismaClient();

const courseData: Prisma.CourseCreateInput[] = [
  {
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
          id: 1,
          name: "1-9 Blue Front Nine",
          holes: {
            create: [
              {
                id: 0,
                number: 1,
                par: 3,
                distance: 186,
              },
              {
                id: 1,
                number: 2,
                par: 3,
                distance: 418,
              },
              {
                id: 2,
                number: 3,
                par: 3,
                distance: 193,
              },
              {
                id: 3,
                number: 4,
                par: 3,
                distance: 233,
              },
              {
                id: 4,
                number: 5,
                par: 3,
                distance: 190,
              },
              {
                id: 5,
                number: 6,
                par: 3,
                distance: 204,
              },
              {
                id: 6,
                number: 7,
                par: 3,
                distance: 257,
              },
              {
                id: 7,
                number: 8,
                par: 3,
                distance: 183,
              },
              {
                id: 8,
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
];

const userData: Prisma.UserCreateInput[] = [
  {
    fName: "Sean",
    lname: "Messerly",
    email: "sean@example.com",
    scoreCards: {
      create: [
        {
          layoutId: 1,
          date: new Date(Date.UTC(2021, 8, 1, 8, 0)),
          scores: {
            create: [
              {
                holeId: 0,
                strokes: 3,
              },
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
            ],
          },
        },
      ],
    },
  },
];

async function main() {
  console.log(`Start seeding ...`);

  userData.forEach(async (u) => {
    const user = await prisma.user.create({
      data: u,
    });
    console.log(`Created user with id: ${user.id}`);
  });

  courseData.forEach(async (c) => {
    const course = await prisma.course.create({
      data: c,
    });
    console.log(`Created course with id: ${course.id}`);
  });

  console.log(`Seeding finished.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
