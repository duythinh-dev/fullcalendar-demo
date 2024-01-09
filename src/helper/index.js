let eventGuid = 0;

const arrColor = [
  "#2C3333",
  "#2E4F4F",
  "#0E8388",
  "#CBE4DE",
  "#451952",
  "#662549",
  "#AE445A",
  "#F39F5A",
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
  const idxRandom = Math.floor(Math.random() * arrColor.length);
  return arrColor[idxRandom];
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
