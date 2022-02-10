import { FlatfileButton } from "@flatfile/react";
import { useSelector, useDispatch } from "react-redux";
import { Button } from "@mui/material";
import { uploadExcelData } from "./actions";

function App() {
  const data = useSelector((state) => state.excelReducer.data);
  const dispatch = useDispatch();

  return (
    <div className="App">
      <Button variant="contained" style={{ padding: 0 }}>
        <FlatfileButton
          tabIndex={0}
          style={{
            backgroundColor: "transparent",
            border: "none",
            color: "white",
            margin: 0,
            padding: "10px 18px",
            fontSize: "1rem",
            cursor: "pointer",
          }}
          licenseKey="50bb616d-2f6a-4565-847b-326676114bd6"
          customer={{ userId: "12345" }}
          settings={{
            type: "Contact",
            fields: [
              {
                label: "Full Name",
                key: "name",
                validators: [{ validate: "required" }],
              },
              {
                label: "Email",
                key: "email",
                validators: [
                  { validate: "required" },
                  { validate: "unique" },
                  {
                    validate: "regex_matches",
                    regex:
                      "^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$",
                  },
                ],
              },
            ],
          }}
          onData={async (results) => {
            console.log(results);
            dispatch(uploadExcelData(results.data));
            return "Done!";
          }}
        >
          Import Contacts
        </FlatfileButton>
      </Button>
      <pre style={{ padding: "20px", background: "#dadada" }}>
        {data ? (
          <ul>
            {data.map((record) => (
              <li>
                {record.name} &lt;{record.email}&gt;
              </li>
            ))}
          </ul>
        ) : (
          <div>No data yet</div>
        )}
      </pre>
    </div>
  );
}

export default App;
