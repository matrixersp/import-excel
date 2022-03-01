import { useState, useEffect } from "react";
import { Stack, Box, Divider, Button, Typography } from "@mui/material";
import { styled } from "@mui/material/styles";
import * as XLSX from "xlsx";
import { useDispatch, useSelector } from "react-redux";
import { setRows, setHeaders, setIgnoredColumns } from "../actions/index";
import { useDialog } from "../hooks/useDialog";

const Input = styled("input")({
  display: "none",
});

const dialogTitles = {
  NO_ROWS_FOUND: "No rows found",
  NO_MATCHED_HEADERS_FOUND: "Sorry, there are no matched fields",
};

export default function Upload({ formId, handleNext, setNextEnabled }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const validHeaders = useSelector(({ appReducer }) => appReducer.validHeaders);
  const dispatch = useDispatch();
  const { handleClickOpen, AlertDialog } = useDialog();
  const [dialogTitle, setDialogTitle] = useState("");

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

  const handleDrop = (e) => {
    e.stopPropagation();
    e.preventDefault();
    e.target.classList.remove("dragging");
    setSelectedFile(e.dataTransfer.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = await selectedFile.arrayBuffer();
    let workbook = XLSX.read(data);

    const sheetName = Object.keys(workbook.Sheets)[0];
    const selectedRows = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], {
      header: "A",
      defval: "",
    });

    if (selectedRows.length <= 1) {
      setDialogTitle(dialogTitles.NO_ROWS_FOUND);
      handleClickOpen();
    } else {
      dispatch(setRows(selectedRows));
      const headers = getHeaders(selectedRows[0]);
      dispatch(setHeaders(headers));
      const ignoredColumns = getIgnoredColumns(headers);
      dispatch(setIgnoredColumns(ignoredColumns));
      handleNext();
    }
  };

  const getHeaders = (headersRow) => {
    return Object.entries(headersRow).reduce(
      (acc, cur) =>
        acc.concat({
          label: cur[0],
          headerName: headerNameExists(cur[1]) ? cur[1] : "",
        }),
      []
    );
  };

  const headerNameExists = (headerName) => {
    return validHeaders.some(
      (validHeader) => validHeader.headerName === headerName
    );
  };

  const getIgnoredColumns = (headers) => {
    let headersCount = {};
    let ignoredColumns = [];
    headers.forEach((h) => {
      headersCount[h.headerName] = ++headersCount[h.headerName] || 1;
      const header = validHeaders.find((v) => v.headerName === h.headerName);
      if (header && headersCount[h.headerName] > 1)
        ignoredColumns.push(h.label);
    });

    return ignoredColumns;
  };

  useEffect(() => {
    if (selectedFile) setNextEnabled(true);
  }, [selectedFile, setNextEnabled]);

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        m: 2,
        mt: 3,
      }}
      component="form"
      id={formId}
      onSubmit={handleSubmit}
    >
      <Stack
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        direction="row"
        divider={<Divider orientation="vertical" flexItem sx={{ mx: 2.25 }} />}
        sx={{
          alignItems: "center",
          p: 4,
          minWidth: 300,
          minHeight: 180,
          border: "3px dashed #bdbebf",
        }}
      >
        <Box sx={{ flex: "1 0 30%" }}>
          <label htmlFor="contained-button-file" style={{ marginRight: 12 }}>
            <Input
              accept=".csv, text/plain, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
              id="contained-button-file"
              type="file"
              onChange={handleFileChange}
            />
            <Button
              variant="contained"
              component="span"
              sx={{ textTransform: "initial" }}
            >
              Upload data from file
            </Button>
          </label>
          <Typography variant="body2" sx={{ color: "text.primary", mt: 1.25 }}>
            {selectedFile
              ? `"${selectedFile?.name}" selected.`
              : ".csv, .tsv, .txt spreadsheets accepted."}
          </Typography>
        </Box>
        <Box sx={{ flex: "1 0 65%" }}>
          <Typography
            variant="body2"
            sx={{ color: "text.secondary", textAlign: "justify" }}
          >
            You can upload any .csv, .tsv, .txt file with any set of columns as
            long as it has 1 record per row. The next step will allow you to
            match your spreadsheet columns to the right data points. You'll be
            able to clean up or remove any corrupted data before finalizing your
            report.
          </Typography>
        </Box>
      </Stack>
      <AlertDialog title={dialogTitle} />
    </Box>
  );
}
