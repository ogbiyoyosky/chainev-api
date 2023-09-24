import { format, parse, isBefore, addMonths, isEqual, startOfMonth, endOfMonth } from 'date-fns';
import { utcToZonedTime, zonedTimeToUtc } from 'date-fns-tz';

const localTimezone = 'Africa/Lagos';
const dateFormat = 'yyyy-MM-dd';
const timeFormat = 'HH:mm:ss';

const convertToLocalTimezone = (date: Date | string) => utcToZonedTime(date, localTimezone);

const convertLocalTimezoneToUtc = (date: Date | string) => zonedTimeToUtc(date, localTimezone);

export const formatDateToLocalTimezone = (date: Date | string, formatString: string) => format(convertToLocalTimezone(date), formatString);

export const formatDateAsLocalDateTimeString = (date: string): string => {
  if (!date) return;

  const localDateTime = convertToLocalTimezone(date);

  return `${format(localDateTime, dateFormat)}T${format(localDateTime, timeFormat)}`;
};

export const formatLocalDateAsUTCDate = (date: string): Date => {
  if (!date) return;

  return convertLocalTimezoneToUtc(date);
};

export const isValidDate = (date: string) => {
  try {
    const result = parse(date, dateFormat, new Date());

    return result.toString() === 'Invalid Date' ? false : true;
  } catch (err) {
    return false;
  }
};

export const formatDateAsDateString = (date: Date | number): string => {
  return format(date, dateFormat);
};

export const formatDateForDisplay = (date: Date): string => {
  return format(convertToLocalTimezone(date), 'iii dd MMM');
};

export const getCurrentDateAsString = (): string => {
  return format(new Date(), dateFormat);
};

export const formatDateAsUTCDateTimeString = (date: Date): string => {
  return `${format(date, dateFormat)}T${format(date, timeFormat)}`;
};

export const generateMonthsFromDates = (startDate: Date, endDate: Date) => {
  const months = [];

  for (let date = startDate; isBefore(date, endDate) || isEqual(date, endDate); date = addMonths(date, 1)) {
    months.push({
      start_date: format(startOfMonth(date), dateFormat),
      end_date: format(endOfMonth(date), dateFormat),
      name: `${format(date, 'MMMM')} ${format(endOfMonth(date), 'dd')}, ${format(date, 'yyyy')}`,
    });
  }

  return months;
};

export const generateMonthsFromString = (monthsString: string[]) => {
  const months = [];

  for (const month of monthsString) {
    const date = new Date(month);

    months.push({
      start_date: format(startOfMonth(date), dateFormat),
      end_date: format(endOfMonth(date), dateFormat),
      name: `${format(date, 'MMMM')} ${format(endOfMonth(date), 'dd')}, ${format(date, 'yyyy')}`,
    });
  }

  return months;
};
