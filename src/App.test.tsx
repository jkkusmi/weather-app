import App from "./App";
import { renderWithProviders } from "./test/renderWithProviders.tsx";

test("app loads without crashing", () => {
  renderWithProviders(<App />);
});