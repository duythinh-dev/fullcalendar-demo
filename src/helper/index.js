let eventGuid = 0;

const OPTION_COLORS = [
  "#2C3333",
  "#2E4F4F",
  "#0E8388",
  "#CBE4DE",
  "#451952",
  "#662549",
  "#AE445A",
  "#F39F5A",
];

export const OPTION_VIEWS = [
  {
    type: "dayGridMonth",
    title: "Month",
  },
  {
    type: "timeGridTwoWeek",
    title: "Two weeks",
  },
  {
    type: "timeGridWeek",
    title: "Week",
  },
  {
    type: "timeGridThreeDay",
    title: "Three days",
  },
  {
    type: "timeGridTwoDay",
    title: "Two days",
  },
  {
    type: "timeGridDay",
    title: "Day",
  },
];

function randomDate(start, end) {
  return new Date(
    start.getTime() + Math.random() * (end.getTime() - start.getTime())
  );
}

export const INITIAL_EVENTS = Array.apply(null, { length: 100 }).map(
  (_, index) => {
    return {
      id: createEventId(),
      title: `Event ${index}`,
      start: randomDate(new Date(2024, 1, 1), new Date()),
      color: randomColor(),
      allDay: index % 5 === 0 ? true : false,
    };
  }
);

export function createEventId() {
  return String(eventGuid++);
}

export function randomColor() {
  const idxRandom = Math.floor(Math.random() * OPTION_COLORS.length);
  return OPTION_COLORS[idxRandom];
}

export function getFirstAndLastDay(day, type) {
  const date = new Date(day);
  let firstDay;
  let lastDay;
  if (type === "timeGridWeek" || type === "timeGridTwoWeek") {
    const first = date.getDate() - date.getDay();
    const last = first + (type === "timeGridTwoWeek" ? 13 : 6);

    firstDay = new Date(date.setDate(first));
    lastDay = new Date(date.setDate(last));
    if (first <= 0) lastDay = new Date(date.setMonth(date.getMonth() + 1));
  } else if (type === "timeGridThreeDay" || type === "timeGridTwoDay") {
    const first = date.getDate();
    const last = first + (type === "timeGridThreeDay" ? 2 : 1);

    firstDay = new Date(date.setDate(first));
    lastDay = new Date(date.setDate(last));
  } else {
    firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
    lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0);
  }

  return {
    firstDay,
    lastDay,
  };
}

export function getSunday(d) {
  d = new Date(d);
  var day = d.getDay(),
    diff = d.getDate() - day + (day == 0 ? -6 : 0);
  return new Date(d.setDate(diff));
}

const addDayToDate = (dateObj, numberOfWeeks, action) => {
  dateObj.setDate(
    dateObj.getDate() + numberOfWeeks * (action === "next" ? 1 : -1)
  );
  return dateObj;
};

const addWeeksToDate = (dateObj, numberOfWeeks, action) => {
  dateObj.setDate(
    dateObj.getDate() + (action === "next" ? 1 : -1) * (numberOfWeeks * 7)
  );
  return dateObj;
};

function addMonth(date, amount) {
  const newDate = new Date(date.getTime());

  newDate.setMonth(newDate.getMonth() + amount);

  return newDate;
}

export const handleNextOrPrevDate = (type, fd, ld, action) => {
  const firstDay = new Date(fd);
  const lastDay = new Date(ld);
  let fdResult;
  let ldResult;
  switch (type) {
    case "timeGridDay":
      fdResult = addDayToDate(firstDay, 1, action);
      ldResult = addDayToDate(firstDay, 1, action);
      break;
    case "timeGridTwoDay":
      fdResult = addDayToDate(firstDay, 2, action);
      ldResult = addDayToDate(lastDay, 2, action);
      break;
    case "timeGridThreeDay":
      fdResult = addDayToDate(firstDay, 3, action);
      ldResult = addDayToDate(lastDay, 3, action);
      break;
    case "timeGridWeek":
      fdResult = addWeeksToDate(firstDay, 1, action);
      ldResult = addWeeksToDate(lastDay, 1, action);
      break;
    case "timeGridTwoWeek":
      fdResult = addWeeksToDate(firstDay, 2, action);
      ldResult = addWeeksToDate(lastDay, 2, action);
      break;
    case "dayGridMonth":
    default:
      fdResult =
        action === "next" ? addMonth(firstDay, 1) : addMonth(firstDay, -1);
      ldResult = getFirstAndLastDay(
        action === "next" ? addMonth(firstDay, 1) : addMonth(firstDay, -1),
        "dayGridMonth"
      ).lastDay;
      break;
  }
  return {
    fdResult,
    ldResult,
  };
};
