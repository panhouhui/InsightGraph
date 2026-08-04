import { PollingAPI_Response, statusupdate } from '../types';
import api from '../API/Index';
import { reconnectStoredNeo4jCredentials } from './ConnectAPI';

export default async function subscribe(
  fileName: string,
  datahandler: (i: statusupdate) => void,
  progressHandler: (i: statusupdate) => void
) {
  const MAX_POLLING_ATTEMPTS = 10;
  let pollingAttempts = 0;
  let delay = 1000;
  let didReconnect = false;

  // Credentials are retrieved from server-side session (stored via /connect or /upload)
  // No credentials sent in query params for security
  const endpoint = `/document_status/${fileName}`;

  while (pollingAttempts < MAX_POLLING_ATTEMPTS) {
    let currentDelay = delay;
    let response: PollingAPI_Response;
    try {
      response = await api.get(endpoint);
    } catch (error: any) {
      if (!didReconnect && error?.response?.status === 401) {
        didReconnect = true;
        await reconnectStoredNeo4jCredentials();
        continue;
      }
      throw error;
    }
    if (response.data?.file_name?.status === 'Processing') {
      progressHandler(response.data);
      await new Promise((resolve) => setTimeout(resolve, currentDelay));
      delay *= 2;
      pollingAttempts++;
    } else if (response.status !== 200) {
      throw new Error(
        JSON.stringify({ fileName, message: `Failed To Process ${fileName} or LLM Unable To Parse Content` })
      );
    } else {
      datahandler(response.data);
      return;
    }
  }
  throw new Error(`Polling for ${fileName} timed out after ${MAX_POLLING_ATTEMPTS} attempts.`);
}
