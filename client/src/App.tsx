import { useQuery } from "@apollo/client";
import { ELEMENTS_QUERY, HEALTH_QUERY } from "./apollo/client";
import "./App.css";

function App() {
  const { data: healthData, loading: healthLoading } = useQuery(HEALTH_QUERY);
  const { data: elementsData, loading: elementsLoading, error } = useQuery(ELEMENTS_QUERY);

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

      <section>
        <h2>Elements</h2>
        {elementsLoading && <p>Loading elements…</p>}
        {error && <p className="error">Could not load elements. Is the server running?</p>}
        {!elementsLoading && !error && (
          <ul className="element-list">
            {(elementsData?.elements ?? []).map((el: {
              id: string;
              code: string;
              name: string;
              apparatus: string;
              difficulty: number;
            }) => (
              <li key={el.id}>
                <strong>{el.code}</strong> — {el.name}
                <span>
                  {el.apparatus} · D{el.difficulty}
                </span>
              </li>
            ))}
          </ul>
        )}
        {!elementsLoading && !error && elementsData?.elements?.length === 0 && (
          <p>No elements yet. Seed the database or add docs under <code>docs/</code>.</p>
        )}
      </section>
    </main>
  );
}

export default App;
