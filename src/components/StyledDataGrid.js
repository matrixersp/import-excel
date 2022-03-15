import { DataGridPro } from "@mui/x-data-grid-pro";
import { styled } from "@mui/material/styles";

export const StyledDataGrid = styled(DataGridPro)(({ theme }) => ({
  "& .MuiDataGrid-columnHeaders": {
    backgroundColor: "#afd4ff",
    height: "46px!important",
  },
  '& [data-field="id"]': {
    backgroundColor: "#afd4ff",
    "& .MuiTypography-root": {
      fontWeight: "500",
    },
    borderBottom: `1px solid ${
      theme.palette.mode === "light" ? "#e5e5e5" : "#303030"
    }`,
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
