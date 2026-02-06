import "@testing-library/jest-dom";
import { vi } from "vitest";

vi.stubGlobal(
  "fetch",
  async (input: RequestInfo | URL) => {
    if (typeof input === "string" && input.endsWith("cities_list.csv")) {
      return {
        ok: true,
        text: async () => "city,country\nParis,FR\nBerlin,DE"
      } as Response;
    }

    throw new Error(`Unhandled fetch: ${String(input)}`);
  }
);
