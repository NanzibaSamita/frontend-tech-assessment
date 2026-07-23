import { publicClient } from "./httpClients";
import type {
  DeleteTaskResponse,
  Task,
  TaskInput,
} from "../types/task";

export const taskService = {
  async getTasks(signal?: AbortSignal): Promise<Task[]> {
    const response = await publicClient.get<Task[]>("/tasks", {
      signal,
    });

    return response.data;
  },

  async getTask(id: string): Promise<Task> {
    const response = await publicClient.get<Task>(`/tasks/${id}`);

    return response.data;
  },

  async createTask(input: TaskInput): Promise<Task> {
    const response = await publicClient.post<Task>("/tasks", input);

    return response.data;
  },

  async updateTask(id: string, input: TaskInput): Promise<Task> {
    const response = await publicClient.put<Task>(
      `/tasks/${id}`,
      input,
    );

    return response.data;
  },

  async deleteTask(id: string): Promise<DeleteTaskResponse> {
    const response = await publicClient.delete<DeleteTaskResponse>(
      `/tasks/${id}`,
    );

    return response.data;
  },
};