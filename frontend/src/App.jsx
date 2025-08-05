import { Outlet, Link } from "react-router-dom";

function App() {
  return (
    <div>
      {/* <h1>SmartBudget</h1> */}

      <main>
        <Outlet /> {/* This renders the child routes */}
      </main>
    </div>
  );
}

export default App;
