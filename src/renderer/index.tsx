import { render } from "react-dom";

import App from "./App";
import { ServiceProvider } from "./services";
import installServices from "./services/installServices";

const services = installServices();

render(
  <ServiceProvider value={services}>
    <App />
  </ServiceProvider>,
  document.getElementById("app"),
);
