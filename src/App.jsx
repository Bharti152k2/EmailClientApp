import EmailList from "./components/EmailList";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
function App() {
  return (
    <>
      <Router>
        <Routes>
          <Route path="/" element={<Navigate to="/List-of-emails" />} />
          <Route path="List-of-emails" element={<EmailList />} />
          {/* <Route path="/email/:id" element={<EmailList />} /> */}
        </Routes>
      </Router>
    </>
  );
}

export default App;
