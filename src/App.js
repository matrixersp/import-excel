import { useState } from "react";
import { useDispatch } from "react-redux";
import { Button, Box } from "@mui/material";
import XLSX from "xlsx";
import * as yup from "yup";

import Upload from "./components/Upload";
import Match from "./components/Match";
import Review from "./components/Review";

import { setRows } from "./actions";
import ValidationErrors from "./components/ValidationErrors";
import DataGridComponent from "./components/DataGridComponent";
import StepperComponent from "./components/StepperComponent";

let contactSchema = yup.object().shape({
  id: yup.number().min(1),
  name: yup
    .string()
    .trim()
    .matches(
      /(^[A-Za-z]{3,16})([ ]{0,1})([A-Za-z]{3,16})?([ ]{0,1})?([A-Za-z]{3,16})?([ ]{0,1})?([A-Za-z]{3,16})/,
      "Full name is not valid"
    )
    .required(),
  email: yup.string().trim().email().required(),
});

function App() {
  const dispatch = useDispatch();
  const [selectedFile, setSelectedFile] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [validationErrors, setValidationErrors] = useState([]);

  const createDataGrid = async () => {
    const data = await selectedFile.arrayBuffer();
    let workbook = XLSX.read(data);

    const names = Object.keys(workbook.Sheets);
    const selectedRows = names.map((name) =>
      XLSX.utils.sheet_to_json(workbook.Sheets[name])
    )[0];

    setValidationErrors([]);
    let validRows = selectedRows.map(async (row) => {
      try {
        await contactSchema.validate(row, { abortEarly: false });
        return true;
      } catch (err) {
        setValidationErrors((validationErrors) => [...validationErrors, err]);
        return false;
      }
    });

    Promise.all(validRows).then((result) => {
      let isValid = !result.some((isValidRow) => !isValidRow);

      if (isValid) {
        let rowsWithIds = setRowIds(selectedRows);
        dispatch(setRows(rowsWithIds));
      }
    });

    setSubmitted(true);
  };

  const setRowIds = (rows) => {
    return rows.map((row) => ({ ...row, id: row.__rowNum__ }));
  };

  return (
    <div className="App">
      <StepperComponent
        steps={[
          {
            label: "Upload",
            component: (
              <Upload
                selectedFile={selectedFile}
                setSelectedFile={setSelectedFile}
                setSubmitted={setSubmitted}
              />
            ),
          },
          { label: "Match", component: <Match /> },
          { label: "Review", component: <Review /> },
        ]}
      />
      {/* <Upload
        selectedFile={selectedFile}
        setSelectedFile={setSelectedFile}
        setSubmitted={setSubmitted}
      />
      {selectedFile && !submitted && (
        <Box sx={{ my: 2 }}>
          <Button variant="contained" component="span" onClick={createDataGrid}>
            Create Data Grid
          </Button>
        </Box>
      )}
      {validationErrors.length > 0 ? (
        <ValidationErrors rows={validationErrors} />
      ) : (
        <DataGridComponent schema={contactSchema} />
      )} */}
    </div>
  );
}

export default App;
