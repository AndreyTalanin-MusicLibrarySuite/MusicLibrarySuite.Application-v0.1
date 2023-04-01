import dayjs, { Dayjs } from "dayjs";
import weekday from "dayjs/plugin/weekday";
import localeData from "dayjs/plugin/localeData";

dayjs.extend(weekday);
dayjs.extend(localeData);

export const getStartOfDayDate = (dayjsDate: Dayjs): Date => {
  return dayjsDate.startOf("day").add(dayjsDate.utcOffset(), "minute").toDate();
};
