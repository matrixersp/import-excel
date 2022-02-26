import { useState } from "react";
import Box from "@mui/material/Box";
import Stepper from "@mui/material/Stepper";
import Step from "@mui/material/Step";
import StepLabel from "@mui/material/StepLabel";
import Button from "@mui/material/Button";

export default function StepperComponent({ steps }) {
  const [activeStep, setActiveStep] = useState(0);

  const [nextEnabled, setNextEnabled] = useState(false);
  const [backClicked, setBackClicked] = useState(false);

  const handleNext = () => {
    if (activeStep < steps.length)
      setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const StepComponent = steps[activeStep].component;
  const formId = "form-step-" + activeStep;

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
      <StepComponent
        formId={formId}
        nextEnabled={nextEnabled}
        backClicked={backClicked}
        setNextEnabled={setNextEnabled}
        setBackClicked={setBackClicked}
        handleNext={handleNext}
        handleBack={handleBack}
      />
      <Box sx={{ display: "flex", flexDirection: "row", pt: 2 }}>
        <Button
          color="inherit"
          disabled={activeStep === 0}
          onClick={() => setBackClicked(true)}
          sx={{ mr: 1 }}
        >
          Back
        </Button>
        <Box sx={{ flex: "1 1 auto" }} />
        <Button
          variant="contained"
          disabled={!nextEnabled}
          form={formId}
          type="submit"
        >
          {activeStep === steps.length - 1 ? "Finish" : "Next"}
        </Button>
      </Box>
    </Box>
  );
}
