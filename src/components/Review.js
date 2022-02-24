import { useDispatch, useSelector } from "react-redux";
import { Box, Card, CardHeader, Button, Typography } from "@mui/material";
import Tooltip, { tooltipClasses } from "@mui/material/Tooltip";
import { styled } from "@mui/material/styles";
import { DataGrid } from "@mui/x-data-grid";
import { useEffect, useMemo, useState } from "react";
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

export default function Review({
  canGoNext,
  canGoBack,
  backAction,
  nextAction,
}) {
  const { gridRows, gridColumns, rows, validHeaders, headers, ignoredColumns } =
    useSelector(({ appReducer }) => appReducer);
  const { handleClose, handleClickOpen, AlertDialog: BackDialog } = useDialog();
  const [editedRows, setEditedRows] = useState({});
  const dispatch = useDispatch();
  const [validationErrors, setValidationErrors] = useState({});

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
    validateRows(rowsWithHeaders);
  }, []);

  useEffect(() => {
    if (canGoBack) backAction(handleClickOpen);
    if (canGoNext)
      nextAction(async () => {
        await saveEditedGridRows();
        return true;
      });
  }, [canGoBack, canGoNext]);

  const validateRows = (rows) => {
    const errors = {};
    rows.forEach((row) => {
      errors[row.id] = {};
      Object.entries(row).forEach((entry) => {
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
    setValidationErrors(errors);
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
          cellClassName: (params) => {
            if (validationErrors[params.id][params.field])
              return "validation-error";
          },
          renderCell: (params) => {
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
    backAction(() => true);
  };

  return gridRows?.length > 0 ? (
    <Box
      sx={{
        m: 2,
        mt: 3,
        height: 400,
        "& .validation-error": {
          backgroundColor: "#ff97a0",
          color: "text.primary",
        },
      }}
    >
      <DataGrid
        rows={gridRows}
        columns={getValidColumns}
        pageSize={10}
        rowsPerPageOptions={[10, 25, 50]}
        rowHeight={40}
        checkboxSelection
        disableSelectionOnClick
        onCellEditCommit={(cell) => {
          setEditedRows((state) => {
            const row = gridRows.find((row) => row.id === cell.id);
            state = {
              ...state,
              [cell.id]: {
                ...row,
                ...state[cell.id],
                [cell.field]: cell.value,
              },
            };
            return state;
          });
          validateCell(cell);
        }}
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
  return Object.keys(rows[0])
    .filter((f) => f !== "id")
    .map((field) => {
      const headerName = validHeaders.find(
        (h) => h.field === field
      )?.headerName;
      return { field, headerName, editable: true, width: 200 };
    });
};
