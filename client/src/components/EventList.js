import React from 'react'
import EventCard from "./EventCard"
import "./EventCard.css"

export default function EventList({events}) {
  return (
    <div className='EventList'>
        {events.map((e,i) => <EventCard event={e} key={i}></EventCard>)}
        
    </div>
  )
}
