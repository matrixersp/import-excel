import { useState } from "react";
import {
  Box,
  Stepper,
  Step,
  StepLabel,
  Button,
  Stack,
  Typography,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";

const StepIconRoot = styled("div")(({ theme, ownerState }) => ({
  color: theme.palette.mode === "dark" ? theme.palette.grey[700] : "#eaeaf0",
  display: "flex",
  height: 22,
  alignItems: "center",
  ...(ownerState.active && {
    color: theme.palette.primary.main,
  }),
  "& .StepIcon-completedIcon": {
    color: theme.palette.primary.main,
    zIndex: 1,
    fontSize: 18,
  },
}));

function StepIcon(props) {
  const { active, completed, className } = props;
  return (
    <StepIconRoot ownerState={{ active }} className={className}>
      {completed && <CheckCircleIcon className="StepIcon-completedIcon" />}
    </StepIconRoot>
  );
}

export default function StepperComponent({ steps }) {
  const [activeStep, setActiveStep] = useState(0);

  const [nextHidden, setNextHidden] = useState(true);
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
      <Stack direction="row" justifyContent="space-between">
        <Typography component="h1" variant="h5">
          Bulk add Contacts
        </Typography>
        <Stepper
          activeStep={activeStep}
          connector={
            <ArrowForwardIosIcon
              sx={{ fontSize: "1.2rem", color: "#e5e5e5" }}
            />
          }
        >
          {steps.map(({ label }, index) => {
            const stepProps = {};
            const labelProps = {};
            return (
              <Step key={label} {...stepProps}>
                <StepLabel {...labelProps} StepIconComponent={StepIcon}>
                  {label}
                </StepLabel>
              </Step>
            );
          })}
        </Stepper>
      </Stack>
      <StepComponent
        formId={formId}
        backClicked={backClicked}
        setNextHidden={setNextHidden}
        setBackClicked={setBackClicked}
        handleNext={handleNext}
        handleBack={handleBack}
      />
      {!nextHidden && (
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
          <Button variant="contained" form={formId} type="submit">
            {activeStep === steps.length - 1 ? "Finish" : "Next"}
          </Button>
        </Box>
      )}
    </Box>
  );
}