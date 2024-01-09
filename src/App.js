import React, { useEffect, useRef, useState } from "react";
// import { formatDate } from '@fullcalendar/core'
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin, { Draggable } from "@fullcalendar/interaction";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

import "./App.css";
import {
  INITIAL_EVENTS,
  createEventId,
  getFirstAndLastDay,
  randomColor,
} from "./helper";

function App() {
  const fullcalendarRef = useRef();

  const { firstDay, lastDay } = getFirstAndLastDay(new Date(), "dayGridMonth");

  const [currenEvent, setCurrenEvent] = useState(INITIAL_EVENTS);
  const [focusDate, setFocusDate] = useState(new Date());
  const [startDate, setStartDate] = useState(firstDay);
  const [endDate, setEndDate] = useState(lastDay);
  const [view, setView] = useState(null);

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
    let calendarApi = fullcalendarRef.current.getApi();
    if (calendarApi) {
      calendarApi.gotoDate(date);
      setFocusDate(date);
      handleChangeAllTime(view, date);
    }
  };

  const handleChangeView = (e) => {
    const viewType = e.view.type;
    handleChangeAllTime(viewType, focusDate);
    setView(viewType);
  };

  const handleChangeAllTime = (v, fcd) => {
    if (v !== "timeGridDay") {
      const objDate = getFirstAndLastDay(new Date(fcd), v);
      setStartDate(objDate.firstDay);
      setEndDate(objDate.lastDay);
    } else {
      setStartDate(fcd);
      setEndDate(fcd);
    }
  };

  const handleEventRecieve = (info) => {
    console.log("info", info);
    var checkbox = document.getElementById("drop-remove");
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
    if (checkbox.checked) {
      info.draggedEl.style.display = "none";
    }
  };

  useEffect(() => {
    let draggableEl = document.getElementById("external-events");
    new Draggable(draggableEl, {
      itemSelector: ".fc-event",
      eventData: function (eventEl) {
        console.log("eventEl", eventEl);
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
        }}
      >
        <div id="external-events">
          <p>
            <strong>Draggable Events</strong>
          </p>

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
          <p>
            <input type="checkbox" id="drop-remove" />
            <label htmlFor="drop-remove">remove after drop</label>
          </p>
        </div>
        <div>
          Date:{" "}
          <DatePicker
            placeholderText="Time"
            selected={startDate}
            onChange={handleChangeTime}
            startDate={startDate}
            endDate={endDate}
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
            left: "prev,next",
            center: "title",
            right: "dayGridMonth,timeGridTwoWeek,timeGridWeek,timeGridDay",
          }}
          views={{
            timeGridTwoWeek: {
              type: "timeGrid",
              duration: { days: 14 },
              buttonText: "2 Week",
            },
          }}
          ref={fullcalendarRef}
          themeSystem="Simplex"
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          droppable
          events={currenEvent}
          editable
          selectable
          // selectMirror
          dayMaxEvents
          weekends
          eventChange={handleChangeEvent}
          eventDrop={handleChangeEvent}
          eventClick={handleRemoveEvent}
          select={handleAddEvent}
          datesSet={handleChangeView}
          drop={handleEventRecieve}
        />
      </div>
    </div>
  );
}

export default App;
