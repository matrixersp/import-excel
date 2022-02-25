import { appConstants } from "../constants";

export const setRows = (rows) => ({
  type: appConstants.SET_ROWS,
  payload: rows,
});

export const setHeaders = (headers) => ({
  type: appConstants.SET_HEADERS,
  payload: headers,
});

export const setHeader = (headerName, columnLabel) => ({
  type: appConstants.SET_HEADER,
  payload: { headerName, columnLabel },
});

export const setIgnoredColumns = (columns) => ({
  type: appConstants.SET_IGNORED_COLUMNS,
  payload: columns,
});

export const ignoreColumn = (columnLabel) => ({
  type: appConstants.IGNORE_COLUMN,
  payload: columnLabel,
});

export const reconsiderColumn = (columnLabel) => ({
  type: appConstants.RECONSIDER_COLUMN,
  payload: columnLabel,
});

export const resetIgnoredColumns = () => ({
  type: appConstants.RESET_IGNORED_COLUMNS,
});

export const setGridRows = (rows) => ({
  type: appConstants.SET_GRID_ROWS,
  payload: rows,
});

export const setGridColumns = (columns) => ({
  type: appConstants.SET_GRID_COLUMNS,
  payload: columns,
});

export const setValidHeaders = (headers) => ({
  type: appConstants.SET_VALID_HEADERS,
  payload: headers,
});

export const setErrors = (columnLabel, errors) => ({
  type: appConstants.SET_VALIDATION_ERRORS,
  payload: { columnLabel, errors },
});

export const updateEditedGridRows = (rows) => ({
  type: appConstants.UPDATE_EDITED_GRID_ROWS,
  payload: rows,
});