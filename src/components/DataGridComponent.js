import { Box, Card, CardHeader } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { useSelector } from "react-redux";

export default function DataGridComponent() {
  const { rows, columns } = useSelector(({ rowsReducer, columnsReducer }) => ({
    rows: rowsReducer.data,
    columns: columnsReducer.data,
  }));

  return rows?.length > 0 ? (
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
  );
}
