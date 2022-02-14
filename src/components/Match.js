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
import InfoIcon from "@mui/icons-material/Info";
import WarningIcon from "@mui/icons-material/Warning";

import { useEffect, useState, useMemo } from "react";
import { Stack, Typography } from "@mui/material";

const hasHeader = true;

export default function Match({ validationSchema }) {
  const { rows, columns } = useSelector(({ rowsReducer, columnsReducer }) => ({
    rows: rowsReducer.data,
    columns: columnsReducer.data,
  }));

  const headerFields = Object.values(rows[0]);
  const columnLabels = Object.keys(rows[0]);

  const setRowsIds = (rows) => {
    return rows.map((row) => ({ ...row, id: row.__rowNum__ }));
  };

  return (
    <Box
      sx={{
        m: 2,
        mt: 3,
        "&>:not(:first-of-type)": { mt: 2 },
      }}
    >
      {headerFields.map((headerField, idx) => {
        return (
          <Box key={idx}>
            <TableComponent
              rows={hasHeader ? rows.slice(1) : rows}
              columns={columns}
              headerFields={headerFields}
              headerField={headerField}
              columnLabel={columnLabels[idx]}
              idx={idx}
              validationSchema={validationSchema}
            />
          </Box>
        );
      })}
    </Box>
  );
}

function TableComponent({
  rows,
  columns,
  headerFields,
  headerField,
  columnLabel,
  idx,
  validationSchema,
}) {
  const [currentHeaderField, setCurrentHeaderField] = useState(
    headerField || ""
  );
  const [validationErrors, setValidationErrors] = useState([]);
  const [emptyRowsRatio, setEmptyRowsRatio] = useState(0);
  const [nonValidRowsRatio, setNonValidRowsRatio] = useState(0);

  useEffect(() => {
    validateRowsByField(currentHeaderField, rows);
    computeEmptyRowsRatio();
  }, []);

  useEffect(() => {
    // console.log(headerName, currentHeaderField, columns);
    validateRowsByField(currentHeaderField, rows);
  }, [currentHeaderField]);

  const handleHeaderChange = (e) => {
    const value = e.target.value;
    setCurrentHeaderField(value);
  };

  const validateRowsByField = (headerColumn, fieldRows) => {
    setValidationErrors([]);

    const validRows = fieldRows.map(async (row) => {
      const rowToValidate = { [headerColumn]: row[columnLabel] };
      try {
        await validationSchema.validateAt(headerColumn, rowToValidate);
        return true;
      } catch (err) {
        setValidationErrors((validationErrors) => [...validationErrors, err]);
        return false;
      }
    });

    Promise.all(validRows).then((result) => {
      let nonValidRowsCount = result.filter((isValidRow) => !isValidRow).length;
      const nonValidRowsRatio = (nonValidRowsCount * 100) / fieldRows.length;
      setNonValidRowsRatio(Math.round(nonValidRowsRatio * 10) / 10);
    });
  };

  const computeEmptyRowsRatio = () => {
    const filledRowsCount = rows.filter((row) => row[columnLabel]).length;
    const emptyRowsRatio = (filledRowsCount * 100) / rows.length;
    setEmptyRowsRatio(Math.round(emptyRowsRatio * 10) / 10);
  };

  const handleConfirmMapping = () => {};

  const handleIgnoreColumn = () => {};

  let headerName = useMemo(
    () => columns.find((c) => c.field === currentHeaderField)?.headerName,
    [currentHeaderField]
  );

  return (
    <Stack
      direction="row"
      component={Paper}
      sx={{
        mb: 2,
        p: 2,
        alignItems: "center",
      }}
      elevation={3}
    >
      <TableContainer
        component={Paper}
        key={currentHeaderField}
        sx={{ maxWidth: 260, minWidth: 260 }}
      >
        <Table aria-label="simple table">
          <TableHead>
            <TableRow>
              <TableCell>{columnLabel}</TableCell>
              <TableCell>
                <FormControl fullWidth>
                  <InputLabel id="demo-simple-select-label">
                    Matching field
                  </InputLabel>
                  <Select
                    labelId="demo-simple-select-label"
                    id="demo-simple-select"
                    value={currentHeaderField}
                    label="Matching field"
                    onChange={handleHeaderChange}
                  >
                    <MenuItem value="">
                      <em>None</em>
                    </MenuItem>
                    {columns
                      .filter((c) => c.headerName)
                      .map((column) => (
                        <MenuItem value={column.field} key={column.field}>
                          {column.headerName}
                        </MenuItem>
                      ))}
                  </Select>
                </FormControl>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.slice(0, 3).map((row, idx) => {
              return (
                <TableRow
                  key={idx}
                  sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                >
                  <TableCell width={20}>{idx + hasHeader ? 2 : 1}</TableCell>
                  {row[columnLabel] ? (
                    <TableCell>{row[columnLabel]}</TableCell>
                  ) : (
                    <TableCell sx={{ bgcolor: "#f1f1f1" }}>
                      <em>No Data</em>
                    </TableCell>
                  )}
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
      <Box sx={{ ml: 4 }}>
        <Box
          sx={{
            "&>:not(:first-of-type)": {
              mt: 1,
            },
          }}
        >
          {headerName ? (
            <Typography
              variant="body2"
              sx={{
                color: "text.primary",
                display: "flex",
                alignItems: "center",
              }}
            >
              <DoneIcon sx={{ color: "success.main", mr: 1 }} /> Matched to the{" "}
              {headerName} field.
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
          <Typography
            variant="body2"
            sx={{
              color: "text.secondary",
              display: "flex",
              alignItems: "center",
            }}
          >
            <InfoIcon sx={{ color: "text.secondary", mr: 1 }} />
            {emptyRowsRatio}% of your rows have a value for this column
          </Typography>

          {headerName &&
            (nonValidRowsRatio === 0 ? (
              <Typography
                variant="body2"
                sx={{
                  color: "text.primary",
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <DoneIcon sx={{ color: "success.main", mr: 1 }} />
                All values pass validation for this field.
              </Typography>
            ) : (
              <Typography
                variant="body2"
                sx={{
                  color: "text.primary",
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <WarningIcon sx={{ color: "warning.main", mr: 1 }} />
                {nonValidRowsRatio}% of your rows fail validation (repair on
                next step).
              </Typography>
            ))}
        </Box>
        <Box sx={{ mt: 3 }}>
          <Button
            onClick={handleConfirmMapping}
            variant="contained"
            sx={{ mr: 1 }}
            size="small"
          >
            Confirm mapping
          </Button>
          <Button onClick={handleIgnoreColumn} variant="outlined" size="small">
            Ignore this column
          </Button>
        </Box>
      </Box>
    </Stack>
  );
}
