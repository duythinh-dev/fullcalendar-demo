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
  const fullCalendarRef = useRef();

  const { firstDay, lastDay } = getFirstAndLastDay(new Date(), "dayGridMonth");

  const [state, setState] = useState({
    currentEvent: INITIAL_EVENTS,
    focusDate: new Date(),
    startDate: firstDay,
    endDate: lastDay,
    view: null,
  });

  const isEventOverDiv = (x, y) => {
    const externalEvents = document.getElementById("external-events");
    const rect = externalEvents.getBoundingClientRect();

    return (
      x >= rect.left && y >= rect.top && x <= rect.right && y <= rect.bottom
    );
  };

  const handleOnNextOrPrev = (type) => {
    const { fdResult, ldResult } = handleNextOrPrevDate(
      state.view,
      state.startDate,
      state.endDate,
      type
    );
    fullCalendarRef.current.getApi().gotoDate(fdResult);
    setState({
      ...state,
      startDate: fdResult,
      endDate: ldResult,
      focusDate: fdResult,
    });
  };

  const handleChangeEvent = (events) => {
    const event = events.event;
    const idChanged = event.id;
    const eventsData = state.currentEvent.map((e) => {
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
    setState({ ...state, currentEvent: eventsData });
  };

  const handleRemoveEvent = (clickInfo) => {
    if (
      window.confirm(
        `Are you sure you want to delete the event '${clickInfo.event.title}'`
      )
    ) {
      setState({
        ...state,
        currentEvent: removeItemFromArr(state.currentEvent, clickInfo.event.id),
      });
      clickInfo.event.remove();
    }
  };

  const handleAddEvent = (selectInfo) => {
    let title = window.prompt("Please enter a new title for your event");
    let calendarApi = selectInfo.view.calendar;

    calendarApi.unselect(); // clear date selection
    if (title) {
      setState({
        ...state,
        currentEvent: [
          ...state.currentEvent,
          {
            id: createEventId(),
            title,
            start: selectInfo.startStr,
            end: selectInfo.endStr,
            allDay: selectInfo.allDay,
            color: randomColor(),
          },
        ],
      });
    }
  };

  const handleChangeTime = (date) => {
    const calendarApi = fullCalendarRef.current.getApi();
    if (calendarApi) {
      const dataDate = Array.isArray(date) ? date[0] : date;

      const isTimeGridDay = state.view === "timeGridDay";
      const objDate = getFirstAndLastDay(new Date(dataDate), state.view);
      const fd = isTimeGridDay ? dataDate : objDate.firstDay;
      const ld = isTimeGridDay
        ? dataDate
        : getFirstAndLastDay(new Date(dataDate), state.view).lastDay;
      calendarApi.gotoDate(fd);

      setState({
        ...state,
        startDate: fd,
        endDate: ld,
        focusDate: dataDate,
      });
    }
  };

  const handleChangeView = (viewType) => {
    const typeOfView = viewType.target.value;
    fullCalendarRef.current.calendar.changeView(typeOfView);
    let fdResult;
    let ldResult;
    if (typeOfView !== "timeGridDay") {
      const objDate = getFirstAndLastDay(new Date(state.focusDate), typeOfView);

      fdResult = objDate.firstDay;
      ldResult = objDate.lastDay;
    } else {
      fdResult = state.focusDate;
      ldResult = state.focusDate;
    }
    setState({
      ...state,
      startDate: fdResult,
      endDate: ldResult,
      view: typeOfView,
    });
  };

  const handleEventReceive = (info) => {
    setState({
      ...state,
      currentEvent: [
        ...state.currentEvent,
        {
          id: createEventId(),
          title: info.draggedEl.textContent,
          start: info.date,
          allDay: !!info.allDay,
          color: randomColor(),
        },
      ],
    });
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
      setState({
        ...state,
        currentEvent: removeItemFromArr(state.currentEvent, evId),
      });
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
          <select onChange={handleChangeView} defaultValue="dayGridMonth">
            {OPTION_VIEWS.map((item, index) => (
              <option key={index} value={item.type}>
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
            selected={state.startDate}
            onChange={handleChangeTime}
            selectsRange={state.view !== "timeGridDay"}
            startDate={state.startDate}
            endDate={state.endDate}
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
          ref={fullCalendarRef}
          themeSystem="Simplex"
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          droppable
          events={state.currentEvent}
          editable
          selectable
          dayMaxEvents
          dragRevertDuration={0}
          weekends
          eventChange={handleChangeEvent}
          eventDrop={handleChangeEvent}
          eventClick={handleRemoveEvent}
          select={handleAddEvent}
          drop={handleEventReceive}
          eventDragStop={handleDragStop}
        />
      </div>
    </div>
  );
}

export default App;
