import { appConstants } from "../constants";

export const setRows = (data) => ({
  type: appConstants.SET_ROWS,
  payload: data,
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
