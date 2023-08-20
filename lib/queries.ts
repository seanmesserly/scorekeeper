import prisma from "./prisma";
import { Course, Hole, Layout } from "./types";

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
