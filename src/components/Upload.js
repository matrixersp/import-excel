import React, { useEffect } from "react";
import { Box, Button } from "@mui/material";
import { styled } from "@mui/material/styles";
import XLSX from "xlsx";
import { useDispatch } from "react-redux";
import { setRows } from "../actions/index";

const Input = styled("input")({
  display: "none",
});

export default function Upload({
  selectedFile,
  setSelectedFile,
  setSubmitted,
}) {
  const dispatch = useDispatch();

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

  const submit = async () => {
    const data = await selectedFile.arrayBuffer();
    let workbook = XLSX.read(data);

    const names = Object.keys(workbook.Sheets);
    const selectedRows = names.map((name) =>
      XLSX.utils.sheet_to_json(workbook.Sheets[name])
    )[0];

    const rowsWithIds = setRowsIds(selectedRows);
    dispatch(setRows(rowsWithIds));

    setSubmitted(true);
  };

  useEffect(() => {
    if (selectedFile) submit();
  }, [selectedFile]);

  const setRowsIds = (rows) => {
    return rows.map((row) => ({ ...row, id: row.__rowNum__ }));
  };

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        mt: 3,
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
          border: "3px dashed #bdbebf",
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
