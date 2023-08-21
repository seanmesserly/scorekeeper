import prisma from "./prisma";
import {
  Course,
  Hole,
  Layout,
  User,
  UserAuth,
  Score,
  ScoreCard,
} from "./types";

// courseExists determines if the course with the given name and location exists.
export const courseExists = async (
  name: string,
  city: string,
  state: string
): Promise<boolean> => {
  const location = await prisma.location.findFirst({
    where: { city: city, state: state },
  });
  if (location === null) {
    return false;
  }
  const course = await prisma.course.findFirst({
    where: { name: name, location: location },
  });
  return course !== null;
};

// courseExistsByID determines if a course with the given ID exists.
export const courseExistsByID = async (courseID: number): Promise<boolean> => {
  const course = await prisma.course.findUnique({ where: { id: courseID } });
  return course !== null;
};

// createCourse creates a course with the given metadata.
export const createCourse = async (
  name: string,
  city: string,
  state: string,
  lat: number,
  lon: number
): Promise<Course> => {
  const existingLocation = await prisma.location.findFirst({
    where: { city: city, state: state },
  });
  const location =
    existingLocation !== null
      ? existingLocation
      : await prisma.location.create({
          data: { lat: lat, lon: lon, city: city, state: state },
        });
  const course = await prisma.course.create({
    data: { name: name, locationId: location.id },
  });
  return {
    id: course.id,
    name: course.name,
    city: location.city,
    state: location.state,
    lat: location.lat,
    lon: location.lon,
  };
};

// getCourses returns all courses in the database.
export const getCourses = async (): Promise<Array<Course>> => {
  const courses = await prisma.course.findMany({
    include: {
      location: true,
    },
  });

  return courses.map((course) => ({
    id: course.id,
    name: course.name,
    city: course.location.city,
    state: course.location.state,
    lat: course.location.lat,
    lon: course.location.lon,
  }));
};

// getCourse returns the data for the course with the same name, city, and state or null if it does not exist.
export const getCourse = async (
  name: string,
  city: string,
  state: string
): Promise<Course | null> => {
  const location = await prisma.location.findFirst({
    where: { city: city, state: state },
  });
  if (!location) {
    return null;
  }
  const course = await prisma.course.findFirst({
    include: {
      location: true,
    },
    where: { name: name, location: location },
  });
  if (!course) {
    return null;
  }

  return {
    id: course.id,
    name: course.name,
    city: course.location.city,
    state: course.location.state,
    lat: course.location.lat,
    lon: course.location.lon,
  };
};

// getCourse returns the data for the course with the given ID or null if it does not exist.
export const getCourseByID = async (
  courseID: number
): Promise<Course | null> => {
  const course = await prisma.course.findUnique({
    include: {
      location: true,
    },
    where: { id: courseID },
  });
  if (!course) {
    return null;
  }

  return {
    id: course.id,
    name: course.name,
    city: course.location.city,
    state: course.location.state,
    lat: course.location.lat,
    lon: course.location.lon,
  };
};

// updateCourse updates the target course with a new name and location information.
export const updateCourse = async (
  courseID: number,
  name: string,
  city: string,
  state: string,
  lat: number,
  lon: number
): Promise<Course> => {
  const course = await prisma.course.update({
    include: {
      location: true,
    },
    data: {
      name: name,
      location: {
        // Automatically creates new location no matter what, this should change
        create: {
          city,
          state,
          lat,
          lon,
        },
      },
    },
    where: {
      id: courseID,
    },
  });

  return {
    id: course.id,
    name: course.name,
    city: course.location.city,
    state: course.location.state,
    lat: course.location.lat,
    lon: course.location.lon,
  };
};

// deleteCourse deletes the course with the given ID.
export const deleteCourse = async (courseID: number): Promise<void> => {
  await prisma.course.delete({ where: { id: courseID } });
};

// layoutExists determines if a layout with the given name exists for the given course.
export const layoutExists = async (
  name: string,
  courseID: number
): Promise<boolean> => {
  const layout = await prisma.layout.findFirst({
    where: { name: name, courseId: courseID },
  });
  return layout !== null;
};

