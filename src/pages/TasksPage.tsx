import {
  type ChangeEvent,
  type FormEvent,
  useEffect,
  useState,
} from "react";
import { taskService } from "../api/taskService";
import { ErrorState } from "../components/ErrorState";
import { LoadingState } from "../components/LoadingState";
import type { Task, TaskInput } from "../types/task";
import { getApiErrorMessage } from "../utils/apiError";

const initialForm: TaskInput = {
  title: "",
  description: "",
  status: "pending",
  dueDate: "",
};

function convertToDateTimeLocal(dateValue: string): string {
  const date = new Date(dateValue);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const timezoneOffset = date.getTimezoneOffset() * 60_000;
  const localDate = new Date(date.getTime() - timezoneOffset);

  return localDate.toISOString().slice(0, 16);
}

export function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [form, setForm] = useState<TaskInput>(initialForm);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [deletingTaskId, setDeletingTaskId] = useState<string | null>(
    null,
  );

  const [error, setError] = useState("");
  const [formError, setFormError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [reloadToken, setReloadToken] = useState(0);

  useEffect(() => {
    const controller = new AbortController();

    const fetchTasks = async () => {
      try {
        const response = await taskService.getTasks(
          controller.signal,
        );

        if (controller.signal.aborted) {
          return;
        }

        setTasks(response);
        setError("");
      } catch (requestError) {
        if (controller.signal.aborted) {
          return;
        }

        setError(
          getApiErrorMessage(
            requestError,
            "The tasks could not be loaded.",
          ),
        );
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    };

    void fetchTasks();

    return () => {
      controller.abort();
    };
  }, [reloadToken]);

  const refreshTasks = () => {
    setIsLoading(true);
    setError("");
    setReloadToken((current) => current + 1);
  };

  const handleInputChange = (
    event: ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement
    >,
  ) => {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const resetForm = () => {
    setForm(initialForm);
    setEditingTask(null);
    setFormError("");
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!form.title.trim()) {
      setFormError("Task title is required.");
      return;
    }

    if (!form.status.trim()) {
      setFormError("Task status is required.");
      return;
    }

    if (!form.dueDate) {
      setFormError("Due date is required.");
      return;
    }

    setIsSaving(true);
    setFormError("");
    setSuccessMessage("");

    const input: TaskInput = {
      title: form.title.trim(),
      description: form.description.trim(),
      status: form.status.trim(),
      dueDate: new Date(form.dueDate).toISOString(),
    };

    try {
      if (editingTask) {
        await taskService.updateTask(editingTask._id, input);
        setSuccessMessage("Task updated successfully.");
      } else {
        await taskService.createTask(input);
        setSuccessMessage("Task created successfully.");
      }

      resetForm();
      refreshTasks();
    } catch (requestError) {
      setFormError(
        getApiErrorMessage(
          requestError,
          "The task could not be saved.",
        ),
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleEdit = (task: Task) => {
    setEditingTask(task);
    setFormError("");
    setSuccessMessage("");

    setForm({
      title: task.title,
      description: task.description,
      status: task.status,
      dueDate: convertToDateTimeLocal(task.dueDate),
    });

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const handleDelete = async (task: Task) => {
    const shouldDelete = window.confirm(
      `Delete "${task.title}"? This action cannot be undone.`,
    );

    if (!shouldDelete) {
      return;
    }

    setDeletingTaskId(task._id);
    setError("");
    setSuccessMessage("");

    try {
      await taskService.deleteTask(task._id);

      if (editingTask?._id === task._id) {
        resetForm();
      }

      setSuccessMessage("Task deleted successfully.");
      refreshTasks();
    } catch (requestError) {
      setError(
        getApiErrorMessage(
          requestError,
          "The task could not be deleted.",
        ),
      );
    } finally {
      setDeletingTaskId(null);
    }
  };

  return (
    <main className="tasks-page">
      <section className="tasks-heading">
        <div>
          <p className="eyebrow">Task management</p>
          <h1>Tasks</h1>
          <p>Create, update and manage your tasks.</p>
        </div>

        <div className="task-count">
          <strong>{tasks.length}</strong>
          <span>Total tasks</span>
        </div>
      </section>

      <section className="task-form-card">
        <div className="section-heading compact">
          <div>
            <h2>{editingTask ? "Update task" : "Create task"}</h2>
            <p>
              {editingTask
                ? "Edit the selected task information."
                : "Add a new task to the list."}
            </p>
          </div>
        </div>

        <form className="task-form" onSubmit={handleSubmit}>
          <div className="task-form-grid">
            <label>
              Title
              <input
                name="title"
                onChange={handleInputChange}
                placeholder="Enter task title"
                required
                type="text"
                value={form.title}
              />
            </label>

            <label>
              Status
              <input
                name="status"
                onChange={handleInputChange}
                placeholder="pending"
                required
                type="text"
                value={form.status}
              />
            </label>

            <label>
              Due date
              <input
                name="dueDate"
                onChange={handleInputChange}
                required
                type="datetime-local"
                value={form.dueDate}
              />
            </label>
          </div>

          <label>
            Description
            <textarea
              name="description"
              onChange={handleInputChange}
              placeholder="Enter task description"
              rows={4}
              value={form.description}
            />
          </label>

          {formError && (
            <p className="error-message" role="alert">
              {formError}
            </p>
          )}

          <div className="task-form-actions">
            <button
              className="primary-button"
              disabled={isSaving}
              type="submit"
            >
              {isSaving
                ? "Saving…"
                : editingTask
                  ? "Update task"
                  : "Create task"}
            </button>

            {editingTask && (
              <button
                className="ghost-button"
                disabled={isSaving}
                onClick={resetForm}
                type="button"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </section>

      {successMessage && (
        <p className="success-message" role="status">
          {successMessage}
        </p>
      )}

      <section className="task-list-card">
        <div className="section-heading compact">
          <div>
            <h2>Task list</h2>
            <p>Review and manage all existing tasks.</p>
          </div>
        </div>

        {isLoading ? (
          <LoadingState message="Loading tasks…" />
        ) : error ? (
          <ErrorState message={error} onRetry={refreshTasks} />
        ) : tasks.length === 0 ? (
          <div className="empty-state">
            <h2>No tasks found</h2>
            <p>Create your first task using the form above.</p>
          </div>
        ) : (
          <div className="task-list">
            {tasks.map((task) => (
              <article className="task-card" key={task._id}>
                <div className="task-card-content">
                  <div className="task-card-header">
                    <h3>{task.title}</h3>
                    <span className="task-status">
                      {task.status}
                    </span>
                  </div>

                  <p>
                    {task.description || "No description provided."}
                  </p>

                  <div className="task-meta">
                    <span>
                      <strong>Due:</strong>{" "}
                      {new Date(task.dueDate).toLocaleString()}
                    </span>

                    <span>
                      <strong>Updated:</strong>{" "}
                      {new Date(task.updatedAt).toLocaleString()}
                    </span>
                  </div>
                </div>

                <div className="task-actions">
                  <button
                    className="ghost-button"
                    onClick={() => handleEdit(task)}
                    type="button"
                  >
                    Edit
                  </button>

                  <button
                    className="danger-button subtle"
                    disabled={deletingTaskId === task._id}
                    onClick={() => void handleDelete(task)}
                    type="button"
                  >
                    {deletingTaskId === task._id
                      ? "Deleting…"
                      : "Delete"}
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}