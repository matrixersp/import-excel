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

import { useDialog } from "../hooks/useDialog";

import { useEffect, useMemo, useState } from "react";
import { Stack, Typography } from "@mui/material";
import {
  ignoreColumn,
  reconsiderColumn,
  resetIgnoredColumns,
  setHeader,
} from "../actions";
import { validationSchema } from "./validationSchema";

const hasHeader = true;

const dialogTitles = {
  FOUND_DUPLICATE_HEADERS:
    "Sorry, some columns are matched to duplicate fields",
  NO_MATCHED_HEADERS_FOUND: "Sorry, there are no matched fields",
};

export default function Match({
  backClicked,
  formId,
  handleNext,
  handleBack,
  setBackClicked,
  setNextEnabled,
}) {
  const { rows, validHeaders, headers, ignoredColumns } = useSelector(
    ({ appReducer }) => appReducer
  );
  const [dialogTitle, setDialogTitle] = useState("");
  const {
    handleClose: handleCloseBack,
    handleClickOpen: handleClickOpenBack,
    AlertDialog: BackDialog,
  } = useDialog();
  const { handleClickOpen: handleClickOpenNext, AlertDialog: NextDialog } =
    useDialog();
  const dispatch = useDispatch();

  useEffect(() => {
    if (backClicked) {
      handleClickOpenBack();
      setBackClicked(false);
    }
  }, [backClicked]);

  const nonIgnoredHeaders = useMemo(() => {
    return headers.filter((h) => !ignoredColumns.includes(h.label));
  }, [headers, ignoredColumns]);

  const foundDuplicates = () => {
    const headerNames = nonIgnoredHeaders
      .map((h) => h.headerName)
      .filter((h) => h);
    const uniqueHeaderNames = new Set(headerNames);
    return uniqueHeaderNames.size !== headerNames.length;
  };

  const foundMatchedHeaders = () => {
    return nonIgnoredHeaders.filter((h) => h.headerName).length > 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (foundDuplicates()) {
      setDialogTitle(dialogTitles.FOUND_DUPLICATE_HEADERS);
      handleClickOpenNext();
    } else if (!foundMatchedHeaders()) {
      setDialogTitle(dialogTitles.NO_MATCHED_HEADERS_FOUND);
      handleClickOpenNext();
    } else handleNext();
  };

  const handleConfirmBack = () => {
    dispatch(resetIgnoredColumns([]));
    setNextEnabled(false);
    handleCloseBack();
    handleBack();
  };

  return (
    <Box
      sx={{
        m: 2,
        mt: 3,
        "&>:not(:first-of-type)": { mt: 2 },
      }}
      component="form"
      id={formId}
      onSubmit={handleSubmit}
    >
      {headers.map((header, idx) => {
        return (
          <Box key={idx}>
            <TableComponent
              rows={hasHeader ? rows.slice(1) : rows}
              validHeaders={validHeaders}
              columnLabel={header.label}
              headerName={header.headerName}
              ignoredColumns={ignoredColumns}
              idx={idx}
              validationSchema={validationSchema}
              headers={headers}
            />
          </Box>
        );
      })}
      <BackDialog
        title={
          "Are you sure you want to clear all changes to data in progress in this stage?"
        }
      >
        <Button onClick={handleCloseBack} variant="outlined" autoFocus>
          Cancel
        </Button>
        <Button onClick={handleConfirmBack} variant="contained">
          Confirm
        </Button>
      </BackDialog>
      <NextDialog title={dialogTitle} />
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
    const result = fieldRows.map((row) => {
      if (!headerField) return false;
      const fieldToValidate = { [headerField]: row[columnLabel] };
      try {
        validationSchema.validateSyncAt(headerField, fieldToValidate);
        return true;
      } catch (err) {
        return false;
      }
    });

    let nonValidRowsCount = result.filter((isValidRow) => !isValidRow).length;
    const nonValidRowsRatio = (nonValidRowsCount * 100) / fieldRows.length;
    setNonValidRowsRatio(Math.round(nonValidRowsRatio * 10) / 10);
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
      (header) => !ignoredColumns.includes(header.label)
    );
    return (
      filtered.filter((h) => h.headerName === currentHeaderName).length > 1
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
