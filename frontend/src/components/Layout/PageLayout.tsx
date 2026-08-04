import { Dispatch, lazy, SetStateAction, Suspense, useCallback, useEffect, useMemo, useReducer, useState } from 'react';
import AppSidebar, { WorkspacePanel } from './AppSidebar';
import SourcePanel from './SourcePanel';
import ChatWorkspace from './ChatWorkspace';
import ModelConfigPanel from './ModelConfigPanel';
import Content from '../Content';
import { clearChatAPI, getChatHistoryAPI } from '../../services/QnaAPI';
import { useCredentials } from '../../context/UserCredentials';
import { connectionState, Messages, OptionType } from '../../types';
import { useMessageContext } from '../../context/UserMessages';
import { Spotlight, SpotlightTour, useSpotlightContext } from '@neo4j-ndl/react';
import { useFileContext } from '../../context/UsersFiles';
import SchemaFromTextDialog from '../../components/Popups/GraphEnhancementDialog/EnitityExtraction/SchemaFromTextDialog';
import useSpeechSynthesis from '../../hooks/useSpeech';
import FallBackDialog from '../UI/FallBackDialog';
import { envConnectionAPI, reconnectStoredNeo4jCredentials } from '../../services/ConnectAPI';
import { healthStatus } from '../../services/HealthStatus';
import { verifyAuthAPI } from '../../services/AuthVerify';
import { useAuth0 } from '@auth0/auth0-react';
import { showErrorToast } from '../../utils/Toasts';
import { createDefaultFormData } from '../../API/Index';
import LoadDBSchemaDialog from '../Popups/GraphEnhancementDialog/EnitityExtraction/LoadExistingSchema';
import PredefinedSchemaDialog from '../Popups/GraphEnhancementDialog/EnitityExtraction/PredefinedSchemaDialog';
import { SKIP_AUTH } from '../../utils/Constants';
import { useNavigate } from 'react-router';
import {
  convertChatHistoryToMessages,
  deduplicateByFullPattern,
  deduplicateNodeByValue,
  fetchAndStoreEmbeddingSettings,
} from '../../utils/Utils';
import DataImporterSchemaDialog from '../Popups/GraphEnhancementDialog/EnitityExtraction/DataImporter';

