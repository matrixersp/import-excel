import { SET_ROWS } from "../constants";

export const setRows = (data) => ({
  type: SET_ROWS,
  payload: data,
});
