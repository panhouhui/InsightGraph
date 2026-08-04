import { Flex, Select, TextArea, Typography, useMediaQuery, Tooltip } from '@neo4j-ndl/react';
import {
  appLabels,
  buttonCaptions,
  defaultChunkOverlapOptions,
  defaultTokenChunkSizeOptions,
  defaultChunksToCombineOptions,
  embeddingModels,
  EmbeddingModelOption,
  DEFAULT_EMBEDDING_MODEL,
} from '../../../../utils/Constants';
import { tokens } from '@neo4j-ndl/base';
import ButtonWithToolTip from '../../../UI/ButtonWithToolTip';
import { useState, useEffect } from 'react';
import { useFileContext } from '../../../../context/UsersFiles';
import { showNormalToast, showErrorToast } from '../../../../utils/Toasts';
import { OnChangeValue } from 'react-select';
import { OptionType } from '../../../../types';
import EmbeddingDimensionWarningModal from '../../EmbeddingDimensionWarningModal';
import { changeEmbeddingModelAPI } from '../../../../services/ChangeEmbeddingModel';
import { useCredentials } from '../../../../context/UserCredentials';
import { getEmbeddingConfig, setEmbeddingConfig, setChunkConfig } from '../../../../utils/EmbeddingConfigUtils';

