import { useDispatch, useSelector } from "react-redux";
import { Box, Card, CardHeader, Button, Typography } from "@mui/material";
import Tooltip, { tooltipClasses } from "@mui/material/Tooltip";
import { styled } from "@mui/material/styles";
import { useEffect, useMemo, useState } from "react";
import { StyledDataGrid } from "./StyledDataGrid";
import { setGridRows, setGridColumns, updateEditedGridRows } from "../actions";
import { validationSchema } from "./validationSchema";
import { useDialog } from "../hooks/useDialog";

const HtmlTooltip = styled(({ className, ...props }) => (
  <Tooltip {...props} classes={{ popper: className }} />
))(({ theme }) => ({
  [`& .${tooltipClasses.tooltip}`]: {
    backgroundColor: theme.palette.error.light,
    color: theme.palette.common.white,
    maxWidth: 250,
    fontSize: theme.typography.pxToRem(12),
    border: `1px solid ${theme.palette.error.dark}`,
  },
}));

const DEFAULT_PAGE_SIZE = 10;

export default function Review({
  backClicked,
  formId,
  handleNext,
  handleBack,
  setBackClicked,
}) {
  const { gridRows, gridColumns, rows, validHeaders, headers, ignoredColumns } =
    useSelector(({ appReducer }) => appReducer);
  const { handleClose, handleClickOpen, AlertDialog: BackDialog } = useDialog();
  const [editedRows, setEditedRows] = useState({});
  const dispatch = useDispatch();
  const [validationErrors, setValidationErrors] = useState({});
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [currentRows, setCurrentRows] = useState([]);

  const saveEditedGridRows = () => {
    dispatch(updateEditedGridRows(editedRows));
  };

  useEffect(() => {
    const rowsWithHeaders = getRowsWithHeaders(
      rows,
      validHeaders,
      headers,
      ignoredColumns
    );
    const gridColumns = orderHeaders(validHeaders, rowsWithHeaders);
    dispatch(setGridRows(rowsWithHeaders));
    dispatch(setGridColumns(gridColumns));
    setCurrentRows(rowsWithHeaders);
  }, [dispatch, headers, rows, ignoredColumns, validHeaders]);

  useEffect(() => {
    validateRows(currentRows.slice(page * pageSize, pageSize * (page + 1)));
  }, [currentRows, page, pageSize]);

  useEffect(() => {
    if (backClicked) {
      handleClickOpen();
      setBackClicked();
    }
  }, [backClicked, handleClickOpen, setBackClicked]);

  const handleSubmit = (e) => {
    e.preventDefault();
    saveEditedGridRows();
    handleNext();
  };

  const validateRows = (rows) => {
    const errors = {};
    rows.forEach((row) => {
      errors[row.id] = {};
      Object.entries(row)
        .filter((entry) => entry[0] !== "id")
        .forEach((entry) => {
          try {
            validationSchema.validateSyncAt(entry[0], row);
          } catch (err) {
            errors[row.id][entry[0]] = {
              name: err.name,
              errors: err.errors,
            };
          }
        });
    });
    setValidationErrors((state) => ({ ...state, ...errors }));
  };

  const validateCell = (cell) => {
    try {
      validationSchema.validateSyncAt(cell.field, { [cell.field]: cell.value });
      delete validationErrors[cell.id][cell.field];
    } catch (err) {
      setValidationErrors((errors) => ({
        ...errors,
        [cell.id]: {
          ...errors[cell.id],
          [cell.field]: {
            name: err.name,
            errors: err.errors,
          },
        },
      }));
    }
  };

  const getValidColumns = useMemo(
    () =>
      gridColumns?.map((header) => {
        return {
          ...header,
          renderHeader: (params) => {
            if (params.field === "id") return <div />;
          },
          cellClassName: (params) => {
            if (params.field === "id") return;
            if (
              validationErrors[params.id] &&
              validationErrors[params.id][params.field]
            )
              return "validation-error";
          },
          renderCell: (params) => {
            if (params.field === "id")
              return (
                <Typography component="span" sx={{ width: "100%" }}>
                  {+params.value + 1}
                </Typography>
              );
            if (!validationErrors[params.id]) return;
            const err = validationErrors[params.id][params.field];
            if (err)
              return (
                <HtmlTooltip
                  title={
                    <>
                      <Typography color="inherit">{err.name}:</Typography>
                      <ul style={{ paddingLeft: 16, margin: "5px 0px" }}>
                        {err.errors.map((item, idx) => (
                          <li key={idx}>
                            <Typography
                              color="inherit"
                              sx={{ fontSize: "0.875rem" }}
                            >
                              {item}
                            </Typography>
                          </li>
                        ))}
                      </ul>
                    </>
                  }
                >
                  <span>{params.value || <em>No Data</em>}</span>
                </HtmlTooltip>
              );
          },
        };
      }),
    [gridColumns, validationErrors]
  );

  const handleConfirm = () => {
    dispatch(setGridRows([]));
    dispatch(setGridColumns([]));
    handleClose();
    handleBack();
  };

  return currentRows?.length > 0 ? (
    <Box
      sx={{
        m: 2,
        mt: 3,
        height: 525,
        "& .validation-error": {
          backgroundColor: "#ff97a0",
          color: "text.primary",
        },
      }}
      component="form"
      id={formId}
      onSubmit={handleSubmit}
    >
      <StyledDataGrid
        rows={currentRows}
        columns={getValidColumns}
        pageSize={pageSize}
        rowsPerPageOptions={[10, 25, 50]}
        onPageSizeChange={(size) => setPageSize(size)}
        onPageChange={(page) => setPage(page)}
        rowHeight={40}
        onCellEditCommit={(cell) => {
          const idx = currentRows.findIndex((row) => row.id === cell.id);
          currentRows[idx][cell.field] = cell.value;
          setCurrentRows(currentRows);

          setEditedRows((state) => ({
            ...state,
            [cell.id]: {
              ...gridRows[idx],
              ...state[cell.id],
              [cell.field]: cell.value,
            },
          }));

          validateCell(cell);
        }}
      />
      <BackDialog
        title={
          "Are you sure you want to clear all changes to data in progress in this stage?"
        }
      >
        <Button onClick={handleClose} variant="outlined" autoFocus>
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

const getPickedHeaders = (headers, ignoredColumns) => {
  return headers.filter(
    (h) => h.headerName && !ignoredColumns.includes(h.label)
  );
};

const getRowsWithHeaders = (rows, validHeaders, headers, ignoredColumns) => {
  const pickedHeaders = getPickedHeaders(headers, ignoredColumns);
  let headersWithFields = [];

  pickedHeaders.forEach((header) => {
    const { label, headerName } = header;
    const field = validHeaders.find((v) => v.headerName === headerName)?.field;
    if (field) headersWithFields.push({ label, field, headerName });
  });

  return rows.slice(1).map((row) => {
    let newRow = { id: row.__rowNum__ };
    headersWithFields.forEach((header) => {
      newRow[header.field] = row[header.label];
    });
    return newRow;
  });
};

const orderHeaders = (validHeaders, rows) => {
  return Object.keys(rows[0]).map((field) => {
    const { headerName, width, editable } = validHeaders.find(
      (h) => h.field === field
    );
    if (field === "id") return { field, width: 90 };
    else return { field, headerName, width, editable };
  });
};
