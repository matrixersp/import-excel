import { createStore } from "redux";
import rootReducer from "./reducers";

const columns: GridColDef[] = [
  { field: "id", hide: true },
  { field: "name", headerName: "Full Name", width: 150, editable: true },
  { field: "email", headerName: "Email", width: 150, editable: true },
];

export const store = createStore(
  rootReducer,
  {
    appReducer: {
      validHeaders: columns,
      ignoredColumns: [],
      validationErrors: [],
      headers: [],
    },
  },
  window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__()
);
