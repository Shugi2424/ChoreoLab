// @vitest-environment jsdom
import { ApolloError } from "@apollo/client";
import { MockedProvider } from "@apollo/client/testing";
import { ThemeProvider } from "@mui/material";
import { fireEvent, render, screen, cleanup, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { afterEach, describe, expect, it, vi } from "vitest";
import { LoginPage } from "./LoginPage";
import { theme } from "../theme/theme";
import { LOGIN_MUTATION } from "../graphql/mutations";

vi.mock("../auth/AuthContext", () => ({
  useAuth: () => ({
    loginWithToken: vi.fn(),
    isAuthenticated: false,
  }),
}));

afterEach(() => {
  cleanup();
});

function renderLoginPage(mocks: Parameters<typeof MockedProvider>[0]["mocks"] = []) {
  return render(
    <ThemeProvider theme={theme}>
      <MockedProvider mocks={mocks}>
        <MemoryRouter>
          <LoginPage />
        </MemoryRouter>
      </MockedProvider>
    </ThemeProvider>,
  );
}

describe("LoginPage", () => {
  it("renders branded login form fields", () => {
    renderLoginPage();

    expect(screen.getByRole("heading", { name: "Login" })).toBeInTheDocument();
    expect(screen.getByRole("textbox", { name: /email/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/^password/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Log in" })).toBeInTheDocument();
  });

  it("surfaces network login errors in an alert", async () => {
    renderLoginPage([
      {
        request: {
          query: LOGIN_MUTATION,
          variables: { input: { email: "coach@test.com", password: "wrong-pass" } },
        },
        error: new ApolloError({ networkError: new Error("fetch failed") }),
      },
    ]);

    fireEvent.change(screen.getByRole("textbox", { name: /email/i }), {
      target: { value: "coach@test.com" },
    });
    fireEvent.change(screen.getByLabelText(/^password/i), {
      target: { value: "wrong-pass" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Log in" }));

    await waitFor(() => {
      expect(
        screen.getByText("Cannot reach the server. Make sure the API is running on port 4000."),
      ).toBeInTheDocument();
    });
  });
});
