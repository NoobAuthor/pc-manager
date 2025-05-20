import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { toast } from "react-hot-toast";
import axios from "axios";
import ProjectForm from "../ProjectForm";

// Mock dependencies
jest.mock("axios");
jest.mock("react-hot-toast", () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));
jest.mock("next/navigation", () => ({
  useRouter: () => ({
    refresh: jest.fn(),
  }),
}));

describe("ProjectForm", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("renders form elements correctly", () => {
    render(<ProjectForm />);

    expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/description/i)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /create project/i }),
    ).toBeInTheDocument();
  });

  test("shows validation errors when submitting empty form", async () => {
    render(<ProjectForm />);

    fireEvent.click(screen.getByRole("button", { name: /create project/i }));

    await waitFor(() => {
      expect(screen.getByText(/name is required/i)).toBeInTheDocument();
      expect(screen.getByText(/description is required/i)).toBeInTheDocument();
    });
  });

  test("creates a new project successfully", async () => {
    (axios.post as jest.Mock).mockResolvedValueOnce({});

    render(<ProjectForm />);

    await userEvent.type(screen.getByLabelText(/name/i), "Test Project");
    await userEvent.type(
      screen.getByLabelText(/description/i),
      "Test Description",
    );

    fireEvent.click(screen.getByRole("button", { name: /create project/i }));

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith("/api/projects", {
        name: "Test Project",
        description: "Test Description",
        slug: "test-project",
      });
      expect(toast.success).toHaveBeenCalledWith(
        "Project created successfully",
      );
    });
  });

  test("handles API errors correctly", async () => {
    (axios.post as jest.Mock).mockRejectedValueOnce(new Error("API Error"));

    render(<ProjectForm />);

    await userEvent.type(screen.getByLabelText(/name/i), "Test Project");
    await userEvent.type(
      screen.getByLabelText(/description/i),
      "Test Description",
    );

    fireEvent.click(screen.getByRole("button", { name: /create project/i }));

    await waitFor(() => {
      expect(console.error).toHaveBeenCalled();
      expect(toast.error).toHaveBeenCalledWith(
        "Something went wrong. Please try again.",
      );
    });
  });

  test("updates a project in edit mode", async () => {
    (axios.patch as jest.Mock).mockResolvedValueOnce({});

    render(
      <ProjectForm
        projectId="123"
        defaultValues={{
          name: "Existing Project",
          description: "Existing Description",
          slug: "existing-project",
        }}
      />,
    );

    expect(screen.getByLabelText(/name/i)).toHaveValue("Existing Project");
    expect(screen.getByLabelText(/description/i)).toHaveValue(
      "Existing Description",
    );

    await userEvent.clear(screen.getByLabelText(/name/i));
    await userEvent.type(screen.getByLabelText(/name/i), "Updated Project");

    fireEvent.click(screen.getByRole("button", { name: /update project/i }));

    await waitFor(() => {
      expect(axios.patch).toHaveBeenCalledWith("/api/projects", {
        name: "Updated Project",
        description: "Existing Description",
        slug: "updated-project",
        id: "123",
      });
      expect(toast.success).toHaveBeenCalledWith(
        "Project updated successfully",
      );
    });
  });
});
