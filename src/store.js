import { createStore, combineReducers } from "redux";
import { excelReducer } from "./reducers";

const allReducers = combineReducers({
  excelReducer,
});

export const store = createStore(
  allReducers,
  window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__()
);
