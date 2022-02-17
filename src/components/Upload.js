import { useState, useEffect } from "react";
import { Stack, Box, Divider, Button, Typography } from "@mui/material";
import { styled } from "@mui/material/styles";
import XLSX from "xlsx";
import { useDispatch } from "react-redux";
import { setRows } from "../actions/index";

import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";

const Input = styled("input")({
  display: "none",
});

export default function Upload({
  canGoNext,
  canGoBack,
  nextAction,
  nextDialogProps,
}) {
  const [selectedFile, setSelectedFile] = useState(null);
  const dispatch = useDispatch();

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

  const submit = async () => {
    const data = await selectedFile.arrayBuffer();
    let workbook = XLSX.read(data);

    const sheetName = Object.keys(workbook.Sheets)[0];
    const selectedRows = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], {
      header: "A",
      defval: "",
    });

    dispatch(setRows(selectedRows));
  };

  useEffect(() => {
    if (canGoNext)
      nextAction(async () => {
        if (!selectedFile) {
          nextDialogProps.handleClickOpenNext();
          return false;
        } else {
          await submit();
          return true;
        }
      });
  }, [canGoNext]);

  // useEffect(() => {
  //   if (canGoBack) nextAction(async () => await dispatch(reset()));
  // }, [canGoBack]);

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        m: 2,
        mt: 3,
      }}
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
      <NextDialog
        open={nextDialogProps.openNext}
        onClose={nextDialogProps.handleCloseNext}
      />
    </Box>
  );
}

function NextDialog({ open, onClose }) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
    >
      <DialogTitle id="alert-dialog-title">
        {"Please upload a .csv, .tsv or .txt file then click next."}
      </DialogTitle>
      <DialogActions>
        <Button onClick={onClose} variant="contained" autoFocus>
          Ok
        </Button>
      </DialogActions>
    </Dialog>
  );
}
