import React, { useEffect, useRef, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin, { Draggable } from "@fullcalendar/interaction";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

import "./App.css";
import {
  INITIAL_EVENTS,
  OPTION_VIEWS,
  createEventId,
  getFirstAndLastDay,
  handleNextOrPrevDate,
  randomColor,
  removeItemFromArr,
} from "./helper";

function App() {
  const fullcalendarRef = useRef();

  const { firstDay, lastDay } = getFirstAndLastDay(new Date(), "dayGridMonth");

  const [currenEvent, setCurrenEvent] = useState(INITIAL_EVENTS);
  const [focusDate, setFocusDate] = useState(new Date());
  const [startDate, setStartDate] = useState(firstDay);
  const [endDate, setEndDate] = useState(lastDay);
  const [view, setView] = useState(null);

  function isEventOverDiv(x, y) {
    const externalEvents = document.getElementById("external-events");
    const rect = externalEvents.getBoundingClientRect();

    return (
      x >= rect.left && y >= rect.top && x <= rect.right && y <= rect.bottom
    );
  }

  const handleOnNextOrPrev = (type) => {
    const { fdResult, ldResult } = handleNextOrPrevDate(
      view,
      startDate,
      endDate,
      type
    );
    fullcalendarRef.current.getApi().gotoDate(fdResult);
    setStartDate(fdResult);
    setEndDate(ldResult);
    setFocusDate(fdResult);
  };

  const handleChangeEvent = (events) => {
    const event = events.event;
    const idChanged = event.id;
    const eventsData = currenEvent.map((e) => {
      if (e.id === idChanged) {
        return {
          id: event.id,
          title: event.title,
          start: event.start,
          end: event.end,
          color: randomColor(),
          allDay: event.allDay,
        };
      }
      return e;
    });
    setCurrenEvent(eventsData);
  };

  const handleRemoveEvent = (clickInfo) => {
    if (
      window.confirm(
        `Are you sure you want to delete the event '${clickInfo.event.title}'`
      )
    ) {
      setCurrenEvent(removeItemFromArr(currenEvent, clickInfo.event.id));
      clickInfo.event.remove();
    }
  };

  const handleAddEvent = (selectInfo) => {
    let title = window.prompt("Please enter a new title for your event");
    let calendarApi = selectInfo.view.calendar;

    calendarApi.unselect(); // clear date selection
    if (title) {
      setCurrenEvent([
        ...currenEvent,
        {
          id: createEventId(),
          title,
          start: selectInfo.startStr,
          end: selectInfo.endStr,
          allDay: selectInfo.allDay,
          color: randomColor(),
        },
      ]);
    }
  };

  const handleChangeTime = (date) => {
    const calendarApi = fullcalendarRef.current.getApi();
    if (calendarApi) {
      const dataDate = Array.isArray(date) ? date[0] : date;
      setFocusDate(dataDate);

      const isTimeGridDay = view === "timeGridDay";
      calendarApi.gotoDate(
        isTimeGridDay
          ? dataDate
          : getFirstAndLastDay(new Date(dataDate), view).firstDay
      );
      setStartDate(
        isTimeGridDay
          ? dataDate
          : getFirstAndLastDay(new Date(dataDate), view).firstDay
      );
      setEndDate(
        isTimeGridDay
          ? dataDate
          : getFirstAndLastDay(new Date(dataDate), view).lastDay
      );
    }
  };

  const handleChangeView = (viewType) => {
    const typeOfView = viewType.target.value;
    fullcalendarRef.current.calendar.changeView(typeOfView);
    if (typeOfView !== "timeGridDay") {
      const objDate = getFirstAndLastDay(new Date(focusDate), typeOfView);
      setStartDate(objDate.firstDay);
      setEndDate(objDate.lastDay);
    } else {
      setStartDate(focusDate);
      setEndDate(focusDate);
    }
    setView(typeOfView);
  };

  const handleEventRecieve = (info) => {
    setCurrenEvent([
      ...currenEvent,
      {
        id: createEventId(),
        title: info.draggedEl.textContent,
        start: info.date,
        allDay: !!info.allDay,
        color: randomColor(),
      },
    ]);
    info.draggedEl.style.display = "none";
  };

  const handleDragStop = (event) => {
    if (isEventOverDiv(event.jsEvent.clientX, event.jsEvent.clientY)) {
      const evId = event.event.id;
      const list = document.getElementById("external-events");
      list.insertAdjacentHTML(
        "afterbegin",
        `<div style="padding: 5px; margin-bottom: 5px;" class="fc-event fc-h-event fc-daygrid-event fc-daygrid-block-event">
          <div class="fc-event-main">${event.event.title}</div>
        </div>`
      );
      setCurrenEvent(removeItemFromArr(currenEvent, evId));
    }
  };

  useEffect(() => {
    let draggableEl = document.getElementById("external-events");
    new Draggable(draggableEl, {
      itemSelector: ".fc-event",
      eventData: function (eventEl) {
        return {
          title: eventEl.innerText,
          create: false,
        };
      },
    });
  }, []);

  return (
    <div
      className="App"
      style={{
        display: "flex",
        padding: "30px",
        gap: "10px",
      }}
    >
      <div
        style={{
          width: "20%",
          minHeight: "100px",
        }}
      >
        <div
          id="external-events"
          style={{
            minHeight: "100px",
            border: "1px solid green",
            padding: "5px",
          }}
        >
          {Array.from({ length: 5 }, (_, index) => (
            <div
              key={`${index}`}
              style={{
                padding: "5px",
                marginBottom: "5px",
              }}
              className="fc-event fc-h-event fc-daygrid-event fc-daygrid-block-event"
            >
              <div className="fc-event-main">My Event {index + 1}</div>
            </div>
          ))}
        </div>

        <div>
          {" "}
          Type views:{" "}
          <select onChange={handleChangeView}>
            {OPTION_VIEWS.map((item, index) => (
              <option
                key={index}
                value={item.type}
                selected={item.type === "dayGridMonth" ? "selected" : ""}
              >
                {item.title}
              </option>
            ))}
          </select>
        </div>
        <div>
          Button Next and Prev :{" "}
          <button type="button" onClick={() => handleOnNextOrPrev("prev")}>
            Prev
          </button>
          <button type="button" onClick={() => handleOnNextOrPrev("next")}>
            Next
          </button>
        </div>
        <div
          style={{
            paddingBottom: "10px",
            paddingTop: "10px",
          }}
        >
          <DatePicker
            selected={startDate}
            onChange={handleChangeTime}
            selectsRange={view !== "timeGridDay"}
            startDate={startDate}
            endDate={endDate}
            inline
          />
        </div>
      </div>
      <div
        style={{
          width: "80%",
        }}
      >
        <FullCalendar
          initialView="dayGridMonth"
          headerToolbar={{
            left: "",
            center: "title",
            right: "",
          }}
          views={{
            timeGridTwoWeek: {
              type: "timeGrid",
              duration: { weeks: 2 },
              buttonText: "2 Weeks",
            },
            timeGridThreeWeek: {
              type: "timeGrid",
              duration: { weeks: 3 },
              buttonText: "3 Weeks",
            },
            timeGridFourWeek: {
              type: "timeGrid",
              duration: { weeks: 4 },
              buttonText: "4 Weeks",
            },
            timeGridThreeDay: {
              type: "timeGrid",
              duration: { days: 3 },
              buttonText: "3 days",
            },
            timeGridFourDay: {
              type: "timeGrid",
              duration: { days: 4 },
              buttonText: "4 days",
            },
          }}
          // customButtons={{
          //   dropdownCustomView: {
          //     text: "Choose View",
          //     className: "fc-custom-view-dropdown",
          //     click: () => {
          //       // Trigger dropdown visibility here
          //     },
          //   },
          // }}
          ref={fullcalendarRef}
          themeSystem="Simplex"
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          droppable
          events={currenEvent}
          editable
          selectable
          // selectMirror
          dayMaxEvents
          dragRevertDuration={0}
          weekends
          eventChange={handleChangeEvent}
          eventDrop={handleChangeEvent}
          eventClick={handleRemoveEvent}
          select={handleAddEvent}
          drop={handleEventRecieve}
          eventDragStop={handleDragStop}
        />
      </div>
    </div>
  );
}

export default App;
