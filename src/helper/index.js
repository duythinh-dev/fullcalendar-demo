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
    type: "timeGridDay",
    title: "Day",
    plustDate: 1,
  },
  {
    type: "timeGridTwoWeek",
    title: "Two weeks",
    plustDate: 13,
  },
  {
    type: "timeGridThreeWeek",
    title: "Three weeks",
    plustDate: 20,
  },
  {
    type: "timeGridFourWeek",
    title: "Four weeks",
    plustDate: 27,
  },
  {
    type: "timeGridWeek",
    title: "Week",
    plustDate: 6,
  },
  {
    type: "dayGridMonth",
    title: "Month",
  },
  {
    type: "timeGridThreeDay",
    title: "Three Days Rolling",
    plustDate: 2,
  },
  {
    type: "timeGridFourDay",
    title: "Four Days Rolling",
    plustDate: 3,
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
  let plusDay = OPTION_VIEWS.find((item) => item.type === type).plustDate;

  if (
    [
      "timeGridWeek",
      "timeGridTwoWeek",
      "timeGridThreeWeek",
      "timeGridFourWeek",
    ].includes(type)
  ) {
    const first = date.getDate() - date.getDay();
    const last = first + plusDay;

    firstDay = new Date(date.setDate(first));
    lastDay = new Date(date.setDate(last));
    if (first <= 0) lastDay = new Date(date.setMonth(date.getMonth() + 1));
  } else if (type === "timeGridThreeDay" || type === "timeGridFourDay") {
    const first = date.getDate();
    const last = first + plusDay;

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
      ldResult = addDayToDate(lastDay, 1, action);
      break;
    case "timeGridFourDay":
      fdResult = addDayToDate(firstDay, 4, action);
      ldResult = addDayToDate(lastDay, 4, action);
      break;
    case "timeGridThreeDay":
      fdResult = addDayToDate(firstDay, 3, action);
      ldResult = addDayToDate(lastDay, 3, action);
      break;
    case "timeGridWeek":
    case "timeGridTwoWeek":
    case "timeGridThreeWeek":
    case "timeGridFourWeek":
      fdResult = addWeeksToDate(firstDay, 1, action);
      ldResult = addWeeksToDate(lastDay, 1, action);
      break;
    case "dayGridMonth":
    default:
      fdResult =
        action === "next" ? addMonth(firstDay, 1) : addMonth(firstDay, -1);
      ldResult = getFirstAndLastDay(fdResult, "dayGridMonth").lastDay;
      break;
  }
  return {
    fdResult,
    ldResult,
  };
};

export const removeItemFromArr = (arr, id) => {
  let arrResult = [...arr];
  const index = arrResult.findIndex((event) => event.id === id);
  if (index !== -1) {
    arrResult.splice(index, 1);
    return arrResult;
  }
  return arr;
};
