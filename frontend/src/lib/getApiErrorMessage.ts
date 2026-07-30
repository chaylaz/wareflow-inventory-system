import axios from "axios";

type ApiProblemDetails = {
  title?: string;
  detail?: string;
  errors?: Record<string, string[]>;
};

export function getApiErrorMessage(
  error: unknown,
  fallbackMessage: string
) {
  if (!axios.isAxiosError<ApiProblemDetails>(error)) {
    return fallbackMessage;
  }

  const responseData = error.response?.data;

  if (!responseData) {
    return fallbackMessage;
  }

  if (responseData.errors) {
    const validationMessages = Object.values(
      responseData.errors
    ).flat();

    if (validationMessages.length > 0) {
      return validationMessages[0];
    }
  }

  return (
    responseData.detail ??
    responseData.title ??
    fallbackMessage
  );
}