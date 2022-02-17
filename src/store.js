import { createStore } from "redux";
import rootReducer from "./reducers";
import { validationSchema } from "./components/Match";

const columns: GridColDef[] = [
  { field: "id", hide: true },
  { field: "name", headerName: "Full Name", width: 150, editable: true },
  {
    field: "email",
    headerName: "Email",
    width: 150,
    editable: true,
    cellClassName: async (params) => {
      try {
        await validationSchema.validateAt(params.field, {
          [params.field]: params.value,
        });
        return "";
      } catch (error) {
        return "validation-error";
      }
    },
  },
];

export const store = createStore(
  rootReducer,
  {
    appReducer: {
      validHeaders: columns,
      ignoredColumns: [],
      validationErrors: [],
    },
  },
  window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__()
);
