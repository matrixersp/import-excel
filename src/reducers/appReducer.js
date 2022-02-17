import { appConstants } from "../constants";

export const initialState = {
  rows: [],
  validHeaders: [],
  ignoredColumns: [],
  gridRows: [],
  gridColumns: [],
  validationErrors: [],
};

const appReducer = (state = initialState, action) => {
  switch (action.type) {
    case appConstants.SET_ROWS:
      return { ...state, rows: action.payload };

    case appConstants.SET_VALID_HEADERS:
      return { ...state, validHeaders: action.payload };

    case appConstants.SET_HEADER:
      const payload = action.payload;
      const rows = [...state.rows];
      rows[0][payload.columnLabel] = payload.headerName;
      return { ...state, rows };

    case appConstants.IGNORE_COLUMN: {
      const ignoredColumns = [...state.ignoredColumns, action.payload];
      return { ...state, ignoredColumns };
    }

    case appConstants.RECONSIDER_COLUMN: {
      const ignoredColumns = [...state.ignoredColumns];
      const newColumns = ignoredColumns.filter(
        (column) => column !== action.payload
      );
      return { ...state, ignoredColumns: newColumns };
    }

    case appConstants.SET_GRID_ROWS:
      return { ...state, gridRows: action.payload };

    case appConstants.SET_GRID_COLUMNS:
      return { ...state, gridColumns: action.payload };

    case appConstants.SET_VALIDATION_ERRORS:
      const validationErrors = [...state.validationErrors];
      const { columnLabel, errors } = action.payload;
      const index = validationErrors.findIndex(
        (err) => err.columnLabel === columnLabel
      );

      if (index !== -1)
        validationErrors.splice(index, 1, { columnLabel, errors });
      else validationErrors.push({ columnLabel, errors });

      return { ...state, validationErrors };

    default:
      return state;
  }
};

export default appReducer;
