import { appConstants } from "../constants";

export const initialState = {
  rows: [],
  validHeaders: [],
  ignoredColumns: [],
  gridRows: [],
  gridColumns: [],
  validationErrors: [],
  headers: [],
};

const appReducer = (state = initialState, { type, payload }) => {
  switch (type) {
    case appConstants.SET_ROWS:
      return { ...state, rows: payload };

    case appConstants.SET_VALID_HEADERS:
      return { ...state, validHeaders: payload };

    case appConstants.SET_HEADERS:
      return { ...state, headers: payload };

    case appConstants.SET_HEADER: {
      const headers = [...state.headers];
      const index = headers.findIndex((h) => h.label === payload.columnLabel);
      if (index !== -1) headers[index].headerName = payload.headerName;
      return { ...state, headers };
    }

    case appConstants.SET_IGNORED_COLUMNS: {
      return { ...state, ignoredColumns: payload };
    }

    case appConstants.IGNORE_COLUMN: {
      const ignoredColumns = [...state.ignoredColumns, payload];
      return { ...state, ignoredColumns };
    }

    case appConstants.RECONSIDER_COLUMN: {
      const ignoredColumns = [...state.ignoredColumns];
      const newColumns = ignoredColumns.filter((column) => column !== payload);
      return { ...state, ignoredColumns: newColumns };
    }

    case appConstants.RESET_IGNORED_COLUMNS: {
      return { ...state, ignoredColumns: [] };
    }

    case appConstants.SET_GRID_ROWS:
      return { ...state, gridRows: payload };

    case appConstants.SET_GRID_COLUMNS:
      return { ...state, gridColumns: payload };

    case appConstants.SET_VALIDATION_ERRORS:
      const validationErrors = [...state.validationErrors];
      const { columnLabel, errors } = payload;
      const index = validationErrors.findIndex(
        (err) => err.columnLabel === columnLabel
      );

      if (index !== -1)
        validationErrors.splice(index, 1, { columnLabel, errors });
      else validationErrors.push({ columnLabel, errors });

      return { ...state, validationErrors };

    case appConstants.UPDATE_EDITED_GRID_ROWS:
      const editedGridRows = payload;
      const gridRows = [...state.gridRows];

      Object.keys(editedGridRows).forEach((id) => {
        const idx = gridRows.findIndex((row) => String(row.id) === id);
        if (idx !== -1) gridRows[idx] = editedGridRows[id];
      });

      return { ...state, gridRows };

    default:
      return state;
  }
};

export default appReducer;
