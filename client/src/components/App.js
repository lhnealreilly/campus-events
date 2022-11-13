import React, { useState, useEffect } from "react";
import EventList from "./EventList";
import "./EventList.css";
import Search from "./Search";
import "./Search.css";
import "./App.css";
import { Typography } from "@mui/material";
import logo from "../images/CampusEvents_logo.png";

const eventTest = () => {
  let events = [];

  for (let i = 0; i < 10; ++i) {
    events.push({
      image: "",
      location: "ILC 220",
      date: "November 16th",
      title: "Campus Atlas Launch Party!",
      time: "7:00pm",
      organization: "Campus Atlas Team",
      description:
        "Azmat Khan is a Pulitzer-prize winning investigative reporter for the New York Times Magazine and a journalism professor at Columbia University. Khan’s investigations have exposed myths of war, while illuminating the human toll, prompting widespread policy impact from Washington to Kabul. She is currently writing a book on the history of America’s air wars. This lecture launches the Ellsberg Initiative for Peace and Democracy, a new UMass initiative offering popular education and promoting organizing around some of the most critical issues of our day. This is part of the Feinberg Family Distinguished Lecture series, Confronting Histories of U.S. Imperialism and will be open to the public. ",
    });
  }
  return events;
};

export default function App() {
  const [events, setEvents] = useState([]);

  useEffect(() => {
    async function fetchEvents() {
      let res = await fetch("https://localhost:3000/recommended");
      if (res.ok) {
        setEvents(await res.json());
      }
    }
    fetchEvents();
  }, []);

  async function setSearchQuery(query) {
    let res = await fetch(`https://localhost:3000/query/${query}`);
    if (res.ok) {
      setEvents(await res.json());
    }
  }

  return (
    <div>
      <div className="header">
        <Search setSearchQuery={setSearchQuery}></Search>
        <img id="logo" src={logo}></img>
      </div>
      <div className="eventContainer">
        <Typography variant="h4">Recommended</Typography>
        <EventList
          events={events.length == 0 ? eventTest() : events}
        ></EventList>
      </div>
    </div>
  );
}