export default function AdditionalInstructionsText({
  closeEnhanceGraphSchemaDialog,
}: {
  closeEnhanceGraphSchemaDialog: () => void;
}) {
  const { breakpoints } = tokens;
  const tablet = useMediaQuery(`(min-width:${breakpoints.xs}) and (max-width: ${breakpoints.lg})`);
  const { userCredentials } = useCredentials();
  const {
    additionalInstructions,
    setAdditionalInstructions,
    setSelectedTokenChunkSize,
    setSelectedChunk_overlap,
    selectedTokenChunkSize,
    selectedChunk_overlap,
    selectedChunks_to_combine,
    setSelectedChunks_to_combine,
  } = useFileContext();

  const [selectedEmbeddingModel, setSelectedEmbeddingModel] = useState<EmbeddingModelOption>(() => {
    const config = getEmbeddingConfig();
    const found = embeddingModels.find((opt) => opt.provider === config.provider && opt.model === config.model);
    return found || DEFAULT_EMBEDDING_MODEL;
  });

  const [displayEmbeddingModel, setDisplayEmbeddingModel] = useState<EmbeddingModelOption>(() => {
    const config = getEmbeddingConfig();
    const found = embeddingModels.find((opt) => opt.provider === config.provider && opt.model === config.model);
    return found || DEFAULT_EMBEDDING_MODEL;
  });

  const [showDimensionWarning, setShowDimensionWarning] = useState(false);
  const [pendingEmbeddingModel, setPendingEmbeddingModel] = useState<EmbeddingModelOption | null>(null);
  const [isEmbeddingReadonly, setIsEmbeddingReadonly] = useState(false);
  const [dropdownKey, setDropdownKey] = useState(0);
  const [isCancelling, setIsCancelling] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [originalValues, setOriginalValues] = useState({
    instructions: additionalInstructions,
    chunkSize: selectedTokenChunkSize,
    chunkOverlap: selectedChunk_overlap,
    chunksToCombine: selectedChunks_to_combine,
    embeddingModel: selectedEmbeddingModel,
  });

  useEffect(() => {
    const config = getEmbeddingConfig();
    const allowEmbeddingChange = localStorage.getItem('allowEmbeddingChange');
    setIsEmbeddingReadonly(allowEmbeddingChange === 'false');

    const found = embeddingModels.find((opt) => opt.provider === config.provider && opt.model === config.model);
    if (found && (found.provider !== selectedEmbeddingModel.provider || found.model !== selectedEmbeddingModel.model)) {
      setSelectedEmbeddingModel(found);
      setDisplayEmbeddingModel(found);
    }
    setOriginalValues({
      instructions: additionalInstructions,
      chunkSize: selectedTokenChunkSize,
      chunkOverlap: selectedChunk_overlap,
      chunksToCombine: selectedChunks_to_combine,
      embeddingModel: selectedEmbeddingModel,
    });
  }, []);

  useEffect(() => {
    const instructionsChanged = additionalInstructions !== originalValues.instructions;
    const chunkSizeChanged = selectedTokenChunkSize !== originalValues.chunkSize;
    const chunkOverlapChanged = selectedChunk_overlap !== originalValues.chunkOverlap;
    const chunksToCombineChanged = selectedChunks_to_combine !== originalValues.chunksToCombine;
    const embeddingModelChanged =
      selectedEmbeddingModel.provider !== originalValues.embeddingModel.provider ||
      selectedEmbeddingModel.model !== originalValues.embeddingModel.model;

    setHasChanges(
      instructionsChanged || chunkSizeChanged || chunkOverlapChanged || chunksToCombineChanged || embeddingModelChanged
    );
  }, [
    additionalInstructions,
    selectedTokenChunkSize,
    selectedChunk_overlap,
    selectedChunks_to_combine,
    selectedEmbeddingModel,
    originalValues,
  ]);

  const onChangeChunk_size = (newValue: OnChangeValue<OptionType, false>) => {
    if (newValue !== null) {
      const parsedValue = Number(newValue.value);
      if (isNaN(parsedValue)) {
        showNormalToast('分块大小必须是有效数字');
        return;
      }
      setSelectedTokenChunkSize(parsedValue);
    }
  };
  const onChangeChunk_overlap = (newValue: OnChangeValue<OptionType, false>) => {
    if (newValue !== null) {
      const parsedValue = Number(newValue.value);
      if (isNaN(parsedValue)) {
        showNormalToast('分块重叠必须是有效数字');
        return;
      }
      setSelectedChunk_overlap(parsedValue);
    }
  };
  const onChangeChunks_to_combine = (newValue: OnChangeValue<OptionType, false>) => {
    if (newValue !== null) {
      const parsedValue = Number(newValue.value);
      if (isNaN(parsedValue)) {
        showNormalToast('合并分块数必须是有效数字');
        return;
      }
      setSelectedChunks_to_combine(parsedValue);
    }
  };

  const onChangeEmbeddingModel = (newValue: unknown) => {
    const value = newValue as EmbeddingModelOption | null;
    if (value !== null) {
      if (value.provider === selectedEmbeddingModel.provider && value.model === selectedEmbeddingModel.model) {
        return;
      }

      const config = getEmbeddingConfig();
      const connectionStr = localStorage.getItem('neo4j.connection');

      let dbDimension = config?.db_vector_dimension || 0;
      console.log('DB dimension from embedding config:', dbDimension);

      if (!dbDimension && connectionStr) {
        try {
          const connectionData = JSON.parse(connectionStr);
          dbDimension = connectionData.db_vector_dimension || connectionData.userDbVectorIndex || 0;
        } catch (e) {
          console.error('Error parsing connection data:', e);
        }
      }
      if (dbDimension && dbDimension > 0 && dbDimension !== value.dimension) {
        setDisplayEmbeddingModel(value);
        setPendingEmbeddingModel(value);
        setShowDimensionWarning(true);
        return;
      }
      applyEmbeddingModelChange(value);
    }
  };

  const applyEmbeddingModelChange = async (value: EmbeddingModelOption) => {
    if (!userCredentials) {
      showErrorToast('用户凭据不可用');
      return;
    }

    try {
      const response = await changeEmbeddingModelAPI({
        userCredentials,
        embeddingProvider: value.provider,
        embeddingModel: value.model,
      });

      if (response?.data?.status === 'Success') {
        setSelectedEmbeddingModel(value);
        setDisplayEmbeddingModel(value);
        const apiDimension = response?.data?.data?.embedding_dimension;
        const dimensionToStore = apiDimension || value.dimension;
        setEmbeddingConfig({
          provider: value.provider,
          model: value.model,
          dimension: dimensionToStore,
          db_vector_dimension: dimensionToStore,
        });

        const displayLabel = `${value.provider.charAt(0).toUpperCase() + value.provider.slice(1)} ${value.model}`;
        showNormalToast(
          response.data.message || `嵌入模型已设置为 ${displayLabel}（维度：${dimensionToStore}）`
        );
      } else {
        const errorMsg = response?.data?.message || '切换嵌入模型失败';
        showErrorToast(errorMsg);
      }
    } catch (error) {
      console.error('Error changing embedding model:', error);
      showErrorToast('切换嵌入模型失败，请重试。');
    }
  };

  const handleWarningProceed = async (provider: string, model: string) => {
    if (!userCredentials) {
      showErrorToast('用户凭据不可用');
      return;
    }

    try {
      const response = await changeEmbeddingModelAPI({
        userCredentials,
        embeddingProvider: provider,
        embeddingModel: model,
      });

      if (response?.data?.status === 'Success') {
        showNormalToast(response.data.message || '嵌入模型已切换成功');
        if (pendingEmbeddingModel) {
          setSelectedEmbeddingModel(pendingEmbeddingModel);
          setDisplayEmbeddingModel(pendingEmbeddingModel);
          const apiDimension = response?.data?.data?.embedding_dimension;
          const dimensionToStore = apiDimension || pendingEmbeddingModel.dimension;
          setEmbeddingConfig({
            provider: pendingEmbeddingModel.provider,
            model: pendingEmbeddingModel.model,
            dimension: dimensionToStore,
            db_vector_dimension: dimensionToStore,
          });

          setPendingEmbeddingModel(null);
        }
        setShowDimensionWarning(false);
      } else {
        const errorMsg = response?.data?.message || '切换嵌入模型失败';
        showErrorToast(errorMsg);
        throw new Error(errorMsg);
      }
    } catch (error) {
      console.error('Error in handleWarningProceed:', error);
      throw error;
    }
  };

  const handleWarningCancel = async (provider: string, model: string) => {
    if (!userCredentials) {
      showErrorToast('用户凭据不可用');
      return;
    }

    try {
      const response = await changeEmbeddingModelAPI({
        userCredentials,
        embeddingProvider: provider,
        embeddingModel: model,
      });

      if (response?.data?.status === 'Success') {
        console.log('Embedding model reverted to:', provider, model);
        setDisplayEmbeddingModel(selectedEmbeddingModel);
        setPendingEmbeddingModel(null);
        setShowDimensionWarning(false);
        setDropdownKey((prev) => prev + 1);
      } else {
        const errorMsg = response?.data?.message || '恢复嵌入模型失败';
        showErrorToast(errorMsg);
        throw new Error(errorMsg);
      }
    } catch (error) {
      console.error('Error in handleWarningCancel:', error);
      throw error;
    }
  };

  const handleApply = () => {
    console.log('handleApply - About to save chunk config:', {
      chunkSize: selectedTokenChunkSize,
      chunkOverlap: selectedChunk_overlap,
      chunksToCombine: selectedChunks_to_combine,
      instructions: additionalInstructions,
    });

    setChunkConfig({
      chunkSize: selectedTokenChunkSize,
      chunkOverlap: selectedChunk_overlap,
      chunksToCombine: selectedChunks_to_combine,
      instructions: additionalInstructions,
    });

    console.log('handleApply - Chunk config saved to localStorage');

    setOriginalValues({
      instructions: additionalInstructions,
      chunkSize: selectedTokenChunkSize,
      chunkOverlap: selectedChunk_overlap,
      chunksToCombine: selectedChunks_to_combine,
      embeddingModel: selectedEmbeddingModel,
    });

    closeEnhanceGraphSchemaDialog();
    showNormalToast('已应用所有设置');
  };

  const handleCancel = async () => {
    const embeddingModelChanged =
      selectedEmbeddingModel.provider !== originalValues.embeddingModel.provider ||
      selectedEmbeddingModel.model !== originalValues.embeddingModel.model;

    if (embeddingModelChanged && userCredentials) {
      setIsCancelling(true);
      try {
        const response = await changeEmbeddingModelAPI({
          userCredentials,
          embeddingProvider: originalValues.embeddingModel.provider,
          embeddingModel: originalValues.embeddingModel.model,
        });

        if (response?.data?.status === 'Success') {
          console.log(
            'Embedding model reverted to original:',
            originalValues.embeddingModel.provider,
            originalValues.embeddingModel.model
          );
        } else {
          const errorMsg = response?.data?.message || '恢复嵌入模型失败';
          showErrorToast(errorMsg);
          setIsCancelling(false);
          return;
        }
      } catch (error) {
        console.error('Error reverting embedding model:', error);
        showErrorToast('恢复嵌入模型失败，请重试。');
        setIsCancelling(false);
        return;
      }
    }

    setAdditionalInstructions(originalValues.instructions);
    setSelectedTokenChunkSize(originalValues.chunkSize);
    setSelectedChunk_overlap(originalValues.chunkOverlap);
    setSelectedChunks_to_combine(originalValues.chunksToCombine);
    setSelectedEmbeddingModel(originalValues.embeddingModel);
    setDisplayEmbeddingModel(originalValues.embeddingModel);
    setChunkConfig({
      chunkSize: originalValues.chunkSize,
      chunkOverlap: originalValues.chunkOverlap,
      chunksToCombine: originalValues.chunksToCombine,
      instructions: originalValues.instructions,
    });
    setEmbeddingConfig({
      provider: originalValues.embeddingModel.provider,
      model: originalValues.embeddingModel.model,
      dimension: originalValues.embeddingModel.dimension,
    });
    setDropdownKey((prev) => prev + 1);
    setIsCancelling(false);
    showNormalToast('已还原所有更改');
  };

  return (
    <>
      <EmbeddingDimensionWarningModal
        open={showDimensionWarning}
        onClose={() => {
          setDisplayEmbeddingModel(selectedEmbeddingModel);
          setPendingEmbeddingModel(null);
          setShowDimensionWarning(false);
          setDropdownKey((prev) => prev + 1);
        }}
        onProceed={handleWarningProceed}
        onCancel={handleWarningCancel}
        lastEmbeddingModel={selectedEmbeddingModel}
        dbDimension={(() => {
          try {
            const config = getEmbeddingConfig();
            if (config.db_vector_dimension) {
              return config.db_vector_dimension;
            }
            const connectionStr = localStorage.getItem('neo4j.connection');
            if (connectionStr) {
              const conn = JSON.parse(connectionStr);
              return conn.db_vector_dimension || conn.userDbVectorIndex || 0;
            }
            return 0;
          } catch {
            return 0;
          }
        })()}
        selectedDimension={pendingEmbeddingModel?.dimension || 0}
        pendingEmbeddingModel={pendingEmbeddingModel}
      />
      <div>
        <Flex flexDirection='column'>
          <Flex justifyContent='space-between' flexDirection='row'>
            <Typography variant={tablet ? 'subheading-medium' : 'subheading-large'}>
              {buttonCaptions.provideAdditionalInstructions}
            </Typography>
          </Flex>
          <Flex justifyContent='space-between' flexDirection='column' gap='6'>
            <TextArea
              helpText={buttonCaptions.helpInstructions}
              label='处理配置'
              style={{
                resize: 'vertical',
              }}
              isFluid={true}
              value={additionalInstructions}
              htmlAttributes={{
                onChange: (e) => setAdditionalInstructions(e.target.value),
              }}
              size='small'
            />
          </Flex>
        </Flex>
        <div className='mt-4'>
          <div className='flex align-self-center justify-left'>
            <h5>{appLabels.chunkingConfiguration}</h5>
          </div>
          <Select
            key={dropdownKey}
              label='嵌入模型'
            size='medium'
            type='creatable'
            isDisabled={isEmbeddingReadonly}
            selectProps={{
              isMulti: false,
              isDisabled: isEmbeddingReadonly,
              options: (() => {
                const otherModels = embeddingModels.filter(
                  (model) =>
                    model.provider !== displayEmbeddingModel.provider || model.model !== displayEmbeddingModel.model
                );
                const reorderedModels = [displayEmbeddingModel, ...otherModels];
                return reorderedModels.map((model) => ({
                  ...model,
                  label: (
                    <Tooltip type='simple' placement='right'>
                      <Tooltip.Trigger>
                        <span className='text-nowrap'>{model.label}</span>
                      </Tooltip.Trigger>
                      <Tooltip.Content>
                        <div className='flex flex-col gap-1'>
                          <div>
                            <strong>提供方：</strong> {model.provider}
                          </div>
                          <div>
                            <strong>模型：</strong> {model.model}
                          </div>
                          <div>
                            <strong>维度：</strong> {model.dimension}
                          </div>
                        </div>
                      </Tooltip.Content>
                    </Tooltip>
                  ),
                }));
              })(),
              onChange: onChangeEmbeddingModel,
              value: {
                ...displayEmbeddingModel,
                label: (
                  <Tooltip type='simple' placement='right'>
                    <Tooltip.Trigger>
                      <span className='text-nowrap'>{displayEmbeddingModel.label}</span>
                    </Tooltip.Trigger>
                    <Tooltip.Content>
                      <div className='flex flex-col gap-1'>
                        <div>
                          <strong>提供方：</strong> {displayEmbeddingModel.provider}
                        </div>
                        <div>
                          <strong>模型：</strong> {displayEmbeddingModel.model}
                        </div>
                        <div>
                          <strong>维度：</strong> {displayEmbeddingModel.dimension}
                        </div>
                      </div>
                    </Tooltip.Content>
                  </Tooltip>
                ),
              },
            }}
            helpText={
              isEmbeddingReadonly
                ? '嵌入模型由管理员配置，当前不可修改'
                : '选择用于向量索引和相似度搜索的嵌入模型'
            }
          />
          <Select
            label='每个分块的 Token 数'
            size='medium'
            selectProps={{
              options: defaultTokenChunkSizeOptions.map((value) => ({
                value: value.toString(),
                label: value.toString(),
              })),
              onChange: onChangeChunk_size,
              value: {
                value: selectedTokenChunkSize.toString(),
                label: selectedTokenChunkSize.toString(),
              },
              classNamePrefix: `
                  ${
                    tablet
                      ? 'tablet_entity_extraction_Tab_relationship_label'
                      : 'entity_extraction_Tab_relationship_label'
                  }
                `,
            }}
            type='creatable'
            helpText='LLM 处理的最大 Token 限制为 10,000。分块总数会按 10,000 除以你选择的每块 Token 数计算。例如选择每块 500 Token，会得到 20 个分块（10,000 / 500）。'
          />
          <Select
            label='分块重叠'
            size='medium'
            selectProps={{
              isMulti: false,
              options: defaultChunkOverlapOptions.map((value) => ({
                value: value.toString(),
                label: value.toString(),
              })),
              onChange: onChangeChunk_overlap,
              value: {
                value: selectedChunk_overlap.toString(),
                label: selectedChunk_overlap.toString(),
              },
            }}
            type='creatable'
          />
          <Select
            label='合并分块数'
            size='medium'
            selectProps={{
              isMulti: false,
              options: defaultChunksToCombineOptions.map((value) => ({
                value: value.toString(),
                label: value.toString(),
              })),
              onChange: onChangeChunks_to_combine,
              value: {
                value: selectedChunks_to_combine.toString(),
                label: selectedChunks_to_combine.toString(),
              },
            }}
            type='creatable'
          />
        </div>
        <Flex className='mt-6' flexDirection='row' justifyContent='flex-end' gap='4'>
          <ButtonWithToolTip
            placement='top'
            label='取消按钮'
            text='放弃所有更改并关闭弹窗'
            onClick={handleCancel}
            fill='outlined'
            loading={isCancelling}
            disabled={!hasChanges || isCancelling}
          >
            取消
          </ButtonWithToolTip>
          <ButtonWithToolTip
            placement='top'
            label='应用按钮'
            text='保存所有配置更改'
            onClick={handleApply}
            disabled={!hasChanges}
          >
            应用
          </ButtonWithToolTip>
        </Flex>
      </div>
    </>
  );
}
