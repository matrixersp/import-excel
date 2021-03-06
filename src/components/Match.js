import { useCallback, useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Stack,
  Typography,
  Autocomplete,
  TextField,
} from "@mui/material";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import DoneIcon from "@mui/icons-material/Done";
import InfoIcon from "@mui/icons-material/Info";
import WarningIcon from "@mui/icons-material/Warning";
import {
  ignoreColumn,
  reconsiderColumn,
  resetIgnoredColumns,
  setHeader,
} from "../actions";
import { validationSchema } from "./validationSchema";
import { useDialog } from "../hooks/useDialog";

const hasHeader = true;

const dialogTitles = {
  FOUND_DUPLICATE_HEADERS:
    "Sorry, several columns are matched to duplicate fields: ",
  NO_MATCHED_HEADERS_FOUND: "Sorry, there are no matched fields",
};

export default function Match({
  backClicked,
  formId,
  handleNext,
  handleBack,
  setBackClicked,
  setNextHidden,
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
  }, [backClicked, handleClickOpenBack, setBackClicked]);

  const nonIgnoredHeaders = useMemo(() => {
    return headers.filter((h) => !ignoredColumns.includes(h.label));
  }, [headers, ignoredColumns]);

  const findDuplicates = () => {
    const headerNames = nonIgnoredHeaders
      .map((h) => h.headerName)
      .filter((h) => h);
    const uniqueHeaderNames = new Set(headerNames);
    return uniqueHeaderNames.size !== headerNames.length;
  };

  const findMatchedHeaders = () => {
    return nonIgnoredHeaders.filter((h) => h.headerName).length > 0;
  };

  const getDuplicateHeadersText = () => {
    return headers
      .filter((header) => getDuplicateHeaders(header.label).length > 0)
      .map((header) => rows[0][header.label])
      .join(", ")
      .replace(/,(?=[^,]+$)/, " and ");
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (findDuplicates()) {
      setDialogTitle(
        dialogTitles.FOUND_DUPLICATE_HEADERS + getDuplicateHeadersText()
      );
      handleClickOpenNext();
    } else if (!findMatchedHeaders()) {
      setDialogTitle(dialogTitles.NO_MATCHED_HEADERS_FOUND);
      handleClickOpenNext();
    } else handleNext();
  };

  const handleConfirmBack = () => {
    dispatch(resetIgnoredColumns([]));
    setNextHidden(true);
    handleCloseBack();
    handleBack();
  };

  const getDuplicateHeaders = (label) => {
    const headers = nonIgnoredHeaders.reduce((acc, header) => {
      const { label, headerName } = header;
      return { ...acc, [label]: headerName };
    }, {});

    return nonIgnoredHeaders
      .filter(
        (header) =>
          header.headerName &&
          header.label !== label &&
          header.headerName === headers[label]
      )
      .map((header) => rows[0][header.label]);
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
              headerName={header.headerName}
              columnLabel={header.label}
              ignoredColumns={ignoredColumns}
              duplicateHeaders={getDuplicateHeaders(header.label)}
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
  duplicateHeaders,
}) {
  const [currentHeaderName, setCurrentHeaderName] = useState(headerName || "");
  const [emptyRowsRatio, setEmptyRowsRatio] = useState(0);
  const [nonValidRowsRatio, setNonValidRowsRatio] = useState(0);
  const isIgnoredColumn = ignoredColumns.includes(columnLabel);
  const [isEditing, setIsEditing] = useState(!isIgnoredColumn);
  const dispatch = useDispatch();

  const getHeaderField = useCallback(() => {
    return validHeaders.find(
      (header) => header.headerName === currentHeaderName
    )?.field;
  }, [validHeaders, currentHeaderName]);

  const validateRowsByField = useCallback(
    (headerField, fieldRows) => {
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
    },
    [columnLabel]
  );

  const computeEmptyRowsRatio = useCallback(() => {
    const filledRowsCount = rows.filter((row) => row[columnLabel]).length;
    const emptyRowsRatio = (filledRowsCount * 100) / rows.length;
    setEmptyRowsRatio(Math.round(emptyRowsRatio * 10) / 10);
  }, [rows, columnLabel]);

  useEffect(() => {
    let headerField = getHeaderField();
    validateRowsByField(headerField, rows);
    computeEmptyRowsRatio();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentHeaderName]);

  const handleHeaderChange = (e, value) => {
    setCurrentHeaderName(value);
    dispatch(setHeader(value, columnLabel));
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

  const isDuplicateHeaderName = useMemo(
    () => duplicateHeaders.length > 0,
    [duplicateHeaders]
  );

  const matchedHeadersText = duplicateHeaders
    .join(", ")
    .replace(/,(?=[^,]+$)/, " and ");

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
            sx={{ width: 490 }}
          >
            <Table aria-label="simple table">
              <TableHead>
                <TableRow sx={{ "&>th": { pb: 1.25 }, bgcolor: "grey.200" }}>
                  <TableCell>{columnLabel}</TableCell>
                  <TableCell>
                    <ColumnHeader
                      validHeaders={validHeaders}
                      columnLabel={columnLabel}
                      currentHeaderName={currentHeaderName}
                      handleHeaderChange={handleHeaderChange}
                    />
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
                      <TableCell width={20} sx={{ bgcolor: "grey.200" }}>
                        {idx + (hasHeader ? 2 : 1)}
                      </TableCell>
                      {row[columnLabel] ? (
                        <TableCell>{row[columnLabel]}</TableCell>
                      ) : (
                        <TableCell sx={{ bgcolor: "grey.50" }}>
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
              {headerName && isDuplicateHeaderName && (
                <Typography
                  variant="body2"
                  sx={{
                    color: "text.secondary",
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  <WarningIcon sx={{ color: "warning.light", mr: 1 }} />
                  {duplicateHeaders.length === 1
                    ? matchedHeadersText + " has "
                    : matchedHeadersText + " have "}
                  already been matched to {currentHeaderName}.
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
                  disabled={isDuplicateHeaderName}
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

function ColumnHeader({
  validHeaders,
  columnLabel,
  currentHeaderName,
  handleHeaderChange,
}) {
  const headersRow = useSelector((state) => state.appReducer.rows[0]);
  const headers = validHeaders
    .filter((v) => v.headerName)
    .map((v) => v.headerName);
  const [options, setOptions] = useState(headers);

  const column = String(headersRow[columnLabel]);
  const firstColumn = column.length < 12 ? column : column.slice(0, 12) + "...";

  return (
    <Stack direction="row" sx={{ alignItems: "center" }}>
      <Typography
        component="span"
        variant="body1"
        sx={{ minWidth: 110, whiteSpace: "nowrap" }}
      >
        {firstColumn}
      </Typography>
      <ArrowForwardIosIcon
        sx={{ ml: 2.5, mr: 1, fontSize: "2rem", color: "#c5c5c5" }}
      />
      <Autocomplete
        id="autocomplete"
        autoHighlight
        fullWidth
        value={currentHeaderName}
        options={[currentHeaderName, ...headers]}
        filterOptions={() => options}
        onChange={handleHeaderChange}
        onInputChange={(_, value) => {
          const filteredOptions = headers.filter((header) => {
            let re = new RegExp(value, "i");
            return header.match(re);
          });
          setOptions(filteredOptions);
        }}
        renderInput={(params) => (
          <TextField
            {...params}
            placeholder="Lookup matching fields"
            variant="standard"
            sx={{
              "& > .MuiInput-root:before, & > .MuiInput-root:after": {
                content: "none",
                borderBottom: 0,
              },
            }}
          />
        )}
        sx={{
          "& .MuiAutocomplete-clearIndicator": { visibility: "visible" },
        }}
      />
    </Stack>
  );
}
