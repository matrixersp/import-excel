import { UPLOAD_EXCEL_DATA } from "../constants";

const initialState = {
  data: null,
};

export const excelReducer = (state = initialState, action) => {
  switch (action.type) {
    case UPLOAD_EXCEL_DATA:
      return {
        ...state,
        data: action.payload,
      };
    default:
      return state;
  }
};
