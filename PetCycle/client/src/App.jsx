import "bootstrap/dist/css/bootstrap.min.css"; // Bootstrap CSS 임포트
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import { RouterProvider } from "react-router-dom";
import root from "./router/root";

function App() {
  return <RouterProvider router={root} />;
}

export default App;
