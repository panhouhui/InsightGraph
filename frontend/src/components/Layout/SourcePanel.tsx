import React, { lazy, Suspense, useMemo } from 'react';
import { Flex, StatusIndicator, Typography } from '@neo4j-ndl/react';
import DropZone from '../DataSources/Local/DropZone';
import S3Component from '../DataSources/AWS/S3Bucket';
import GCSButton from '../DataSources/GCS/GCSButton';
import CustomAlert from '../UI/Alert';
import FallBackDialog from '../UI/FallBackDialog';
import { useAlertContext } from '../../context/Alert';
import { useCredentials } from '../../context/UserCredentials';
import { APP_SOURCES, SKIP_AUTH } from '../../utils/Constants';
import GenericButton from '../WebSources/GenericSourceButton';
import GenericModal from '../WebSources/GenericSourceModal';
import { useAuth0 } from '@auth0/auth0-react';
import { useFileContext } from '../../context/UsersFiles';

const S3Modal = lazy(() => import('../DataSources/AWS/S3Modal'));
const GCSModal = lazy(() => import('../DataSources/GCS/GCSModal'));

type SourcePanelProps = {
  shows3Modal: boolean;
  showGCSModal: boolean;
  showGenericModal: boolean;
  toggleS3Modal: () => void;
  toggleGCSModal: () => void;
  toggleGenericModal: () => void;
};

const SourceCards: React.FC<SourcePanelProps> = ({
  toggleS3Modal,
  toggleGCSModal,
  toggleGenericModal,
  shows3Modal,
  showGCSModal,
  showGenericModal,
}) => {
  const isYoutubeOnly = useMemo(
    () => APP_SOURCES.includes('youtube') && !APP_SOURCES.includes('wiki') && !APP_SOURCES.includes('web'),
    []
  );
  const isWikipediaOnly = useMemo(
    () => APP_SOURCES.includes('wiki') && !APP_SOURCES.includes('youtube') && !APP_SOURCES.includes('web'),
    []
  );
  const isWebOnly = useMemo(
    () => APP_SOURCES.includes('web') && !APP_SOURCES.includes('youtube') && !APP_SOURCES.includes('wiki'),
    []
  );

  return (
    <div className='resource-sections'>
      <Flex gap='6' className='source-container source-panel-grid'>
        {APP_SOURCES.includes('local') && (
          <div className='source-card outline-dashed outline-2 outline-offset-2 outline-gray-100 imageBg'>
            <DropZone />
          </div>
        )}
        {APP_SOURCES.some((source) => ['youtube', 'wiki', 'web'].includes(source)) && (
          <div className='source-card outline-dashed imageBg'>
            <GenericButton openModal={toggleGenericModal} />
            <GenericModal
              isOnlyYoutube={isYoutubeOnly}
              isOnlyWikipedia={isWikipediaOnly}
              isOnlyWeb={isWebOnly}
              open={showGenericModal}
              closeHandler={toggleGenericModal}
            />
          </div>
        )}
        {APP_SOURCES.includes('s3') && (
          <div className='source-card outline-dashed imageBg'>
            <S3Component openModal={toggleS3Modal} />
            <Suspense fallback={<FallBackDialog />}>
              <S3Modal hideModal={toggleS3Modal} open={shows3Modal} />
            </Suspense>
          </div>
        )}
        {APP_SOURCES.includes('gcs') && (
          <div className='source-card outline-dashed imageBg'>
            <GCSButton openModal={toggleGCSModal} />
            <Suspense fallback={<FallBackDialog />}>
              <GCSModal openGCSModal={toggleGCSModal} open={showGCSModal} hideModal={toggleGCSModal} />
            </Suspense>
          </div>
        )}
      </Flex>
    </div>
  );
};

const SourcePanel: React.FC<SourcePanelProps> = (props) => {
  const { closeAlert, alertState } = useAlertContext();
  const { isReadOnlyUser, isBackendConnected, connectionStatus } = useCredentials();
  const { loginWithRedirect, isAuthenticated } = useAuth0();
  const { filesData } = useFileContext();
  const isAuthEnabled = !SKIP_AUTH;
  const canUseSources = (!isReadOnlyUser || !isAuthEnabled || connectionStatus) && (isAuthenticated || !isAuthEnabled);

  return (
    <section className='workspace-panel source-panel'>
      <div className='workspace-panel-header'>
        <div>
          <Typography variant='h5'>上传来源</Typography>
          <Typography variant='body-small' className='text-palette-neutral-text-weak'>
            选择本地文件、网页或云端来源来构建知识图谱。
          </Typography>
        </div>
        {import.meta.env.VITE_ENV !== 'PROD' && (
          <Typography variant='body-medium' className='flex items-center gap-1'>
            <StatusIndicator type={isBackendConnected ? 'success' : 'danger'} />
            <span>后端连接状态</span>
          </Typography>
        )}
      </div>

      {alertState.showAlert && (
        <CustomAlert
          severity={alertState.alertType}
          open={alertState.showAlert}
          handleClose={closeAlert}
          alertMessage={alertState.alertMessage}
        />
      )}

      {!connectionStatus && (
        <Typography variant='body-medium' className='source-panel-status'>
          <StatusIndicator type='danger' />
          <span>请先连接 Neo4j 数据库，再上传文档。</span>
        </Typography>
      )}

      {canUseSources ? (
        <div className={`${!connectionStatus ? 'cursor-not-allowed' : ''}`}>
          <div className={`${!connectionStatus ? 'blur-sm pointer-events-none' : ''}`}>
            <SourceCards {...props} />
          </div>
        </div>
      ) : (
        <div className='cursor-pointer' onClick={() => loginWithRedirect()}>
          <Typography variant='body-small' className='source-panel-status'>
            <StatusIndicator type='danger' />
            <span>
              {filesData.length === 0
                ? '当前还没有导入数据，请先登录主应用。'
                : '处理这些数据需要登录，请先登录主应用。'}
            </span>
          </Typography>
          <div className='blur-sm pointer-events-none'>
            <SourceCards {...props} />
          </div>
        </div>
      )}
    </section>
  );
};

export default SourcePanel;
