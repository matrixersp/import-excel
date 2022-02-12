import { createStore, combineReducers } from "redux";
import { rowsReducer } from "./reducers";
import { columnsReducer } from "./reducers";

const allReducers = combineReducers({
  rowsReducer,
  columnsReducer,
});

const columns: GridColDef[] = [
  { field: "id", hide: true },
  { field: "name", headerName: "Full Name", width: 150, editable: true },
  { field: "email", headerName: "Email", width: 150, editable: true },
];

export const store = createStore(
  allReducers,
  {
    columnsReducer: { data: columns },
  },
  window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__()
);
