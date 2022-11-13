import React, { useState, useEffect } from "react";
import EventList from "./EventList";
import "./EventList.css";
import Search from "./Search";
import "./Search.css";
import "./App.css";
import { Typography } from "@mui/material";
import logo from "../images/CampusEvents_logo.png";

const userID = 1;

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

  async function fetchEvents() {
    let res = await fetch(`http://localhost:3000/recommended/${userID}`);
    if (res.ok) {
      let json = await res.json();
      console.log(json);
      let convertedJson = json.map(obj => ({...obj, image: obj.url, description: obj.description, title: obj.eventName, organization: obj.organizationName, location: (obj.location.name || ""), date: (new Date(obj.startTime)).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }), time: (new Date(obj.startTime)).toLocaleTimeString('en-US').replace(/(.*)\D\d+/, '$1')}))
      setEvents(convertedJson);
    }
  }

  useEffect(() => {
    fetchEvents();
  }, [])
  

  async function setSearchQuery(query) {
    if(query.length == 0){fetchEvents()}
    let res = await fetch(`http://localhost:3000/query/${query}`);
    if (res.ok) {
      let json = await res.json();
      let convertedJson = json.map(obj => ({image: obj.url, description: obj.description, title: obj.eventName, organization: obj.organizationName, location: (obj.location.name || ""), date: (new Date(obj.startTime)).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }), time: (new Date(obj.startTime)).toLocaleTimeString('en-US').replace(/(.*)\D\d+/, '$1')}))
      setEvents(convertedJson);
    }
  }

  return (
    <div>
      <div className="header">
        <img id="logo" src={logo}></img>
        <Search setSearchQuery={setSearchQuery}></Search>
      </div>
      <div className="eventContainer">
        <Typography variant="h4">Recommended Events</Typography>
        <EventList
          events={events.length == 0 ? [] : events}
        ></EventList>
      </div>
    </div>
  );
}
