import { useState } from "react";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogTitle from "@mui/material/DialogTitle";
import Button from "@mui/material/Button";

export function useDialog() {
  const [open, setOpen] = useState(false);

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const AlertDialog = ({ title, children }) => {
    return (
      <Dialog
        open={open}
        onClose={handleClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">{title}</DialogTitle>
        <DialogActions>
          {children ? (
            children
          ) : (
            <Button onClick={handleClose} variant="contained">
              Ok
            </Button>
          )}
        </DialogActions>
      </Dialog>
    );
  };

  return {
    handleClickOpen,
    handleClose,
    AlertDialog,
  };
}
