import { Box } from "@mui/system";
import { useSelector } from "react-redux";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Select from "@mui/material/Select";
import Button from "@mui/material/Button";
import DoneIcon from "@mui/icons-material/Done";
import WarningIcon from "@mui/icons-material/Warning";

import { useState } from "react";
import { Stack, Typography } from "@mui/material";

export default function Match() {
  const { rows, columns } = useSelector(({ rowsReducer, columnsReducer }) => ({
    rows: rowsReducer.data,
    columns: columnsReducer.data,
  }));

  const headerColumns = Object.keys(rows[0]);

  return (
    <Box
      sx={{
        mt: 3,
        "&>div:not(:first-child)": { mt: 2 },
      }}
    >
      {columns
        .filter((c) => c.headerName)
        .map((column, idx) => {
          return (
            <Box key={idx}>
              <TableComponent
                headerColumns={headerColumns}
                rows={rows}
                columns={columns}
                column={column}
                idx={idx}
              />
            </Box>
          );
        })}
    </Box>
  );
}

function TableComponent({ headerColumns, rows, columns, column, idx }) {
  const [headerColumn, setHeaderColumn] = useState("");

  console.log(column, headerColumns[idx]);

  const handleHeaderChange = (e) => {
    setHeaderColumn(e.target.value);
  };

  const handleConfirmMapping = () => {};

  const handleIgnoreColumn = () => {};

  return (
    <Stack
      direction="row"
      component={Paper}
      sx={{
        mb: 2,
        p: 2,
        alignItems: "center",
      }}
      elevation="3"
    >
      <TableContainer
        component={Paper}
        key={column.field}
        sx={{ maxWidth: 250, minWidth: 150 }}
      >
        <Table aria-label="simple table">
          <TableHead>
            <TableRow>
              <TableCell>
                <FormControl fullWidth>
                  <InputLabel id="demo-simple-select-label">
                    Matching field
                  </InputLabel>
                  <Select
                    labelId="demo-simple-select-label"
                    id="demo-simple-select"
                    value={headerColumn}
                    label="Matching field"
                    onChange={handleHeaderChange}
                  >
                    <MenuItem value="">
                      <em>None</em>
                    </MenuItem>
                    {columns
                      .filter((c) => c.headerName)
                      .map((column) => (
                        <MenuItem value={column.headerName} key={column.field}>
                          {column.headerName}
                        </MenuItem>
                      ))}
                  </Select>
                </FormControl>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((row) => (
              <TableRow
                key={row.id}
                sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
              >
                <TableCell component="th" scope="row">
                  {row[headerColumns[idx]]}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <Box sx={{ ml: 3 }}>
        <div>
          {headerColumn === column.headerName ? (
            <Typography
              variant="body2"
              sx={{
                color: "text.primary",
                display: "flex",
                alignItems: "center",
              }}
            >
              <DoneIcon sx={{ color: "success.main", mr: 1 }} /> Matched to the{" "}
              {headerColumn} field.
            </Typography>
          ) : (
            <Typography
              variant="body2"
              sx={{
                color: "text.secondary",
                display: "flex",
                alignItems: "center",
              }}
            >
              <WarningIcon sx={{ color: "warning.main", mr: 1 }} /> Unable to
              automatically match
            </Typography>
          )}
        </div>
        <Box sx={{ mt: 2 }}>
          <Button
            onClick={handleConfirmMapping}
            variant="contained"
            sx={{ mr: 1 }}
          >
            Confirm mapping
          </Button>
          <Button onClick={handleIgnoreColumn} variant="outlined">
            Ignore this column
          </Button>
        </Box>
      </Box>
    </Stack>
  );
}
