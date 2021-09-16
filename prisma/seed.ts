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
];

const userData: Prisma.UserCreateInput[] = [
  {
    fName: "Sean",
    lName: "Messerly",
    email: "sean@example.com",
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
];

async function main() {
  console.log(`Start seeding ...`);

  courseData.forEach((c) => {
    prisma.course
      .create({
        data: c,
      })
      .then((course) => {
        console.log(`Created course with id: ${course.id}`);
      });
  });

  userData.forEach((u) => {
    prisma.user
      .create({
        data: u,
      })
      .then((user) => {
        console.log(`Created user with id: ${user.id}`);
      });
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
