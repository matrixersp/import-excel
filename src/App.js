import { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Button, Box, Card, CardHeader } from "@mui/material";
import { styled } from "@mui/material/styles";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import XLSX from "xlsx";

import { uploadExcelData } from "./actions";

const columns: GridColDef[] = [
  { field: "id", hide: true },
  { field: "name", headerName: "Full Name", width: 150, editable: true },
  { field: "email", headerName: "Email", width: 150, editable: true },
];

const Input = styled("input")({
  display: "none",
});

function App() {
  const data = useSelector((state) => state.excelReducer.data);
  const dispatch = useDispatch();
  const [selectedFile, setSelectedFile] = useState(null);
  const [rows, setRows] = useState([]);

  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
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

  const createDataGrid = async () => {
    const data = await selectedFile.arrayBuffer();
    let workbook = XLSX.read(data);

    const names = Object.keys(workbook.Sheets);
    const selectedRows = names.map((name) =>
      XLSX.utils.sheet_to_json(workbook.Sheets[name])
    )[0];

    setRows(setRowIds(selectedRows));
  };

  const setRowIds = (rows) => {
    return rows.map((row) => ({ ...row, id: row.__rowNum__ }));
  };

  console.log(rows);

  return (
    <div className="App">
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
      {selectedFile && (
        <Box sx={{ mt: 2 }}>
          <Button variant="contained" component="span" onClick={createDataGrid}>
            Create Data Grid
          </Button>
        </Box>
      )}
      {rows?.length > 0 ? (
        <Box sx={{ mt: 2, height: 400, width: "100%" }}>
          <DataGrid
            rows={rows}
            columns={columns}
            pageSize={5}
            rowsPerPageOptions={[5]}
            checkboxSelection
            disableSelectionOnClick
          />
        </Box>
      ) : (
        <Card elevation={3} sx={{ mt: 2 }}>
          <CardHeader title="No data yet." />
        </Card>
      )}
    </div>
  );
}

export default App;
