import { appConstants } from "../constants";

export const initialState = {
  rows: [],
  validHeaders: [],
  ignoredColumns: [],
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

    default:
      return state;
  }
};

export default appReducer;
