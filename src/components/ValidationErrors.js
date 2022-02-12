import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from "@mui/material";

export default function ValidationErrors({ rows }) {
  return (
    <Box sx={{ mt: 2 }}>
      <Typography variant="subtitle1" component="div" gutterBottom>
        Please review the errors below, then upload again:
      </Typography>
      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 275 }} aria-label="validation errors table">
          <TableHead>
            <TableRow>
              <TableCell>Row Nº</TableCell>
              <TableCell>Error Type</TableCell>
              <TableCell>Errors</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((row, idx) => (
              <TableRow
                key={idx}
                sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
              >
                <TableCell component="th" scope="row">
                  {row.value.__rowNum__}
                </TableCell>
                <TableCell>{row.name}</TableCell>
                <TableCell>
                  {row.errors.map((err, idx) => (
                    <p key={idx}>- {err}</p>
                  ))}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}
