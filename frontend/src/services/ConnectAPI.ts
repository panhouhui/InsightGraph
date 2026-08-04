import api, { createCredentialsFormData } from '../API/Index';
import { UserCredentials } from '../types';

const connectAPI = async (userCredentials: UserCredentials) => {
  try {
    const formData = createCredentialsFormData(userCredentials);
    const response = await api.post(`/connect`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response;
  } catch (error) {
    console.log('Error in connecting to the Neo4j instance :', error);
    throw error;
  }
};

const envConnectionAPI = async () => {
  try {
    const connectionUrl = `/backend_connection_configuration`;
    const response = await api.post(connectionUrl);
    return response;
  } catch (error) {
    console.log('API Connection error', error);
    throw error;
  }
};

const readStoredNeo4jCredentials = (): UserCredentials | null => {
  const storedCredentials = localStorage.getItem('neo4j.connection');
  if (!storedCredentials) {
    return null;
  }

  const credentials = JSON.parse(storedCredentials) as UserCredentials;
  if (credentials.password) {
    credentials.password = atob(credentials.password);
  }
  return credentials;
};

const reconnectStoredNeo4jCredentials = async (email?: string) => {
  const credentials = readStoredNeo4jCredentials();
  if (!credentials) {
    return null;
  }

  credentials.email = email || credentials.email || localStorage.getItem('currentUserEmail') || '';
  const response = await connectAPI(credentials);
  return { credentials, response };
};

export { connectAPI, envConnectionAPI, readStoredNeo4jCredentials, reconnectStoredNeo4jCredentials };
