import { SET_ROWS, SET_COLUMNS } from "../constants";

const rowsInitialState = {
  data: null,
};

export const rowsReducer = (state = rowsInitialState, action) => {
  switch (action.type) {
    case SET_ROWS:
      return {
        ...state,
        data: action.payload,
      };
    default:
      return state;
  }
};

const columnsInitialState = {
  data: null,
};

export const columnsReducer = (state = columnsInitialState, action) => {
  switch (action.type) {
    case SET_COLUMNS:
      return {
        ...state,
        data: action.payload,
      };
    default:
      return state;
  }
};
