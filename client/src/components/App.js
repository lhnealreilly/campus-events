import React from 'react';
import EventList from './EventList';
import "./EventList.css"

let events = [];

for(let i = 0; i < 10; ++i){
  events.push({image: "", location: "ILC 220", date: "November 16th", title:"Campus Atlas Launch Party!", time: "7:00pm"})
}

export default function App() {
  return (
      <EventList events={events}></EventList>
  );
}
