import React from "react";
import { TextField, IconButton } from "@mui/material";
import { Search } from "@mui/icons-material";

export default function SearchBar({ setSearchQuery }) {
  return (
    <form className="SearchBar">
      <TextField
        id="search-bar"
        className="text"
        onInput={(e) => {
          setSearchQuery(e.target.value);
        }}
        label="Enter an event name"
        variant="outlined"
        placeholder="Search..."
        size="small"
      />
      <IconButton aria-label="search">
        <Search style={{ fill: "#600000" }} />
      </IconButton>
    </form>
  );
}
