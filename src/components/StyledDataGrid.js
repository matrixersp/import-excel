import { DataGrid } from "@mui/x-data-grid";
import { styled } from "@mui/material/styles";

export const StyledDataGrid = styled(DataGrid)(({ theme }) => ({
  "& .MuiDataGrid-iconSeparator": {
    display: "none",
  },
  "& .MuiDataGrid-columnHeader, .MuiDataGrid-cell": {
    borderRight: `1px solid ${
      theme.palette.mode === "light" ? "#e5e5e5" : "#303030"
    }`,
  },
  "& .MuiDataGrid-columnHeaderTitleContainer": {
    height: "56px",
  },
}));
