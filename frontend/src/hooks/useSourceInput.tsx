import React, { useCallback, useState } from 'react';
import { CustomFile, CustomFileBase, ScanProps } from '../types';
import { useFileContext } from '../context/UsersFiles';
import { urlScanAPI } from '../services/URLScan';
import { v4 as uuidv4 } from 'uuid';
import { useCredentials } from '../context/UserCredentials';
import { getEmbeddingModel } from '../utils/EmbeddingConfigUtils';

export default function useSourceInput(
  validator: (e: string) => boolean,
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>,
  fileSource: string,
  isWikiQuery?: boolean,
  isYoutubeLink?: boolean,
  isWebLink?: boolean
) {
  const [inputVal, setInputVal] = useState<string>('');
  const [isValid, setIsValid] = useState<boolean>(false);
  const [isFocused, setIsFocused] = useState<boolean>(false);
  const [status, setStatus] = useState<'unknown' | 'success' | 'info' | 'warning' | 'danger'>('unknown');
  const [statusMessage, setStatusMessage] = useState<string>('');
  const { setFilesData, model, filesData } = useFileContext();
  const { userCredentials } = useCredentials();

  const onChangeHandler: React.ChangeEventHandler<HTMLInputElement> = useCallback((e) => {
    setIsFocused(true);
    if (e.target.value.length >= 10) {
      setIsValid(validator(e.target.value) && true);
    }
    setInputVal(e.target.value);
  }, []);
  const onBlurHandler: React.FocusEventHandler<HTMLInputElement> = useCallback(() => {
    setIsValid(validator(inputVal) && isFocused);
  }, [inputVal, isFocused]);

  const onPasteHandler: React.ClipboardEventHandler<HTMLInputElement> = useCallback(() => {
    setIsFocused(true);
    setIsValid(validator(inputVal) && true);
  }, [inputVal]);

  const onClose = useCallback(() => {
    setInputVal('');
    setStatus('unknown');
    setIsValid(false);
    setIsFocused(false);
  }, []);

  const submitHandler = useCallback(
    async (url: string) => {
      const defaultValues: CustomFileBase = {
        processingTotalTime: 0,
        status: 'New',
        nodesCount: 0,
        relationshipsCount: 0,
        type: 'TEXT',
        model: model,
        fileSource: fileSource,
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
      if (url.trim() != '') {
        setIsValid(validator(url) && isFocused);
      }
      if (isValid) {
        if (!userCredentials) {
          setStatus('danger');
          setStatusMessage('请先连接数据库');
          return;
        }
        try {
          setStatus('info');
          setIsLoading(true);
          setStatusMessage('正在扫描...');
          const params: ScanProps = {
            model: model,
            source_type: fileSource,
          };
          if (isWikiQuery) {
            params.wikiquery = url.trim();
          } else if (isYoutubeLink || isWebLink) {
            params.urlParam = url.trim();
          }
          const apiResponse = await urlScanAPI(params, userCredentials);
          setIsLoading(false);
          setStatus('success');
          if (apiResponse?.data.status == 'Failed' || !apiResponse.data) {
            setStatus('danger');
            setStatusMessage(apiResponse?.data?.message);
            setTimeout(() => {
              setStatus('unknown');
              setInputVal('');
              setIsValid(false);
              setIsFocused(false);
            }, 5000);
            return;
          }

          const apiResCheck = apiResponse?.data?.success_count && apiResponse.data.failed_count;
          if (apiResCheck) {
            setStatus('info');
            setStatusMessage(
              `已成功创建 ${apiResponse.data.success_count} 个来源节点，${apiResponse.data.failed_count} 个 ${fileSource} 链接创建失败`
            );
          } else if (apiResponse?.data?.success_count) {
            setStatusMessage(
              `已成功为 ${apiResponse.data.success_count} 个 ${fileSource} 链接创建来源节点`
            );
          } else {
            setStatus('danger');
            setStatusMessage(`${apiResponse.data.failed_count} 个 ${fileSource} 链接创建来源节点失败`);
          }

          const copiedFilesData: CustomFile[] = [...filesData];
          if (apiResponse?.data?.file_name?.length) {
            for (let index = 0; index < apiResponse?.data?.file_name.length; index++) {
              const item = apiResponse?.data?.file_name[index];
              const filedataIndex = copiedFilesData.findIndex((filedataitem) => filedataitem?.name === item?.fileName);
              if (filedataIndex == -1) {
                const baseValues = {
                  name: item.fileName,
                  size: item.fileSize,
                  sourceUrl: item.url,
                  id: uuidv4(),
                  language: item.language,
                  uploadProgress: 100,
                  // total_pages: 1,
                  ...defaultValues,
                };
                if (isWikiQuery) {
                  baseValues.wikiQuery = item.fileName;
                }
                copiedFilesData.unshift(baseValues);
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
                  uploadProgress: 100,
                  token_usage: defaultValues.token_usage,
                  embedding_model: defaultValues.embedding_model,
                });
              }
            }
          }
          setFilesData(copiedFilesData);
          setInputVal('');
          setIsValid(false);
          setIsFocused(false);
        } catch (error) {
          setIsLoading(false);
          setStatus('danger');
          setStatusMessage('发生错误，请检查实例连接');
        }
      } else {
        setStatus('danger');
        setStatusMessage(`请填写 ${fileSource} 链接`);
        setTimeout(() => {
          setStatus('unknown');
        }, 5000);
        return;
      }
      setTimeout(() => {
        setStatus('unknown');
      }, 3000);
    },

    [filesData, isWikiQuery, isYoutubeLink, isWebLink, isValid, fileSource, model]
  );

  return {
    inputVal,
    onChangeHandler,
    onBlurHandler,
    isValid,
    isFocused,
    status,
    setStatus,
    statusMessage,
    submitHandler,
    onClose,
    onPasteHandler,
  };
}
