import { render, screen } from "@testing-library/react";
import App from "./App";

// مسح localStorage قبل كل اختبار لضمان العزل
beforeEach(() => {
  localStorage.clear();
});

test("renders the React Cookies heading", () => {
  render(<App />);
  expect(screen.getByText(/React Cookies/i)).toBeInTheDocument();
});

test("renders all four action buttons", () => {
  render(<App />);
  expect(screen.getByText("All Cookies")).toBeInTheDocument();
  expect(screen.getByText("Update/Add Cookie")).toBeInTheDocument();
  expect(screen.getByText("Display Cookie")).toBeInTheDocument();
  expect(screen.getByText("Delete Cookie")).toBeInTheDocument();
});
