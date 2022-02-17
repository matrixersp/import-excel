import { Box } from "@mui/system";
import { useDispatch, useSelector } from "react-redux";
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
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";

import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";

import { useEffect, useState } from "react";
import { Stack, Typography } from "@mui/material";
import {
  ignoreColumn,
  reconsiderColumn,
  setHeader,
  setGridRows,
  setGridColumns,
  setErrors,
} from "../actions";
import { store } from "../store";
import * as yup from "yup";

const hasHeader = true;

export const validationSchema = yup.object().shape({
  id: yup.number().min(1),
  name: yup
    .string()
    .trim()
    .matches(
      /(^[A-Za-z]{3,16})([ ]{0,1})([A-Za-z]{3,16})?([ ]{0,1})?([A-Za-z]{3,16})?([ ]{0,1})?([A-Za-z]{3,16})/,
      "Full name is not valid"
    )
    .required(),
  email: yup.string().trim().email().required(),
});

export default function Match({
  canGoNext,
  canGoBack,
  nextAction,
  backDialogProps,
}) {
  const { rows, validHeaders, ignoredColumns } = useSelector(
    ({ appReducer }) => appReducer
  );
  const dispatch = useDispatch();

  useEffect(() => {
    if (canGoNext)
      nextAction(async () => {
        const { rows, validHeaders, ignoredColumns } =
          store.getState().appReducer;

        const rowsWithHeaders = getRowsWithHeaders(
          rows,
          validHeaders,
          ignoredColumns
        );
        const gridColumns = getValidHeaders(rowsWithHeaders[0], validHeaders);
        dispatch(setGridRows(rowsWithHeaders));
        dispatch(setGridColumns(gridColumns));
        return true;
      });
  }, [canGoNext]);

  useEffect(() => {
    if (canGoBack)
      nextAction(async () => {
        backDialogProps.handleClickOpenBack();
      });
  }, [canGoBack]);

  const headers = Object.entries(rows[0]);

  return (
    <Box
      sx={{
        m: 2,
        mt: 3,
        "&>:not(:first-of-type)": { mt: 2 },
      }}
    >
      {headers.map((header, idx) => {
        return (
          <Box key={idx}>
            <TableComponent
              rows={hasHeader ? rows.slice(1) : rows}
              validHeaders={validHeaders}
              columnLabel={header[0]}
              headerName={header[1]}
              ignoredColumns={ignoredColumns}
              idx={idx}
              validationSchema={validationSchema}
              headers={headers}
            />
          </Box>
        );
      })}
      <BackDialog
        open={backDialogProps.openBack}
        onClose={backDialogProps.handleCloseBack}
      />
    </Box>
  );
}