// createLayout creates a course layout with the given name and holes.
export const createLayout = async (
  name: string,
  courseID: number,
  holes: Array<Hole>
): Promise<Layout> => {
  const layout = await prisma.layout.create({
    include: { holes: true },
    data: {
      name: name,
      courseId: courseID,
      holes: {
        create: holes,
      },
    },
  });

  return {
    id: layout.id,
    name: layout.name,
    holes: layout.holes.map((hole) => ({
      number: hole.number,
      distance: hole.distance,
      par: hole.par,
    })),
  };
};

// getLayout returns the data for a layout with the given ID or null if it does not exist.
export const getLayout = async (layoutID: number): Promise<Layout | null> => {
  const layout = await prisma.layout.findUnique({
    where: { id: layoutID },
    include: { holes: true },
  });
  if (!layout) {
    return null;
  }
  return {
    id: layout.id,
    name: layout.name,
    holes: layout.holes.map((hole) => ({
      number: hole.number,
      par: hole.par,
      distance: hole.distance,
    })),
  };
};

// getLayouts returns the data for all layouts for the given course.
export const getLayouts = async (courseID: number): Promise<Array<Layout>> => {
  const layouts = await prisma.layout.findMany({
    where: { courseId: courseID },
    include: { holes: true },
  });
  if (!layouts) {
    return [];
  }
  return layouts.map((layout) => ({
    id: layout.id,
    name: layout.name,
    holes: layout.holes.map((hole) => ({
      number: hole.number,
      par: hole.par,
      distance: hole.distance,
    })),
  }));
};

// updateLayout updates a course layout with the given name and holes.
export const updateLayout = async (
  layoutID: number,
  name: string,
  holes: Array<Hole>
): Promise<Layout> => {
  const layout = await prisma.layout.update({
    where: { id: layoutID },
    include: { holes: true },
    data: {
      name: name,
      //TODO: This will create new holes with new IDs and will break scores.
      // Should switch to having scores be based on layoutID + hole number
      holes: {
        deleteMany: { layoutId: layoutID },
        create: holes,
      },
    },
  });

  return {
    id: layout.id,
    name: layout.name,
    holes: layout.holes.map((hole) => ({
      number: hole.number,
      distance: hole.distance,
      par: hole.par,
    })),
  };
};

// deleteLayout deletes the layout with the given ID.
export const deleteLayout = async (layoutID: number): Promise<void> => {
  await prisma.layout.delete({ where: { id: layoutID } });
};

// getUserAuth finds a user with auth information based on their email or returns null if none exist.
export const getUserAuth = async (email: string): Promise<UserAuth | null> => {
  const user = await prisma.user.findUnique({
    where: {
      email: email,
    },
  });
  if (!user) {
    return null;
  }
  return {
    id: user.id,
    email: user.email,
    username: user.username,
    passwordHash: user.passwordHash,
  };
};

// getUserByID returns the target user if it exists and null otherwise.
export const getUserByID = async (id: number): Promise<User | null> => {
  const user = await prisma.user.findUnique({
    where: {
      id: id,
    },
  });

  if (!user) {
    return null;
  }
  return {
    id: user.id,
    firstName: user.fName,
    lastName: user.lName,
    email: user.email,
    username: user.username,
  };
};

// getUserByEmail returns the target user by email if it exists and null otherwise.
export const getUserByEmail = async (email: string): Promise<User | null> => {
  const user = await prisma.user.findUnique({
    where: {
      email: email,
    },
  });

  if (!user) {
    return null;
  }
  return {
    id: user.id,
    firstName: user.fName,
    lastName: user.lName,
    email: user.email,
    username: user.username,
  };
};

// userWithEmailExists returns true if there exists a user with the given email.
export const userWithEmailExists = async (email: string): Promise<boolean> => {
  const user = await prisma.user.findUnique({
    where: {
      email: email,
    },
  });
  return user !== null;
};

// userWithUsernameExists returns true if there exists a user with the given username.
export const userWithUsernameExists = async (
  username: string
): Promise<boolean> => {
  const user = await prisma.user.findUnique({
    where: {
      username: username,
    },
  });
  return user !== null;
};

// userWithIDExists returns true if there exists a user with the given ID.
export const userWithIDExists = async (id: number): Promise<boolean> => {
  const user = await prisma.user.findUnique({
    where: {
      id: id,
    },
  });
  return user !== null;
};

