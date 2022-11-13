import React from "react";
import { Dialog, Typography } from "@mui/material";
import umassDefault from "../images/umassDefault.jpg";
import { CalendarMonth, Schedule, Place } from "@mui/icons-material";

export default function EventDialog({ open, onClose, event }) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      className="EventDialog"
      sx={{ borderRadius: 1 }}
    >
      <img
        height="400"
        width={"600"}
        src={event.image && event.image.length > 0 ? event.image : umassDefault}
      ></img>
      <div className="info">
        <h1>{event.title} </h1>
        <div className="details">
          <div style={{ display: "flex" }}>
            <CalendarMonth style={{ fill: "black" }}></CalendarMonth>
            <Typography
              variant="body2"
              color="black"
              marginTop="auto"
              paddingLeft={0.5}
            >
              {event.date}
            </Typography>
          </div>
          <div style={{ display: "flex" }}>
            <Schedule style={{ fill: "black" }}></Schedule>
            <Typography
              variant="body2"
              color="black"
              marginTop="auto"
              paddingLeft={0.5}
            >
              {event.time}
            </Typography>
          </div>
          <div style={{ display: "flex" }}>
            <Place style={{ fill: "black" }}></Place>
            <Typography
              variant="body2"
              color="black"
              marginTop="auto"
              paddingLeft={0.5}
            >
              {event.location}
            </Typography>
          </div>
        </div>
      </div>
    </Dialog>
  );
}
