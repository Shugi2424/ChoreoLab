import { useQuery } from "@apollo/client";
import {
  BODY_ELEMENTS_QUERY,
  HEALTH_QUERY,
  REQUIREMENTS_QUERY,
} from "./apollo/client";
import "./App.css";

function App() {
  const { data: healthData, loading: healthLoading } = useQuery(HEALTH_QUERY);
  const { data: elementsData, loading: elementsLoading, error } =
    useQuery(BODY_ELEMENTS_QUERY);
  const { data: reqData } = useQuery(REQUIREMENTS_QUERY, {
    variables: { ageCategory: "senior" },
  });

  return (
    <main className="app">
      <header>
        <h1>ChoreoLab</h1>
        <p>Rhythmic gymnastics choreography builder</p>
      </header>

      <section className="status">
        <h2>API status</h2>
        {healthLoading ? (
          <p>Connecting…</p>
        ) : (
          <p className="ok">{healthData?.health ?? "No response"}</p>
        )}
      </section>

      {reqData?.requirements && (
        <section>
          <h2>Senior requirements (2025–2028 CoP)</h2>
          <p>
            DB: max {reqData.requirements.DB.maxElements} elements · max{" "}
            {reqData.requirements.DB.maxRisks} risks
          </p>
          <p>
            DA: max {reqData.requirements.DA.maxMasteries} masteries · max{" "}
            {reqData.requirements.DA.maxAcrobatics} acrobatics
          </p>
          <p>
            Artistry: {reqData.requirements.A.minCharacterMoves} character ·{" "}
            {reqData.requirements.A.minDanceSteps} dance ·{" "}
            {reqData.requirements.A.minDynamicEffects} dynamic/effects
          </p>
        </section>
      )}

      <section>
        <h2>Body elements ({elementsData?.bodyElements?.length ?? 0})</h2>
        {elementsLoading && <p>Loading elements…</p>}
        {error && (
          <p className="error">
            Could not load elements. Is the server running?
          </p>
        )}
        {!elementsLoading && !error && (
          <ul className="element-list">
            {(elementsData?.bodyElements ?? []).slice(0, 20).map((el: {
              id: string;
              name: string;
              category: string;
              value: number;
            }) => (
              <li key={el.id}>
                <strong>{el.id}</strong> — {el.name}
                <span>
                  {el.category} · {el.value}
                </span>
              </li>
            ))}
          </ul>
        )}
        {(elementsData?.bodyElements?.length ?? 0) > 20 && (
          <p>Showing first 20 of {elementsData.bodyElements.length} elements</p>
        )}
      </section>
    </main>
  );
}

export default App;
