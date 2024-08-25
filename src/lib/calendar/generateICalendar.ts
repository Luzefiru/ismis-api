import ical, {
  ICalCalendarMethod,
  ICalEventData,
  ICalEventRepeatingFreq,
  ICalWeekday,
} from 'ical-generator';
import { z } from 'zod';
import { StudyLoadCourseSchema } from '../../types/StudyLoadCourse';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

dayjs.extend(utc);
dayjs.extend(timezone);

export const StudyLoadSchema = z.array(StudyLoadCourseSchema);

interface StudyLoadCourse {
  group: string;
  courseCode: string;
  schedule: string;
  faculty: string | null;
  units: number;
  status: string;
}

export function generateICalendar(studyLoadCourses: StudyLoadCourse[]): string {
  // Validate input
  StudyLoadSchema.parse(studyLoadCourses);

  const calendar = ical({ name: 'ISMIS Study Load Calendar' });

  // A method is required for outlook to display event as an invitation
  calendar.method(ICalCalendarMethod.PUBLISH);

  studyLoadCourses.forEach((course) => {
    const [daysStr, timeRange, location] = parseSchedule(course.schedule);

    if (!timeRange) {
      console.error('Time range is undefined for schedule:', course.schedule);
      return;
    }

    const [startTimeStr, endTimeStr] = parseTimeRange(timeRange) ?? [];
    if (!startTimeStr || !endTimeStr) {
      console.error('Invalid time range format:', {
        timeRange,
        schedule: course.schedule,
      });
      return;
    }

    const [startHour, startMinute] = parseTime(startTimeStr);
    const [endHour, endMinute] = parseTime(endTimeStr);

    const daysArray = daysStr.match(/\b(M|T|W|Th|F|S)\b/g) || [];

    daysArray.forEach((day) => {
      // Create the start and end times in UTC+8
      const startTime = dayjs()
        .startOf('day')
        .set('hour', startHour)
        .set('minute', startMinute)
        .set('second', 0)
        .set('millisecond', 0)
        .tz('Asia/Shanghai');

      const endTime = dayjs()
        .startOf('day')
        .set('hour', endHour)
        .set('minute', endMinute)
        .set('second', 0)
        .set('millisecond', 0)
        .tz('Asia/Shanghai');

      // Calculate the day offset
      const dayOffset = getDayOffset(day);
      const adjustedStartTime = startTime.add(dayOffset, 'day');
      const adjustedEndTime = endTime.add(dayOffset, 'day');

      const event: ICalEventData = {
        start: adjustedStartTime.toDate(),
        end: adjustedEndTime.toDate(),
        summary: course.faculty
          ? `${course.courseCode} - ${course.faculty}`
          : `${course.courseCode}`,
        description: `Course: ${course.courseCode}\nInstructor: ${course.faculty}\nUnits: ${course.units}\nStatus: ${course.status}`,
        location: location,
        repeating: {
          freq: ICalEventRepeatingFreq.WEEKLY,
          byDay: [convertDayToIcal(day)],
          count: 15,
        },
      };
      // Assuming `calendar.events` is a function that returns an array of events
      const eventsArray = calendar.events();

      // Check if event already exists to avoid duplication
      const existingEvent = eventsArray.find((event) => {
        return (
          event.start() === adjustedStartTime.toDate() &&
          event.end() === adjustedEndTime.toDate() &&
          event.summary === event.summary
        );
      });

      if (!existingEvent) {
        calendar.createEvent(event);
      }
    });
  });

  return calendar.toString();
}

function parseSchedule(schedule: string): [string, string, string] {
  const parts = schedule.split(/\s+/);
  const location = parts.slice(-2).join(' ').trim();
  const timeRangeParts = parts.slice(0, -2);
  const timeRangeMatch = timeRangeParts
    .join(' ')
    .match(/(\d{1,2}:\d{2}\s[APM]{2})\s*-\s*(\d{1,2}:\d{2}\s[APM]{2})/);

  if (!timeRangeMatch) {
    console.error('Invalid time range format:', timeRangeParts.join(' '));
    return ['', '', ''];
  }

  const timeRange = timeRangeMatch[0];
  const daysStr = timeRangeParts
    .slice(0, timeRangeParts.indexOf(timeRangeMatch[0]))
    .join(' ')
    .trim();

  return [daysStr, timeRange, location];
}

function parseTimeRange(timeRange: string): [string, string] | null {
  const timeMatch = timeRange.match(
    /(\d{1,2}:\d{2}\s[APM]{2})\s*-\s*(\d{1,2}:\d{2}\s[APM]{2})/
  );
  if (timeMatch && timeMatch.length === 3) {
    return [timeMatch[1], timeMatch[2]];
  } else {
    console.error('Invalid time range format:', timeRange);
    return null;
  }
}

function parseTime(timeStr: string): [number, number] {
  const [time, modifier] = timeStr.split(' ');
  let [hours, minutes] = time.split(':').map(Number);

  if (modifier === 'PM' && hours < 12) hours += 12;
  if (modifier === 'AM' && hours === 12) hours = 0;

  return [hours, minutes];
}

function getDayOffset(day: string): number {
  const today = dayjs().day();
  const dayMap: Record<string, number> = {
    M: 1, // Monday
    T: 2, // Tuesday
    W: 3, // Wednesday
    Th: 4, // Thursday
    F: 5, // Friday
    S: 6, // Saturday
    Su: 0, // Sunday
  };
  const targetDay = dayMap[day];

  return (targetDay + 7 - today) % 7;
}

function convertDayToIcal(day: string): ICalWeekday {
  const dayMap: Record<string, ICalWeekday> = {
    M: ICalWeekday.MO,
    T: ICalWeekday.TU,
    W: ICalWeekday.WE,
    Th: ICalWeekday.TH,
    F: ICalWeekday.FR,
    S: ICalWeekday.SA,
    Su: ICalWeekday.SU,
  };

  return dayMap[day];
}
