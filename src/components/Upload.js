import React from "react";
import { Box, Button } from "@mui/material";
import { styled } from "@mui/material/styles";

const Input = styled("input")({
  display: "none",
});

export default function Upload({
  selectedFile,
  setSelectedFile,
  setSubmitted,
}) {
  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
    setSubmitted(false);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "copy";
    e.target.classList.add("dragging");
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "copy";
    e.target.classList.remove("dragging");
  };

  const handleDrop = async (e) => {
    e.stopPropagation();
    e.preventDefault();
    e.target.classList.remove("dragging");
    setSelectedFile(e.dataTransfer.files[0]);
  };

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
      }}
    >
      <Box
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        sx={{
          display: "flex",
          alignItems: "center",
          p: 2,
          minWidth: 300,
          width: "100%",
          height: 200,
          border: "3px dashed #373737",
        }}
      >
        <label htmlFor="contained-button-file" style={{ marginRight: 12 }}>
          <Input
            accept="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
            id="contained-button-file"
            type="file"
            onChange={handleFileChange}
          />
          <Button variant="contained" component="span">
            Upload File
          </Button>
        </label>
        {selectedFile
          ? `"${selectedFile?.name}" selected.`
          : "Drop an XLSX file here."}
      </Box>
    </Box>
  );
}
