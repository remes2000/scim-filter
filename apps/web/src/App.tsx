import { useMemo, useState } from "react";
import { createFilter } from "@scim-filter/jspredicate";
import { ScimFilterError } from "@scim-filter/parse";
import { SAMPLE_DATA } from "./data";
import "./App.css";

const EXAMPLE_FILTERS = [
  'firstName eq "Michal"',
  'age gt 30',
  'address.city eq "Poznan"',
  'lastName sw "K"',
  'age ge 30 and address.city eq "Krakow"',
];

function ExampleFilter({ filter, onClick }: { filter: string; onClick: (filter: string) => void }) {
  return (
    <li>
      <code className="example-filter" onClick={() => onClick(filter)}>{filter}</code>
    </li>
  );
}

function App() {
  const [filter, setFilter] = useState('');

  const { matched, error } = useMemo(() => {
    if (!filter.trim()) {
      return { matched: SAMPLE_DATA, error: null };
    }
    try {
      return {
        matched: SAMPLE_DATA.filter(createFilter(filter)),
        error: null 
      };
    } catch (e) {
      if (e instanceof ScimFilterError) {
        return { 
          matched: SAMPLE_DATA,
          error: e.message
        };
      } else {
        return {
          matched: SAMPLE_DATA,
          error: 'Unexpected error: ' + (e instanceof Error ? e.message : String(e))
        };
      }
    }
  }, [ filter ]);

  return (
    <div className="app">
      <div className="search-panel">
        <h1>SCIM Filter Demo</h1>
        <p className="subtitle">
          Type a SCIM filter expression to filter the dataset in real time.
        </p>
        <input
          className="filter-input"
          type="text"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          placeholder='e.g. firstName eq "Michal"'
          spellCheck={false}
        />
        {error && <div className="error">{error}</div>}
        <div className="match-count">
          {filter.trim() && !error
            ? `${matched.length} of ${SAMPLE_DATA.length} items match`
            : `${SAMPLE_DATA.length} items`}
        </div>
        <div className="examples">
          <p>Try these filters:</p>
          <ul>
            <li>
              <button className="clear-filter" onClick={() => setFilter('')}>Clear</button>
            </li>
            {EXAMPLE_FILTERS.map((f) => (
              <ExampleFilter key={f} filter={f} onClick={setFilter} />
            ))}
          </ul>
        </div>
      </div>
      <div className="cards">
        {matched.map((item, i) => (
          <div className="card" key={i}>
            <div className="card-row">
              <span className="key">firstName</span>
              <span className="value string">"{item.firstName}"</span>
            </div>
            <div className="card-row">
              <span className="key">lastName</span>
              <span className="value string">"{item.lastName}"</span>
            </div>
            <div className="card-row">
              <span className="key">age</span>
              <span className="value number">{item.age}</span>
            </div>
            <div className="card-row">
              <span className="key">address.city</span>
              <span className="value string">"{item.address.city}"</span>
            </div>
            <div className="card-row">
              <span className="key">address.street</span>
              <span className="value string">"{item.address.street}"</span>
            </div>
          </div>
        ))}
        {matched.length === 0 && (
          <div className="no-results">No items match the filter.</div>
        )}
      </div>
    </div>
  );
}

export default App;
