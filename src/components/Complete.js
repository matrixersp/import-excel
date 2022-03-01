import React, { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { Box, Card, CardHeader, Button, Typography } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { useDialog } from "../hooks/useDialog";

const DEFAULT_PAGE_SIZE = 10;

export default function Complete({ backClicked, handleBack, setBackClicked }) {
  let { gridRows, gridColumns } = useSelector(({ appReducer }) => appReducer);
  const { handleClose, handleClickOpen, AlertDialog: BackDialog } = useDialog();
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);

  useEffect(() => {
    if (backClicked) {
      handleClickOpen();
      setBackClicked();
    }
  }, [backClicked, handleClickOpen, setBackClicked]);

  const handleConfirm = () => {
    handleClose();
    handleBack();
  };

  const getGridColumns = useMemo(
    () =>
      gridColumns.map((column) => ({
        ...column,
        editable: false,
        renderCell: (params) => {
          if (params.field === "id")
            return (
              <Typography
                component="span"
                align="center"
                sx={{ width: "100%" }}
              >
                {params.value}
              </Typography>
            );
        },
      })),
    [gridColumns]
  );
  console.log(gridRows);

  return gridRows ? (
    <Box
      sx={{
        m: 2,
        mt: 3,
        height: 525,
        "& .validation-error": {
          backgroundColor: "error.light",
          color: "common.white",
        },
      }}
    >
      <DataGrid
        rows={gridRows}
        columns={getGridColumns}
        pageSize={pageSize}
        rowsPerPageOptions={[10, 25, 50]}
        onPageSizeChange={(size) => setPageSize(size)}
        rowHeight={40}
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