const loadChatHistory = async (setMessages: Dispatch<SetStateAction<Messages[]>>) => {
  try {
    const chatHistoryResponse = await getChatHistoryAPI();
    const history = chatHistoryResponse?.data?.data?.messages;
    if (Array.isArray(history) && history.length) {
      setMessages(convertChatHistoryToMessages(history));
    }
  } catch (error) {
    console.log('Error loading chat history:', error);
  }
};
const ConnectionModal = lazy(() => import('../Popups/ConnectionModal/ConnectionModal'));
const spotlightsforunauthenticated = [
  {
    target: 'loginbutton',
    children: (
      <>
        <Spotlight.Header>使用 Neo4j 登录</Spotlight.Header>
        <Spotlight.Body>使用 Google 账号或邮箱地址登录</Spotlight.Body>
      </>
    ),
  },
  {
    target: 'connectbutton',
    children: (
      <>
        <Spotlight.Header>连接 Neo4j 数据库</Spotlight.Header>
        <Spotlight.Body>填写 Neo4j 凭据后点击连接</Spotlight.Body>
      </>
    ),
  },
  {
    target: 'dropzone',
    children: (
      <>
        <Spotlight.Header>上传文档</Spotlight.Header>
        <Spotlight.Body>上传任意非结构化文件</Spotlight.Body>
      </>
    ),
  },
  {
    target: 'llmdropdown',
    children: (
      <>
        <Spotlight.Header>选择需要的 LLM</Spotlight.Header>
      </>
    ),
  },
  {
    target: 'generategraphbtn',
    children: (
      <>
        <Spotlight.Header>开始抽取流程</Spotlight.Header>
        <Spotlight.Body>点击生成图谱</Spotlight.Body>
      </>
    ),
  },
  {
    target: 'visualizegraphbtn',
    children: (
      <>
        <Spotlight.Header>可视化知识图谱</Spotlight.Header>
        <Spotlight.Body>从表格中选择至少一个已完成文件进行可视化</Spotlight.Body>
      </>
    ),
  },
  {
    target: 'chatbtn',
    children: (
      <>
        <Spotlight.Header>围绕文档提问</Spotlight.Header>
      </>
    ),
  },
];
const spotlights = [
  {
    target: 'connectbutton',
    children: (
      <>
        <Spotlight.Header>连接 Neo4j 数据库</Spotlight.Header>
        <Spotlight.Body>填写 Neo4j 凭据后点击连接</Spotlight.Body>
      </>
    ),
  },
  {
    target: 'dropzone',
    children: (
      <>
        <Spotlight.Header>上传文档</Spotlight.Header>
        <Spotlight.Body>上传任意非结构化文件</Spotlight.Body>
      </>
    ),
  },
  {
    target: 'llmdropdown',
    children: (
      <>
        <Spotlight.Header>选择需要的 LLM</Spotlight.Header>
      </>
    ),
  },
  {
    target: 'generategraphbtn',
    children: (
      <>
        <Spotlight.Header>开始抽取流程</Spotlight.Header>
        <Spotlight.Body>点击生成图谱</Spotlight.Body>
      </>
    ),
  },
  {
    target: 'visualizegraphbtn',
    children: (
      <>
        <Spotlight.Header>可视化知识图谱</Spotlight.Header>
        <Spotlight.Body>从表格中选择至少一个已完成文件进行可视化</Spotlight.Body>
      </>
    ),
  },
  {
    target: 'chatbtn',
    children: (
      <>
        <Spotlight.Header>围绕文档提问</Spotlight.Header>
      </>
    ),
  },
];
const PageLayout: React.FC = () => {
  const [openConnection, setOpenConnection] = useState<connectionState>({
    openPopUp: false,
    chunksExists: false,
    vectorIndexMisMatch: false,
    chunksExistsWithDifferentDimension: false,
  });
  const [activePanel, setActivePanel] = useState<WorkspacePanel>('documents');
  const [showEnhancementDialog, toggleEnhancementDialog] = useReducer((s) => !s, false);
  const [shows3Modal, toggleS3Modal] = useReducer((s) => !s, false);
  const [showGCSModal, toggleGCSModal] = useReducer((s) => !s, false);
  const [showGenericModal, toggleGenericModal] = useReducer((s) => !s, false);
  const {
    connectionStatus,
    setIsReadOnlyUser,
    setConnectionStatus,
    setGdsActive,
    setIsBackendConnected,
    setUserCredentials,
    setErrorMessage,
    setShowDisconnectButton,
    showDisconnectButton,
    setIsGCSActive,
  } = useCredentials();
  const {
    setShowTextFromSchemaDialog,
    showTextFromSchemaDialog,
    setSchemaTextPattern,
    schemaLoadDialog,
    setSchemaLoadDialog,
    setPredefinedSchemaDialog,
    setDbPattern,
    setSchemaValNodes,
    predefinedSchemaDialog,
    setSchemaValRels,
    setDbNodes,
    setDbRels,
    setPreDefinedNodes,
    setPreDefinedRels,
    setPreDefinedPattern,
    allPatterns,
    selectedNodes,
    selectedRels,
    dataImporterSchemaDialog,
    setDataImporterSchemaDialog,
    setImporterPattern,
    setImporterNodes,
    setImporterRels,
    setSourceOptions,
    setTargetOptions,
    setTypeOptions,
  } = useFileContext();
  const navigate = useNavigate();
  const { user, isAuthenticated, isLoading: isAuthLoading } = useAuth0();

  useEffect(() => {
    try {
      const email = user?.email?.trim();
      if (isAuthenticated && email) {
        localStorage.setItem('currentUserEmail', email);
        const existing = localStorage.getItem('neo4j.connection');
        if (existing) {
          const parsed = JSON.parse(existing);
          parsed.email = email;
          localStorage.setItem('neo4j.connection', JSON.stringify(parsed));
        }
      } else if (!isAuthenticated) {
        localStorage.removeItem('currentUserEmail');
        const existing = localStorage.getItem('neo4j.connection');
        if (existing) {
          const parsed = JSON.parse(existing);
          parsed.email = '';
          localStorage.setItem('neo4j.connection', JSON.stringify(parsed));
        }
      }
    } catch (e) {
      console.warn('localStorage email sync failed', e);
    }
  }, [isAuthenticated, user?.email]);

  const { cancel } = useSpeechSynthesis();
  const { setActiveSpotlight } = useSpotlightContext();
  const { messages, setClearHistoryData, clearHistoryData, setMessages, setIsDeleteChatLoading } = useMessageContext();
  const isFirstTimeUser = useMemo(() => localStorage.getItem('neo4j.connection') === null, []);

  const [combinedPatternsVal, setCombinedPatternsVal] = useState<string[]>([]);
  const [combinedNodesVal, setCombinedNodesVal] = useState<OptionType[]>([]);
  const [combinedRelsVal, setCombinedRelsVal] = useState<OptionType[]>([]);

  useEffect(() => {
    if (allPatterns.length > 0 && selectedNodes.length > 0 && selectedRels.length > 0) {
      setCombinedPatternsVal(allPatterns);
      setCombinedNodesVal(selectedNodes as OptionType[]);
      setCombinedRelsVal(selectedRels as OptionType[]);
    }
  }, [allPatterns, selectedNodes, selectedRels]);

  useEffect(() => {
    // Wait until Auth0 has restored the session (refresh / new tab) so startup calls
    // carry a valid bearer token and this effect does not run twice per page load.
    if (!SKIP_AUTH && isAuthLoading) {
      return;
    }
    async function initializeConnection() {
      // Verify authentication before any other API call
      if (!SKIP_AUTH && isAuthenticated) {
        const isTokenValid = await verifyAuthAPI();
        if (!isTokenValid) {
          showErrorToast('会话验证失败，请重新登录。');
          return;
        }
      }
      // Fetch backend health status
      try {
        const response = await healthStatus();
        setIsBackendConnected(response.data.healthy);
      } catch (error) {
        setIsBackendConnected(false);
      }
      // To set the disconnect button state
      const handleDisconnectButtonState = (isModalOpen: boolean) => {
        setShowDisconnectButton(isModalOpen);
        localStorage.setItem('disconnectButtonState', isModalOpen ? 'true' : 'false');
      };
      try {
        const backendApiResponse = await envConnectionAPI();
        const connectionData = backendApiResponse.data;
        console.log('Connection Data:', connectionData.data);
        if (connectionData.data && connectionData.status === 'Success') {
          localStorage.setItem(
            'embedding.dimensions',
            JSON.stringify({
              db_vector_dimension: connectionData.data.db_vector_dimension,
              application_dimension: connectionData.data.application_dimension,
              userDbVectorIndex: connectionData.data.db_vector_dimension,
            })
          );

          const credentials = {
            uri: connectionData.data.uri,
            isReadonlyUser: !connectionData.data.write_access,
            isgdsActive: connectionData.data.gds_status,
            isGCSActive: connectionData.data.gcs_file_cache === 'True',
            chunksTobeProcess: Number(connectionData.data.chunk_to_be_created),
            email: user?.email ?? '',
            connection: 'backendApi',
            database: connectionData.data.database,
          };
          setIsGCSActive(credentials.isGCSActive);
          setUserCredentials(credentials);
          createDefaultFormData({ uri: credentials.uri, email: credentials.email ?? '' });
          setGdsActive(credentials.isgdsActive);
          setConnectionStatus(Boolean(connectionData.data.graph_connection));
          setIsReadOnlyUser(!connectionData.data.write_access);
          handleDisconnectButtonState(false);
          await fetchAndStoreEmbeddingSettings(credentials.uri, credentials.email ?? '');
          if (connectionData.data.graph_connection) {
            await loadChatHistory(setMessages);
          }
        } else if (!connectionData.data && connectionData.status === 'Success') {
          const reconnectResult = await reconnectStoredNeo4jCredentials(user?.email ?? '');
          if (reconnectResult) {
            const { credentials, response } = reconnectResult;
            const reconnectData = response.data;
            setUserCredentials(credentials);
            createDefaultFormData({
              uri: credentials.uri,
              database: credentials.database,
              userName: credentials.userName,
              password: credentials.password,
              email: credentials.email,
            });
            setIsGCSActive(credentials.isGCSActive);
            setGdsActive(credentials.isgdsActive);
            setConnectionStatus(Boolean(credentials.connection === 'connectAPI'));
            if (credentials.isReadonlyUser !== undefined) {
              setIsReadOnlyUser(credentials.isReadonlyUser);
            }

            if (reconnectData?.status === 'Success') {
              const result = reconnectData.data ?? {};
              localStorage.setItem(
                'embedding.dimensions',
                JSON.stringify({
                  db_vector_dimension: result.db_vector_dimension,
                  application_dimension: result.application_dimension,
                  userDbVectorIndex: result.db_vector_dimension,
                })
              );
              setIsGCSActive(result.gcs_file_cache === true || result.gcs_file_cache === 'True');
              setGdsActive(Boolean(result.gds_status));
              setIsReadOnlyUser(!result.write_access);
              setConnectionStatus(true);
              handleDisconnectButtonState(true);
              if (credentials.uri) {
                await fetchAndStoreEmbeddingSettings(credentials.uri, credentials.email ?? '');
              }
              await loadChatHistory(setMessages);
            } else {
              setConnectionStatus(false);
              setErrorMessage(reconnectData?.error || reconnectData?.message || 'Neo4j 重新连接失败');
              handleDisconnectButtonState(true);
            }
          } else {
            handleDisconnectButtonState(true);
          }
        } else {
          setErrorMessage(backendApiResponse?.data?.error);
          handleDisconnectButtonState(true);
          console.log('from else cndition error is there');
        }
      } catch (error) {
        if (error instanceof Error) {
          showErrorToast(error.message);
        }
      }
    }
    initializeConnection();
    if (!isAuthenticated && isFirstTimeUser) {
      setActiveSpotlight('loginbutton');
    }

    if ((isAuthenticated || SKIP_AUTH) && isFirstTimeUser) {
      setActiveSpotlight('connectbutton');
    }
  }, [isAuthenticated, isAuthLoading, isFirstTimeUser]);

  const deleteOnClick = useCallback(async () => {
    try {
      setClearHistoryData(true);
      setIsDeleteChatLoading(true);
      cancel();
      const response = await clearChatAPI(sessionStorage.getItem('session_id') ?? '');
      setIsDeleteChatLoading(false);
      if (response.data.status === 'Success') {
        const date = new Date();
        setMessages([
          {
            datetime: `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`,
            id: 2,
            modes: {
              'graph+vector+fulltext': {
                message:
                  '欢迎使用 Neo4j 知识图谱聊天。你可以围绕已经处理完成的文档提问。',
              },
            },
            user: 'chatbot',
            currentMode: 'graph+vector+fulltext',
          },
        ]);
        navigate('.', { replace: true, state: null });
      }
    } catch (error) {
      setIsDeleteChatLoading(false);
      console.log(error);
      setClearHistoryData(false);
    }
  }, []);

  const handleApplyPatternsFromText = useCallback(
    (
      newPatterns: string[],
      nodes: OptionType[],
      rels: OptionType[],
      updatedSource: OptionType[],
      updatedTarget: OptionType[],
      updatedType: OptionType[]
    ) => {
      setSchemaTextPattern((prevPatterns: string[]) => {
        const uniquePatterns = Array.from(new Set([...newPatterns, ...prevPatterns]));
        return uniquePatterns;
      });
      setCombinedPatternsVal((prevPatterns: string[]) => {
        const uniquePatterns = Array.from(new Set([...newPatterns, ...prevPatterns]));
        return uniquePatterns;
      });
      setShowTextFromSchemaDialog({
        triggeredFrom: 'schematextApply',
        show: true,
      });
      setSchemaValNodes(nodes);
      setCombinedNodesVal((prevNodes: OptionType[]) => {
        const combined = [...nodes, ...prevNodes];
        return deduplicateNodeByValue(combined);
      });
      setSchemaValRels(rels);
      setCombinedRelsVal((prevRels: OptionType[]) => {
        const combined = [...rels, ...prevRels];
        return deduplicateByFullPattern(combined);
      });
      setSourceOptions((prev) => [...prev, ...updatedSource]);
      setTargetOptions((prev) => [...prev, ...updatedTarget]);
      setTypeOptions((prev) => [...prev, ...updatedType]);
    },
    []
  );

  const handleDbApply = useCallback(
    (
      newPatterns: string[],
      nodes: OptionType[],
      rels: OptionType[],
      updatedSource: OptionType[],
      updatedTarget: OptionType[],
      updatedType: OptionType[]
    ) => {
      setDbPattern((prevPatterns: string[]) => {
        const uniquePatterns = Array.from(new Set([...newPatterns, ...prevPatterns]));
        return uniquePatterns;
      });
      setCombinedPatternsVal((prevPatterns: string[]) => {
        const uniquePatterns = Array.from(new Set([...newPatterns, ...prevPatterns]));
        return uniquePatterns;
      });
      setSchemaLoadDialog({
        triggeredFrom: 'loadExistingSchemaApply',
        show: true,
      });
      setDbNodes(nodes);
      setCombinedNodesVal((prevNodes: OptionType[]) => {
        const combined = [...nodes, ...prevNodes];
        return deduplicateNodeByValue(combined);
      });
      setDbRels(rels);
      setCombinedRelsVal((prevRels: OptionType[]) => {
        const combined = [...rels, ...prevRels];
        return deduplicateByFullPattern(combined);
      });
      setSourceOptions((prev) => [...prev, ...updatedSource]);
      setTargetOptions((prev) => [...prev, ...updatedTarget]);
      setTypeOptions((prev) => [...prev, ...updatedType]);
    },
    []
  );
  const handlePredinedApply = useCallback(
    (
      newPatterns: string[],
      nodes: OptionType[],
      rels: OptionType[],
      updatedSource: OptionType[],
      updatedTarget: OptionType[],
      updatedType: OptionType[]
    ) => {
      setPreDefinedPattern((prevPatterns: string[]) => {
        const uniquePatterns = Array.from(new Set([...newPatterns, ...prevPatterns]));
        return uniquePatterns;
      });
      setCombinedPatternsVal((prevPatterns: string[]) => {
        const uniquePatterns = Array.from(new Set([...newPatterns, ...prevPatterns]));
        return uniquePatterns;
      });
      setPredefinedSchemaDialog({
        triggeredFrom: 'predefinedSchemaApply',
        show: true,
      });
      setPreDefinedNodes(nodes);
      setCombinedNodesVal((prevNodes: OptionType[]) => {
        const combined = [...nodes, ...prevNodes];
        return deduplicateNodeByValue(combined);
      });
      setPreDefinedRels(rels);
      setCombinedRelsVal((prevRels: OptionType[]) => {
        const combined = [...rels, ...prevRels];
        return deduplicateByFullPattern(combined);
      });
      setSourceOptions((prev) => [...prev, ...updatedSource]);
      setTargetOptions((prev) => [...prev, ...updatedTarget]);
      setTypeOptions((prev) => [...prev, ...updatedType]);
    },
    []
  );

  const handleImporterApply = useCallback(
    (
      newPatterns: string[],
      nodes: OptionType[],
      rels: OptionType[],
      updatedSource: OptionType[],
      updatedTarget: OptionType[],
      updatedType: OptionType[]
    ) => {
      setImporterPattern((prevPatterns: string[]) => {
        const uniquePatterns = Array.from(new Set([...newPatterns, ...prevPatterns]));
        return uniquePatterns;
      });
      setCombinedPatternsVal((prevPatterns: string[]) => {
        const uniquePatterns = Array.from(new Set([...newPatterns, ...prevPatterns]));
        return uniquePatterns;
      });
      setDataImporterSchemaDialog({
        triggeredFrom: 'importerSchemaApply',
        show: true,
      });
      setImporterNodes(nodes);
      setCombinedNodesVal((prevNodes: OptionType[]) => {
        const combined = [...nodes, ...prevNodes];
        return deduplicateNodeByValue(combined);
      });
      setImporterRels(rels);
      setCombinedRelsVal((prevRels: OptionType[]) => {
        const combined = [...rels, ...prevRels];
        return deduplicateByFullPattern(combined);
      });
      setSourceOptions((prev) => [...prev, ...updatedSource]);
      setTargetOptions((prev) => [...prev, ...updatedTarget]);
      setTypeOptions((prev) => [...prev, ...updatedType]);
    },
    []
  );

  const openPredefinedSchema = useCallback(() => {
    setPredefinedSchemaDialog({ triggeredFrom: 'predefinedDialog', show: true });
  }, []);

  const openLoadSchema = useCallback(() => {
    setSchemaLoadDialog({ triggeredFrom: 'loadDialog', show: true });
  }, []);

  const openTextSchema = useCallback(() => {
    setShowTextFromSchemaDialog({ triggeredFrom: 'schemadialog', show: true });
  }, []);

  const openDataImporterSchema = useCallback(() => {
    setDataImporterSchemaDialog({ triggeredFrom: 'schemadialog', show: true });
  }, []);

  const openChatBot = useCallback(() => setActivePanel('chat'), []);

  return (
    <>
      {!isAuthenticated && !SKIP_AUTH && isFirstTimeUser ? (
        <SpotlightTour
          spotlights={spotlightsforunauthenticated}
          onAction={(target, action) => {
            if (target == 'connectbutton' && action == 'next') {
              setActivePanel('sources');
            }
            if (target === 'visualizegraphbtn' && action === 'next') {
              setActivePanel('chat');
            }
            console.log(`Action ${action} was performed in spotlight ${target}`);
          }}
        />
      ) : (isAuthenticated || SKIP_AUTH) && isFirstTimeUser ? (
        <SpotlightTour
          spotlights={spotlights}
          onAction={(target, action) => {
            if (target == 'connectbutton' && action == 'next') {
              setActivePanel('sources');
            }
            if (target === 'visualizegraphbtn' && action === 'next') {
              setActivePanel('chat');
            }
            console.log(`Action ${action} was performed in spotlight ${target}`);
          }}
        />
      ) : null}

      <Suspense fallback={<FallBackDialog />}>
        <ConnectionModal
          open={openConnection.openPopUp}
          setOpenConnection={setOpenConnection}
          setConnectionStatus={setConnectionStatus}
          isVectorIndexMatch={openConnection.vectorIndexMisMatch}
          chunksExistsWithoutEmbedding={openConnection.chunksExists}
          chunksExistsWithDifferentEmbedding={openConnection.chunksExistsWithDifferentDimension}
        />
      </Suspense>
      <SchemaFromTextDialog
        open={showTextFromSchemaDialog.show}
        onClose={() => {
          setShowTextFromSchemaDialog({ triggeredFrom: '', show: false });
          switch (showTextFromSchemaDialog.triggeredFrom) {
            case 'enhancementtab':
              toggleEnhancementDialog();
              break;
            default:
              break;
          }
        }}
        onApply={handleApplyPatternsFromText}
      ></SchemaFromTextDialog>
      <LoadDBSchemaDialog
        open={schemaLoadDialog.show}
        onClose={() => {
          setSchemaLoadDialog({ triggeredFrom: '', show: false });
          switch (schemaLoadDialog.triggeredFrom) {
            case 'enhancementtab':
              toggleEnhancementDialog();
              break;
            default:
              break;
          }
        }}
        onApply={handleDbApply}
      />
      <PredefinedSchemaDialog
        open={predefinedSchemaDialog.show}
        onClose={() => {
          setPredefinedSchemaDialog({ triggeredFrom: '', show: false });
          switch (predefinedSchemaDialog.triggeredFrom) {
            case 'enhancementtab':
              toggleEnhancementDialog();
              break;
            default:
              break;
          }
        }}
        onApply={handlePredinedApply}
      ></PredefinedSchemaDialog>
      <DataImporterSchemaDialog
        open={dataImporterSchemaDialog.show}
        onClose={() => {
          setDataImporterSchemaDialog({ triggeredFrom: '', show: false });
          switch (dataImporterSchemaDialog.triggeredFrom) {
            case 'enhancementtab':
              toggleEnhancementDialog();
              break;
            default:
              break;
          }
        }}
        onApply={handleImporterApply}
      ></DataImporterSchemaDialog>
      <div className='layout-wrapper'>
        <AppSidebar
          activePanel={activePanel}
          onPanelChange={setActivePanel}
          onGraphSettings={toggleEnhancementDialog}
        />
        <main className='layout-main'>
          {activePanel === 'documents' && (
            <Content
              openChatBot={openChatBot}
              showChatBot={false}
              openTextSchema={openTextSchema}
              openLoadSchema={openLoadSchema}
              openPredefinedSchema={openPredefinedSchema}
              openDataImporterSchema={openDataImporterSchema}
              showEnhancementDialog={showEnhancementDialog}
              toggleEnhancementDialog={toggleEnhancementDialog}
              setOpenConnection={setOpenConnection}
              showDisconnectButton={showDisconnectButton}
              connectionStatus={connectionStatus}
              combinedPatterns={combinedPatternsVal}
              setCombinedPatterns={setCombinedPatternsVal}
              combinedNodes={combinedNodesVal}
              setCombinedNodes={setCombinedNodesVal}
              combinedRels={combinedRelsVal}
              setCombinedRels={setCombinedRelsVal}
            />
          )}
          {activePanel === 'sources' && (
            <SourcePanel
              shows3Modal={shows3Modal}
              showGCSModal={showGCSModal}
              showGenericModal={showGenericModal}
              toggleGCSModal={toggleGCSModal}
              toggleGenericModal={toggleGenericModal}
              toggleS3Modal={toggleS3Modal}
            />
          )}
          {activePanel === 'modelConfig' && <ModelConfigPanel />}
          {activePanel === 'chat' && (
            <ChatWorkspace
              messages={messages}
              clearHistoryData={clearHistoryData}
              connectionStatus={connectionStatus}
              deleteOnClick={deleteOnClick}
            />
          )}
        </main>
      </div>
    </>
  );
};

export default PageLayout;
