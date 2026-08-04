import { TextInput } from '@neo4j-ndl/react';
import { useCallback, useState } from 'react';
import { useFileContext } from '../../../context/UsersFiles';
import { urlScanAPI } from '../../../services/URLScan';
import { CustomFileBase, GCSModalProps, fileName, nonoautherror } from '../../../types';
import { v4 as uuidv4 } from 'uuid';
import CustomModal from '../../../HOC/CustomModal';
import { useGoogleLogin } from '@react-oauth/google';
import { useAlertContext } from '../../../context/Alert';
import { buttonCaptions } from '../../../utils/Constants';
import { showErrorToast, showNormalToast } from '../../../utils/Toasts';
import { useCredentials } from '../../../context/UserCredentials';
import { getEmbeddingModel } from '../../../utils/EmbeddingConfigUtils';

const GCSModal: React.FC<GCSModalProps> = ({ hideModal, open, openGCSModal }) => {
  const [bucketName, setBucketName] = useState<string>('');
  const [folderName, setFolderName] = useState<string>('');
  const [projectId, setProjectId] = useState<string>('');
  const [status, setStatus] = useState<'unknown' | 'success' | 'info' | 'warning' | 'danger'>('unknown');
  const [statusMessage, setStatusMessage] = useState<string>('');
  const { showAlert } = useAlertContext();

  const { setFilesData, model, filesData } = useFileContext();
  const { userCredentials } = useCredentials();

  const defaultValues: CustomFileBase = {
    processingTotalTime: 0,
    status: 'New',
    nodesCount: 0,
    relationshipsCount: 0,
    type: 'TEXT',
    model: model,
    fileSource: 'gcs bucket',
    processingProgress: undefined,
    retryOption: '',
    retryOptionStatus: false,
    chunkNodeCount: 0,
    chunkRelCount: 0,
    entityNodeCount: 0,
    entityEntityRelCount: 0,
    communityNodeCount: 0,
    communityRelCount: 0,
    token_usage: 0,
    embedding_model: getEmbeddingModel(),
  };

  const reset = () => {
    setBucketName('');
    setFolderName('');
    setProjectId('');
  };

  const googleLogin = useGoogleLogin({
    onSuccess: async (codeResponse) => {
      try {
        if (!userCredentials) {
          showErrorToast('请先连接数据库');
          return;
        }
        setStatus('info');
        setStatusMessage('正在加载...');
        openGCSModal();
        const apiResponse = await urlScanAPI(
          {
            model,
            accessKey: '',
            secretKey: '',
            gcs_bucket_name: bucketName,
            gcs_bucket_folder: folderName,
            source_type: 'gcs bucket',
            gcs_project_id: projectId,
            access_token: codeResponse.access_token,
          },
          userCredentials
        );
        if (apiResponse.data.status == 'Failed' || !apiResponse.data) {
          showErrorToast(apiResponse?.data?.message);
          setTimeout(() => {
            setStatus('unknown');
            reset();
            hideModal();
          }, 5000);
          return;
        }
        const apiResCheck = apiResponse?.data?.success_count && apiResponse.data.failed_count;
        if (apiResCheck) {
          showNormalToast(
            `已成功创建 ${apiResponse.data.success_count} 个来源节点，${apiResponse.data.failed_count} 个文件失败`
          );
        } else if (apiResponse?.data?.success_count) {
          showNormalToast(`已成功为 ${apiResponse.data.success_count} 个文件创建来源节点`);
        } else if (apiResponse.data.failed_count) {
          showErrorToast(`${apiResponse.data.failed_count} 个文件创建来源节点失败`);
        } else {
          showErrorToast(`文件夹名称无效`);
        }
        const copiedFilesData = [...filesData];
        if (apiResponse?.data?.file_name?.length) {
          for (let index = 0; index < apiResponse?.data?.file_name.length; index++) {
            const item: fileName = apiResponse?.data?.file_name[index];
            const filedataIndex = copiedFilesData.findIndex((filedataitem) => filedataitem?.name === item.fileName);
            if (filedataIndex == -1) {
              copiedFilesData.unshift({
                name: item.fileName,
                size: item.fileSize ?? 0,
                gcsBucket: item.gcsBucketName,
                gcsBucketFolder: item.gcsBucketFolder,
                googleProjectId: item.gcsProjectId,
                id: uuidv4(),
                accessToken: codeResponse.access_token,
                ...defaultValues,
                uploadProgress: 100,
              });
            } else {
              const tempFileData = copiedFilesData[filedataIndex];
              copiedFilesData.splice(filedataIndex, 1);
              copiedFilesData.unshift({
                ...tempFileData,
                status: defaultValues.status,
                nodesCount: defaultValues.nodesCount,
                relationshipsCount: defaultValues.relationshipsCount,
                processingTotalTime: defaultValues.processingTotalTime,
                model: defaultValues.model,
                fileSource: defaultValues.fileSource,
                processingProgress: defaultValues.processingProgress,
                accessToken: codeResponse.access_token,
                uploadProgress: 100,
                embedding_model: defaultValues.embedding_model,
              });
            }
          }
        }
        setFilesData(copiedFilesData);
        reset();
      } catch (error) {
        if (showAlert != undefined) {
          showNormalToast('发生错误，请检查实例连接');
        }
      }
      setTimeout(() => {
        setStatus('unknown');
        hideModal();
      }, 500);
    },
    onError: (errorResponse) => {
      showErrorToast(
        errorResponse.error_description ?? '发生错误，请尝试使用 Google 账号登录'
      );
    },
    scope: 'https://www.googleapis.com/auth/devstorage.read_only',
    onNonOAuthError: (error: nonoautherror) => {
      console.log(error);
      showNormalToast(error.message as string);
    },
  });

  const submitHandler = () => {
    if (bucketName.trim() === '' || projectId.trim() === '') {
      setStatus('danger');
      setStatusMessage('请填写凭据');
      setTimeout(() => {
        setStatus('unknown');
      }, 5000);
    } else {
      googleLogin();
    }
    setTimeout(() => {
      setStatus('unknown');
      hideModal();
    }, 500);
  };
  const onClose = useCallback(() => {
    hideModal();
    reset();
    setStatus('unknown');
  }, []);
  const handleKeyPress: React.KeyboardEventHandler<HTMLInputElement> = (e) => {
    if (e.code === 'Enter') {
      e.preventDefault(); //
      // @ts-ignore
      const { form } = e.target;
      const index = Array.prototype.indexOf.call(form, e.target);
      if (index + 1 < form.elements.length) {
        form.elements[index + 1].focus();
      } else {
        submitHandler();
      }
    }
  };
  return (
    <CustomModal
      open={open}
      onClose={onClose}
      statusMessage={statusMessage}
      setStatus={setStatus}
      submitHandler={submitHandler}
      status={status}
      submitLabel={buttonCaptions.submit}
    >
      <div className='w-full inline-block'>
        <form>
          <TextInput
            htmlAttributes={{
              id: 'project id',
              autoFocus: true,
              onKeyDown: handleKeyPress,
              'aria-label': '项目 ID',
              placeholder: '',
            }}
            value={projectId}
            isDisabled={false}
            label='项目 ID'
            isFluid={true}
            isRequired={true}
            onChange={(e) => {
              setProjectId(e.target.value);
            }}
          ></TextInput>
          <TextInput
            htmlAttributes={{
              id: 'bucketname',
              autoFocus: true,
              onKeyDown: handleKeyPress,
              'aria-label': '存储桶名称',
              placeholder: '',
            }}
            value={bucketName}
            isDisabled={false}
            label='存储桶名称'
            isFluid={true}
            isRequired={true}
            onChange={(e) => {
              setBucketName(e.target.value);
            }}
          />
          <TextInput
            htmlAttributes={{
              id: 'foldername',
              autoFocus: true,
              onKeyDown: handleKeyPress,
              'aria-label': '文件夹名称',
              placeholder: '',
            }}
            value={folderName}
            isDisabled={false}
            label='文件夹名称'
            helpText='可选'
            isFluid={true}
            onChange={(e) => {
              setFolderName(e.target.value);
            }}
          />
        </form>
      </div>
    </CustomModal>
  );
};
export default GCSModal;
