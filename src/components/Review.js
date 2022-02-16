import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Box, Card, CardHeader } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";

export default function Review() {
  let { gridRows, validHeaders } = useSelector(({ appReducer }) => appReducer);

  const setRowsIds = (rows) => {
    return rows.map((row) => ({ ...row, id: row.__rowNum__ }));
  };

  return gridRows?.length > 0 ? (
    <Box
      sx={{
        mt: 2,
        height: 400,
        width: "100%",
        "& .validation-error": { backgroundColor: "#d47483" },
      }}
    >
      <DataGrid
        rows={gridRows}
        columns={validHeaders}
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
  );
}
