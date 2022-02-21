import { useDispatch, useSelector } from "react-redux";
import { Box, Card, CardHeader, Button } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { useEffect, useMemo, useState } from "react";
import { setGridRows, setGridColumns, updateEditedGridRows } from "../actions";
import { validationSchema } from "./validationSchema";
import { useDialog } from "../hooks/useDialog";

export default function Review({
  canGoNext,
  canGoBack,
  backAction,
  nextAction,
}) {
  const { gridRows, gridColumns, rows, validHeaders, ignoredColumns } =
    useSelector(({ appReducer }) => appReducer);
  const { handleClose, handleClickOpen, AlertDialog: BackDialog } = useDialog();
  const [editedRows, setEditedRows] = useState({});
  const dispatch = useDispatch();

  const saveEditedGridRows = () => {
    dispatch(updateEditedGridRows(editedRows));
  };

  useEffect(() => {
    if (canGoBack) backAction(handleClickOpen);
    if (canGoNext)
      nextAction(async () => {
        await saveEditedGridRows();
        return true;
      });
  }, [canGoBack, canGoNext]);

  useEffect(() => {
    const rowsWithHeaders = getRowsWithHeaders(
      rows,
      validHeaders,
      ignoredColumns
    );
    const gridColumns = getValidHeaders(
      rowsWithHeaders[0],
      validHeaders,
      rowsWithHeaders
    );
    dispatch(setGridRows(rowsWithHeaders));
    dispatch(setGridColumns(gridColumns));
  }, []);

  const extendedSchema = useMemo(() => {
    const fields = gridColumns
      ?.filter((c) => c.field !== "id")
      ?.map((c) => c.field);
    let extendedSchema = validationSchema;

    fields?.forEach((field) => {
      if (field.split(/__\d$/).length > 1) {
        extendedSchema = validationSchema.shape({
          [field]: validationSchema.fields[field.split(/__\d$/)[0]],
        });
      }
    });

    return extendedSchema;
  }, [gridColumns]);

  const getValidColumns = useMemo(
    () =>
      gridColumns?.map((header) => {
        return {
          ...header,
          cellClassName: (params) => {
            try {
              extendedSchema.validateSyncAt(header.field, params.row);
            } catch (error) {
              return "validation-error";
            }
          },
        };
      }),
    [gridColumns, extendedSchema]
  );

  const handleConfirm = () => {
    backAction(() => true);
    handleClose();
    dispatch(setGridRows([]));
    dispatch(setGridColumns([]));
  };

  return gridRows?.length > 0 ? (
    <Box
      sx={{
        m: 2,
        mt: 3,
        height: 400,
        "& .validation-error": {
          backgroundColor: "error.light",
          color: "common.white",
        },
      }}
    >
      <DataGrid
        rows={gridRows}
        columns={getValidColumns}
        pageSize={10}
        rowsPerPageOptions={[10, 25, 50]}
        rowHeight={35}
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
    let fieldCount = {};
    headersWithFields.forEach((header) => {
      fieldCount[header.field] = (fieldCount[header.field] || 0) + 1;

      const count = fieldCount[header.field];
      if (count > 1) newRow[header.field + "__" + count] = row[header.label];
      else newRow[header.field] = row[header.label];
    });
    return newRow;
  });
};

const getValidHeaders = (headersRow, validHeaders, rows) => {
  let newValidHeaders = [...validHeaders];

  Object.keys(headersRow).forEach((field) => {
    const idx = validHeaders.findIndex(
      (v) =>
        field.split(/__\d$/).length > 1 && v.field === field.split(/__\d$/)[0]
    );
    if (idx !== -1)
      newValidHeaders.push({
        field,
        headerName: validHeaders[idx].headerName,
        editable: true,
      });
  });

  return newValidHeaders;
};
