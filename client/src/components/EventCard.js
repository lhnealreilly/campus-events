import {Card, CardMedia, CardContent, Typography, Box} from "@mui/material";
import {CalendarMonth, Place, Group} from "@mui/icons-material";
import React, {useState} from 'react'
import umassDefault from "../images/umassDefault.jpg"
import EventDialog from "./EventDialog";
import "./EventDialog.css"


export default function EventCard({event}) {
  const [elevation, setElevation] = useState(3);
  const [open, setOpen] = useState(false);

  const elevate = () => {
    setElevation(8);
  }

  const unelevate = () => {
    setElevation(3)
  }

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <div>
    <Card className="EventCard" sx={{ maxWidth: 345, borderRadius: 3, boxShadow: elevation}} onMouseEnter={elevate} onMouseLeave={unelevate} onClick={() => handleClickOpen()}>
      <Box sx={{ position: 'relative' }}>
      <CardMedia
        component="img"
        height="400"
        image={event.image && event.image.length > 0 ? event.image : umassDefault}
      />
      <Box className="overlay" sx={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        width: '100%',
        color: 'white',
      }}>
      <CardContent>
        <Typography gutterBottom variant="h5" component="div" color={"white"}>
          {event.title}
        </Typography>
        <div style={{display: "flex"}}>
          <CalendarMonth style={{fill: "white"}}></CalendarMonth>
          <Typography variant="body2" color="white" marginTop="auto" paddingLeft={.5}>
            {`${event.date}, ${event.time}`}
          </Typography>
        </div> 
        <div style={{display: "flex", marginTop: 5}}>
          <Place style={{fill: "white"}}></Place> 
          <Typography variant="body2" color="white" marginTop="auto" paddingLeft={.5}>
            {event.location}
          </Typography>
        </div>
        <div style={{display: "flex", marginTop: 5}}>
          <Group style={{fill: "white"}}></Group> 
          <Typography variant="body2" color="white" marginTop="auto" paddingLeft={.5}>
            {event.organization}
          </Typography>
        </div>  
      </CardContent>
      </Box>
      </Box>
    </Card>
    <EventDialog open={open} onClose={handleClose} event={event}/>
    </div>
  )
}
