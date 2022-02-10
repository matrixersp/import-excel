import { UPLOAD_EXCEL_DATA } from "../constants";

export const uploadExcelData = (data) => ({
  type: UPLOAD_EXCEL_DATA,
  payload: data,
});
