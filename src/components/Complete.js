import React, { useEffect, useMemo } from "react";
import { useDialog } from "../hooks/useDialog";
import { Box, Card, CardHeader, Button } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { useSelector } from "react-redux";

export default function Complete({ canGoBack, backAction }) {
  let { gridRows, gridColumns } = useSelector(({ appReducer }) => appReducer);
  const { handleClose, handleClickOpen, AlertDialog: BackDialog } = useDialog();

  useEffect(() => {
    if (canGoBack) backAction(handleClickOpen);
  }, [canGoBack]);

  const handleConfirm = () => {
    handleClose();
    backAction(() => true);
  };

  const getGridColumns = useMemo(
    () => gridColumns.map((column) => ({ ...column, editable: false })),
    [gridColumns]
  );
  console.log(gridRows);

  return gridRows ? (
    <Box
      sx={{
        m: 2,
        mt: 3,
        height: 400,
        "& .validation-error": {
          backgroundColor: "error.light",
          color: "common.white",
        },
      }}
    >
      <DataGrid
        rows={gridRows}
        columns={getGridColumns}
        pageSize={10}
        rowsPerPageOptions={[10, 25, 50]}
        rowHeight={40}
        checkboxSelection
        disableSelectionOnClick
      />
      <BackDialog
        title={
          "Are you sure you want to clear all changes to data in progress in this stage?"
        }
      >
        <Button onClick={handleClose} variant="outlined">
          Cancel
        </Button>
        <Button onClick={handleConfirm} variant="contained">
          Confirm
        </Button>
      </BackDialog>
    </Box>
  ) : (
    <Card elevation={3} sx={{ mt: 2 }}>
      <CardHeader title="No data yet." />
    </Card>
  );
}
