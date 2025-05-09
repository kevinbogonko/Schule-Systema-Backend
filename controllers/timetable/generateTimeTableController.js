// Teachers
const teachers = [
  { id: 1, name: "Mr. Kamau", subjects: ["Math"] },
  { id: 2, name: "Ms. Achieng", subjects: ["Math"] },
  { id: 3, name: "Ms. Wambui", subjects: ["English"] },
  { id: 4, name: "Mr. Otieno", subjects: ["Chemistry"] },
];

// Streams
const streams = [
  { id: 1, name: "1W", form: 1 },
  { id: 2, name: "1E", form: 1 },
];

// // Subjects per Stream
// const subjectsPerStream = [
//   { id: 1, name: "Math", periodsPerWeek: 4, streamId: 1 },
//   { id: 2, name: "Math", periodsPerWeek: 4, streamId: 2 },
//   { id: 3, name: "English", periodsPerWeek: 3, streamId: 1 },
//   { id: 4, name: "Chemistry", periodsPerWeek: 2, streamId: 2 },
// ];

// Subjects per Stream
const subjectsPerStream = [
  { id: 1, name: "Math", periodsPerWeek: 4, streamId: 1, teacherId: 1 },
  { id: 2, name: "Math", periodsPerWeek: 4, streamId: 2, teacherId: 2 },
  { id: 3, name: "English", periodsPerWeek: 3, streamId: 1, teacherId: 2 },
  { id: 4, name: "Chemistry", periodsPerWeek: 2, streamId: 2, teacherId: 1 },
];

const timeSlots = [
  { id: 1, label: "8:00 - 9:00", type: "lesson" },
  { id: 2, label: "9:00 - 10:00", type: "lesson" },
  { id: 3, label: "10:00 - 10:30", type: "break" }, // Morning break
  { id: 4, label: "10:30 - 11:30", type: "lesson" },
  { id: 5, label: "11:30 - 12:30", type: "lesson" },
  { id: 5, label: "1:00 - 2:00", type : "lunch"},
  { id: 6, label: "2:00 - 3:00", type: "lesson"},
  { id: 7, label: "3:30 - 4:30", type: "games" }, // Games period (some days)
];

// Days of the Week
const days = [
  { name: "Monday", hasGames: true },
  { name: "Tuesday", hasGames: false },
  { name: "Wednesday", hasGames: true },
  { name: "Thursday", hasGames: false },
  { name: "Friday", hasGames: true },
];

// Lessons Assigned
const lessonsAssigned = [
  { teacherId: 1, streamId: 1, subject: "Math", day: "Monday", timeSlotId: 1 },
  { teacherId: 2, streamId: 2, subject: "Math", day: "Monday", timeSlotId: 1 },
  {
    teacherId: 3,
    streamId: 1,
    subject: "English",
    day: "Monday",
    timeSlotId: 2,
  },
  {
    teacherId: 4,
    streamId: 2,
    subject: "Chemistry",
    day: "Tuesday",
    timeSlotId: 3,
  },
  { teacherId: 1, streamId: 1, subject: "Math", day: "Tuesday", timeSlotId: 4 },
  { teacherId: 2, streamId: 2, subject: "Math", day: "Tuesday", timeSlotId: 5 },
  {
    teacherId: 3,
    streamId: 1,
    subject: "English",
    day: "Tuesday",
    timeSlotId: 6,
  },
  {
    teacherId: 4,
    streamId: 2,
    subject: "Chemistry",
    day: "Wednesday",
    timeSlotId: 1,
  },
  {
    teacherId: 1,
    streamId: 1,
    subject: "Math",
    day: "Wednesday",
    timeSlotId: 2,
  },
  {
    teacherId: 2,
    streamId: 2,
    subject: "Math",
    day: "Wednesday",
    timeSlotId: 3,
  },
  {
    teacherId: 3,
    streamId: 1,
    subject: "English",
    day: "Wednesday",
    timeSlotId: 4,
  },
  {
    teacherId: 4,
    streamId: 2,
    subject: "Chemistry",
    day: "Thursday",
    timeSlotId: 5,
  },
  {
    teacherId: 1,
    streamId: 1,
    subject: "Math",
    day: "Thursday",
    timeSlotId: 6,
  },
  {
    teacherId: 2,
    streamId: 2,
    subject: "Math",
    day: "Thursday",
    timeSlotId: 1,
  },
  {
    teacherId: 3,
    streamId: 1,
    subject: "English",
    day: "Thursday",
    timeSlotId: 2,
  },
  {
    teacherId: 4,
    streamId: 2,
    subject: "Chemistry",
    day: "Friday",
    timeSlotId: 3,
  },
  { teacherId: 1, streamId: 1, subject: "Math", day: "Friday", timeSlotId: 4 },
  { teacherId: 2, streamId: 2, subject: "Math", day: "Friday", timeSlotId: 5 },
  {
    teacherId: 3,
    streamId: 1,
    subject: "English",
    day: "Friday",
    timeSlotId: 6,
  },
];

