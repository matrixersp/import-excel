import { useState } from "react";
import Box from "@mui/material/Box";
import Stepper from "@mui/material/Stepper";
import Step from "@mui/material/Step";
import StepLabel from "@mui/material/StepLabel";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";

export default function StepperComponent({ steps }) {
  const [activeStep, setActiveStep] = useState(0);

  const [canGoNext, setCanGoNext] = useState(false);
  const [canGoBack, setCanGoBack] = useState(false);
  const [openNext, setOpenNext] = useState(false);
  const [openBack, setOpenBack] = useState(false);

  const handleClickOpenNext = () => {
    setOpenNext(true);
  };

  const handleClickOpenBack = () => {
    setOpenBack(true);
  };

  const handleCloseNext = () => {
    setOpenNext(false);
  };

  const handleCloseBack = () => {
    setOpenBack(false);
  };

  const handleNext = () => {
    if (canGoNext && activeStep + 1 < steps.length)
      setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleSubmit = () => {
    setCanGoNext(true);
  };

  const handlePrevious = () => {
    setCanGoBack(true);
  };

  const nextAction = async (callback) => {
    const moveForward = await callback();
    setCanGoNext(false);
    if (moveForward) handleNext();
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleReset = () => {
    setActiveStep(0);
  };

  const Component = steps[activeStep].component;

  return (
    <Box sx={{ width: "100%" }}>
      <Stepper activeStep={activeStep}>
        {steps.map(({ label }, index) => {
          const stepProps = {};
          const labelProps = {};
          return (
            <Step key={label} {...stepProps}>
              <StepLabel {...labelProps}>{label}</StepLabel>
            </Step>
          );
        })}
      </Stepper>
      {
        <Component
          handleNext={handleNext}
          activeStep={activeStep}
          canGoNext={canGoNext}
          canGoBack={canGoBack}
          nextAction={nextAction}
          nextDialogProps={{ openNext, handleClickOpenNext, handleCloseNext }}
          backDialogProps={{ openBack, handleClickOpenBack, handleCloseBack }}
        />
      }
      {activeStep === steps.length ? (
        <>
          <Typography sx={{ mt: 2, mb: 1 }}>
            All steps completed - you&apos;re finished
          </Typography>
          <Box sx={{ display: "flex", flexDirection: "row", pt: 2 }}>
            <Box sx={{ flex: "1 1 auto" }} />
            <Button onClick={handleReset}>Reset</Button>
          </Box>
        </>
      ) : (
        <>
          <Box sx={{ display: "flex", flexDirection: "row", pt: 2 }}>
            <Button
              color="inherit"
              disabled={activeStep === 0}
              onClick={handlePrevious}
              sx={{ mr: 1 }}
            >
              Back
            </Button>
            <Box sx={{ flex: "1 1 auto" }} />

            <Button onClick={handleSubmit} variant="contained">
              {activeStep === steps.length - 1 ? "Finish" : "Next"}
            </Button>
          </Box>
        </>
      )}
    </Box>
  );
}