function TableComponent({
  rows,
  validHeaders,
  headerName,
  columnLabel,
  ignoredColumns,
  idx,
  headers,
}) {
  const [currentHeaderName, setCurrentHeaderField] = useState(headerName || "");
  // const [validationErrors, setValidationErrors] = useState([]);
  const [emptyRowsRatio, setEmptyRowsRatio] = useState(0);
  const [nonValidRowsRatio, setNonValidRowsRatio] = useState(0);
  const isIgnoredColumn = ignoredColumns.includes(columnLabel);
  const [isEditing, setIsEditing] = useState(!isIgnoredColumn);
  const dispatch = useDispatch();

  useEffect(() => {
    let headerField = getHeaderField();
    validateRowsByField(headerField, rows);
    computeEmptyRowsRatio();
  }, []);

  useEffect(() => {
    let headerField = getHeaderField();
    validateRowsByField(headerField, rows);
  }, [currentHeaderName]);

  const getHeaderField = () => {
    return validHeaders.find(
      (header) => header.headerName === currentHeaderName
    )?.field;
  };

  const handleHeaderChange = (e) => {
    const value = e.target.value;
    setCurrentHeaderField(value);

    dispatch(setHeader(value, columnLabel));
  };

  const validateRowsByField = (headerField, fieldRows) => {
    const validRows = fieldRows.map(async (row) => {
      if (!headerField) return false;
      const fieldToValidate = { [headerField]: row[columnLabel] };
      try {
        await validationSchema.validateAt(headerField, fieldToValidate);
        return null;
      } catch (err) {
        // setValidationErrors((validationErrors) => [...validationErrors, err]);
        return err;
      }
    });

    Promise.all(validRows).then((result) => {
      dispatch(setErrors(columnLabel, result));
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

  const handleConfirmMapping = () => {
    setIsEditing(false);
  };

  const handleIgnoreColumn = () => {
    !isIgnoredColumn && dispatch(ignoreColumn(columnLabel));
    setIsEditing(false);
  };

  const handleEditColumn = () => {
    isIgnoredColumn && dispatch(reconsiderColumn(columnLabel));
    setIsEditing(true);
  };

  const isDuplicateHeaderName = () => {
    const filtered = headers.filter(
      (header) => !ignoredColumns.includes(header[0])
    );
    return (
      filtered.filter((header) => header[1] === currentHeaderName).length > 1
    );
  };

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
      {!isEditing ? (
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            width: "100%",
          }}
        >
          <Stack direction="row">
            <Typography
              sx={{
                border: "1px solid #e1e1e1",
                py: 0.5,
                px: 1.5,
                minWidth: 180,
                color: "text.secondary",
              }}
            >
              {columnLabel}
              <span style={{ marginLeft: 24 }}>{headerName}</span>
            </Typography>
            <Typography sx={{ display: "flex", alignItems: "center", ml: 2 }}>
              {isIgnoredColumn ? (
                <>
                  <VisibilityOffIcon sx={{ color: "text.primary", mr: 1 }} />
                  Ignored
                </>
              ) : (
                <>
                  <DoneIcon sx={{ color: "success.main", mr: 1 }} />
                  Confirmed mapping
                </>
              )}
            </Typography>
          </Stack>
          <Button
            onClick={handleEditColumn}
            variant="contained"
            color="secondary"
            size="small"
          >
            Edit
          </Button>
        </Box>
      ) : (
        <>
          <TableContainer
            component={Paper}
            key={currentHeaderName}
            sx={{ width: 260 }}
          >
            <Table aria-label="simple table">
              <TableHead>
                <TableRow sx={{ "&>th": { pb: 1.5 } }}>
                  <TableCell>{columnLabel}</TableCell>
                  <TableCell>
                    <FormControl fullWidth>
                      <InputLabel id="demo-simple-select-label">
                        Matching field
                      </InputLabel>
                      <Select
                        labelId="demo-simple-select-label"
                        id="demo-simple-select"
                        value={currentHeaderName}
                        name={columnLabel}
                        label="Matching field"
                        onChange={handleHeaderChange}
                      >
                        <MenuItem value="">
                          <em>None</em>
                        </MenuItem>
                        {validHeaders
                          .filter((c) => c.headerName)
                          .map((column) => (
                            <MenuItem
                              value={column.headerName}
                              key={column.field}
                            >
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
                      <TableCell width={20}>
                        {idx + (hasHeader ? 2 : 1)}
                      </TableCell>
                      {row[columnLabel] ? (
                        <TableCell>{row[columnLabel]}</TableCell>
                      ) : (
                        <TableCell sx={{ bgcolor: "grey.100" }}>
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
                  <DoneIcon sx={{ color: "success.main", mr: 1 }} /> Matched to
                  the {headerName} field.
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
                  <WarningIcon sx={{ color: "warning.light", mr: 1 }} /> Unable
                  to automatically match
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
                <InfoIcon sx={{ color: "grey.500", mr: 1 }} />
                {emptyRowsRatio}% of your rows have a value for this column
              </Typography>

              {headerName &&
                (nonValidRowsRatio === 0 ? (
                  <Typography
                    variant="body2"
                    sx={{
                      color: "text.secondary",
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
                      color: "text.secondary",
                      display: "flex",
                      alignItems: "center",
                    }}
                  >
                    <WarningIcon sx={{ color: "warning.light", mr: 1 }} />
                    {nonValidRowsRatio}% of your rows fail validation (repair on
                    next step).
                  </Typography>
                ))}
              {headerName && isDuplicateHeaderName() && (
                <Typography
                  variant="body2"
                  sx={{
                    color: "text.secondary",
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  <WarningIcon sx={{ color: "warning.light", mr: 1 }} />
                  {headerName} has already been matched.
                </Typography>
              )}
            </Box>
            <Box sx={{ mt: 3 }}>
              {headerName && (
                <Button
                  onClick={handleConfirmMapping}
                  variant="contained"
                  sx={{ mr: 1 }}
                  size="small"
                  disabled={isDuplicateHeaderName()}
                >
                  Confirm mapping
                </Button>
              )}
              <Button
                onClick={handleIgnoreColumn}
                variant="outlined"
                size="small"
              >
                Ignore this column
              </Button>
            </Box>
          </Box>
        </>
      )}
    </Stack>
  );
}

function BackDialog({ open, onClose }) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
    >
      <DialogTitle id="alert-dialog-title">
        {
          "Are you sure you want to clear all changes to data in progress in this stage?"
        }
      </DialogTitle>
      <DialogActions>
        <Button onClick={onClose} variant="outlined">
          No
        </Button>
        <Button onClick={onClose} variant="contained" autoFocus>
          Yes
        </Button>
      </DialogActions>
    </Dialog>
  );
}

const getRowsWithHeaders = (rows, validHeaders, ignoredColumns) => {
  let headers = Object.entries(rows[0]);
  let headersWithFields = [];

  headers.forEach((header) => {
    let [label, headerName] = header;

    if (!ignoredColumns.includes(label)) {
      let field = validHeaders.find((v) => v.headerName === header[1])?.field;
      headersWithFields.push({ label, field, headerName });
    }
  });

  return rows.slice(1).map((row) => {
    let newRow = { id: row.__rowNum__ };
    let headersCount = {};
    headersWithFields.forEach((header) => {
      headersCount[header.field] = headersCount[header.field]
        ? ++headersCount[header.field]
        : 1;

      const count = headersCount[header.field];
      if (count > 1) newRow[header.field + "__" + count] = row[header.label];
      else newRow[header.field] = row[header.label];
    });
    return newRow;
  });
};

const getValidHeaders = (headersRow, validHeaders) => {
  const headers = Object.keys(headersRow);
  const idx = headers.indexOf("id");
  if (idx !== -1) headers.splice(idx, 1);

  // TODO set cellClassName here
  let newValidHeaders = [...validHeaders];
  headers.map((header) => {
    const idx = validHeaders.findIndex(
      (v) =>
        header.split(/__\d$/).length > 1 && v.field === header.split(/__\d$/)[0]
    );
    if (idx !== -1)
      newValidHeaders.push({
        field: header,
        headerName: validHeaders[idx].headerName,
        editable: true,
      });
  });
  return newValidHeaders;
};