// Generate endpoint
export const generateSchoolTimetable = async (req, res, next) => {
  try {
    const timetable = generateTimetable(
      streams,
      subjectsPerStream,
      teachers,
      timeSlots,
      days,
      lessonsAssigned
    );
    res.json(timetable);
  } catch (err) {
    next(err);
  }
};

function generateTimetable(
  streams,
  subjects,
  teachers,
  timeSlots,
  days,
  lessonsAssigned
) {
  const timetable = {};
  const teacherConflictMap = {};
  const streamSlotConflictMap = {};
  const streamSubjectCounts = {};
  const validationErrors = [];

  // Initialize tracking objects
  for (const stream of streams) {
    streamSubjectCounts[stream.id] = {};
    streamSlotConflictMap[stream.id] = {};

    const streamSubjects = subjects.filter((s) => s.streamId === stream.id);
    for (const subject of streamSubjects) {
      streamSubjectCounts[stream.id][subject.name] = 0;
    }

    for (const day of days) {
      streamSlotConflictMap[stream.id][day.name] = {};
    }
  }

  // Process all streams
  for (const stream of streams) {
    const streamTable = {};

    for (const day of days) {
      streamTable[day.name] = [];

      for (const slot of timeSlots) {
        // Skip games if not scheduled for this day
        if (slot.type === "games" && !day.hasGames) {
          continue;
        }

        // Handle non-lesson periods
        if (slot.type !== "lesson") {
          streamTable[day.name].push({
            time: slot.label,
            type: slot.type,
            description: getPeriodDescription(slot.type, day.name),
            subject: null,
            teacher: null,
          });
          continue;
        }

        // Process regular lessons
        const lesson = lessonsAssigned.find(
          (l) =>
            l.streamId === stream.id &&
            l.day === day.name &&
            l.timeSlotId === slot.id
        );

        if (lesson) {
          // Teacher qualification check
          const teacher = teachers.find((t) => t.id === lesson.teacherId);
          if (!teacher || !teacher.subjects.includes(lesson.subject)) {
            validationErrors.push(
              `Invalid assignment: ${
                teacher?.name || lesson.teacherId
              } cannot teach ${lesson.subject}`
            );
          }

          // Teacher time conflict check
          const teacherKey = `${day.name}-${slot.id}`;
          teacherConflictMap[teacherKey] =
            teacherConflictMap[teacherKey] || new Set();

          if (teacherConflictMap[teacherKey].has(lesson.teacherId)) {
            validationErrors.push(
              `Teacher conflict: ${
                teacher?.name || lesson.teacherId
              } is double-booked on ${day.name} at ${slot.label}`
            );
          }
          teacherConflictMap[teacherKey].add(lesson.teacherId);

          // Stream slot conflict check
          if (streamSlotConflictMap[stream.id][day.name][slot.id]) {
            validationErrors.push(
              `Stream conflict: ${stream.name} already has ${
                streamSlotConflictMap[stream.id][day.name][slot.id]
              } at ${slot.label} on ${day.name}`
            );
          }
          streamSlotConflictMap[stream.id][day.name][slot.id] = lesson.subject;

          // Track subject counts
          streamSubjectCounts[stream.id][lesson.subject]++;

          streamTable[day.name].push({
            time: slot.label,
            type: "lesson",
            subject: lesson.subject,
            teacher: teacher?.name || "Unknown",
          });
        } else {
          // Empty lesson slot
          streamTable[day.name].push({
            time: slot.label,
            type: "lesson",
            subject: null,
            teacher: null,
          });
        }
      }
    }

    timetable[stream.name] = streamTable;
  }

  // Verify periods per week requirements
  for (const stream of streams) {
    const streamSubjects = subjects.filter((s) => s.streamId === stream.id);
    for (const subject of streamSubjects) {
      const assignedCount = streamSubjectCounts[stream.id][subject.name] || 0;
      if (assignedCount !== subject.periodsPerWeek) {
        validationErrors.push(
          `Period count mismatch: ${stream.name} has ${assignedCount} ${subject.name} lessons (requires ${subject.periodsPerWeek})`
        );
      }
    }
  }

  if (validationErrors.length > 0) {
    throw new Error(
      "Timetable validation failed:\n" + validationErrors.join("\n")
    );
  }

  return timetable;
}

// Helper function for special periods
function getPeriodDescription(type, day) {
  switch (type) {
    case "break":
      return "Morning Break";
    case "lunch":
      return "Lunch Break";
    case "games":
      return day === "Wednesday" ? "Sports Games" : "Physical Education";
    default:
      return "";
  }
}
