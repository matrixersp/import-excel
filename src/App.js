import Upload from "./components/Upload";
import Match from "./components/Match";
import Review from "./components/Review";

import StepperComponent from "./components/StepperComponent";

function App() {
  return (
    <div className="App">
      <StepperComponent
        steps={[
          { label: "Upload", component: Upload },
          { label: "Match", component: Match },
          { label: "Review", component: Review },
        ]}
      />
    </div>
  );
}

export default App;
