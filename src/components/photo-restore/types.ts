export interface Task {
  id: string;
  file: File;
  originalPreview: string;
  restoredPreview: string | null;
  status: "pending" | "processing" | "done" | "error";
  errorMsg: string | null;
  mimeType: string;
}
