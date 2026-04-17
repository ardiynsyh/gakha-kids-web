import { createRoot } from "react-dom/client";

function App() {
  return (
    <div style={{ padding: '100px', background: 'blue', color: 'white', fontSize: '30px' }}>
      <h1>REACT IS RENDERING</h1>
      <p>Time: {new Date().toLocaleTimeString()}</p>
    </div>
  );
}

createRoot(document.getElementById("root")).render(<App />);