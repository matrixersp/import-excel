import { appConstants } from "../constants";

export const setRows = (rows) => ({
  type: appConstants.SET_ROWS,
  payload: rows,
});

export const setHeader = (headerName, columnLabel) => ({
  type: appConstants.SET_HEADER,
  payload: { headerName, columnLabel },
});

export const ignoreColumn = (columnLabel) => ({
  type: appConstants.IGNORE_COLUMN,
  payload: columnLabel,
});

export const reconsiderColumn = (columnLabel) => ({
  type: appConstants.RECONSIDER_COLUMN,
  payload: columnLabel,
});

export const setGridRows = (rows) => ({
  type: appConstants.SET_GRID_ROWS,
  payload: rows,
});

export const setValidHeaders = (headers) => ({
  type: appConstants.SET_VALID_HEADERS,
  payload: headers,
});