import { useParams } from "react-router-dom";
import { PlaceholderPage } from "../components/layout/PlaceholderPage";

export function RoutineBuilderPage() {
  const { id } = useParams();

  return (
    <PlaceholderPage
      title={id === "new" ? "Create Routine" : "Routine Builder"}
      description="The three-panel routine builder will be implemented in Milestone 5."
    />
  );
}
