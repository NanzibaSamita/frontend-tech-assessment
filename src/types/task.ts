export interface Task {
  _id: string;
  title: string;
  description: string;
  status: string;
  dueDate: string;
  createdAt: string;
  updatedAt: string;
}

export interface TaskInput {
  title: string;
  description: string;
  status: string;
  dueDate: string;
}

export interface DeleteTaskResponse {
  message: string;
}