// createUser registers a user in the database.
export const createUser = async (
  username: string,
  email: string,
  firstName: string,
  lastName: string,
  passwordHash: string
): Promise<User> => {
  const user = await prisma.user.create({
    data: {
      fName: firstName,
      lName: lastName,
      email: email,
      username: username,
      passwordHash: passwordHash,
    },
  });

  return {
    id: user.id,
    firstName: user.fName,
    lastName: user.lName,
    email: user.email,
    username: user.username,
  };
};

// updateUser updates a user's first name, last name, or email.
export const updateUser = async (
  userID: number,
  firstName: string,
  lastName: string,
  email: string
): Promise<User | null> => {
  const user = await prisma.user.update({
    data: {
      fName: firstName,
      lName: lastName,
      email: email,
    },
    where: {
      id: userID,
    },
  });

  if (!user) {
    return null;
  }
  return {
    id: user.id,
    firstName: user.fName,
    lastName: user.lName,
    username: user.username,
    email: user.email,
  };
};

// deleteUser deletes the user with the given ID.
export const deleteUser = async (userId: number): Promise<void> => {
  await prisma.user.delete({ where: { id: userId } });
};

// createScoreCard creates a new score card with the given metadata.
export const createScoreCard = async (
  userID: number,
  layoutID: number,
  datetime: Date,
  scores: Array<Score>
): Promise<ScoreCard> => {
  const scoreCard = await prisma.scoreCard.create({
    include: {
      scores: true,
      layout: true,
    },
    data: {
      userId: userID,
      layoutId: layoutID,
      date: datetime,
      scores: {
        create: scores,
      },
    },
  });

  return {
    id: scoreCard.id,
    courseID: scoreCard.layout.courseId,
    layoutID: scoreCard.layoutId,
    datetime: scoreCard.date.toISOString(),
    scores: scoreCard.scores,
  };
};

// getScoreCard returns the score card with the given ID, or null if it doesn't exist.
export const getScoreCard = async (id: number): Promise<ScoreCard | null> => {
  const scoreCard = await prisma.scoreCard.findUnique({
    include: {
      scores: true,
      layout: true,
    },
    where: {
      id: id,
    },
  });
  if (!scoreCard) {
    return null;
  }

  return {
    id: scoreCard.id,
    layoutID: scoreCard.layoutId,
    courseID: scoreCard.layout.courseId,
    datetime: scoreCard.date.toISOString(),
    scores: scoreCard.scores,
  };
};

// getScoreCards returns the score cards associated the given user.
export const getScoreCards = async (
  userID: number
): Promise<Array<ScoreCard>> => {
  const scoreCards = await prisma.scoreCard.findMany({
    include: {
      scores: true,
      layout: true,
    },
    where: {
      userId: userID,
    },
  });
  if (!scoreCards) {
    return [];
  }

  return scoreCards.map((scoreCard) => ({
    id: scoreCard.id,
    layoutID: scoreCard.layoutId,
    courseID: scoreCard.layout.courseId,
    datetime: scoreCard.date.toISOString(),
    scores: scoreCard.scores,
  }));
};

// updateScoreCard updates the target score card with a new datetime and scores. Returns null if the update fails
export const updateScoreCard = async (
  scoreCardID: number,
  datetime: Date,
  scores: Array<Score>
): Promise<ScoreCard | null> => {
  const scoreCard = await prisma.scoreCard.update({
    include: {
      scores: true,
      layout: true,
    },
    data: {
      date: datetime,
      scores: {
        deleteMany: {
          scoreCardId: scoreCardID,
        },
        create: scores,
      },
    },
    where: {
      id: scoreCardID,
    },
  });

  if (!scoreCard) {
    return null;
  }

  return {
    id: scoreCard.id,
    courseID: scoreCard.layout.courseId,
    layoutID: scoreCard.layoutId,
    datetime: scoreCard.date.toISOString(),
    scores: scoreCard.scores,
  };
};

// deleteScoreCard deletes the score card with the given ID.
export const deleteScoreCard = async (scoreCardID: number): Promise<void> => {
  await prisma.scoreCard.delete({ where: { id: scoreCardID } });
};
