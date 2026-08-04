import { Dialog, Typography, Banner } from '@neo4j-ndl/react';
import { memo, useState } from 'react';
import { EmbeddingModelOption } from '../../../utils/Constants';
import { showErrorToast } from '../../../utils/Toasts';
import ButtonWithToolTip from '../../UI/ButtonWithToolTip';

interface EmbeddingDimensionWarningModalProps {
  open: boolean;
  onClose: () => void;
  onProceed: (provider: string, model: string) => Promise<void>;
  dbDimension: number;
  selectedDimension: number;
  pendingEmbeddingModel: EmbeddingModelOption | null;
  lastEmbeddingModel: EmbeddingModelOption | null;
  onCancel: (provider: string, model: string) => Promise<void>;
}

function EmbeddingDimensionWarningModal({
  open,
  onClose,
  onProceed,
  dbDimension,
  selectedDimension,
  pendingEmbeddingModel,
  lastEmbeddingModel,
  onCancel,
}: EmbeddingDimensionWarningModalProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleProceed = async () => {
    if (!pendingEmbeddingModel) {
      showErrorToast('未选择嵌入模型');
      return;
    }

    console.log('User acknowledged dimension mismatch warning');
    console.log('Details:', {
      previousDimension: dbDimension,
      newDimension: selectedDimension,
      provider: pendingEmbeddingModel.provider,
      model: pendingEmbeddingModel.model,
      timestamp: new Date().toISOString(),
    });

    setIsProcessing(true);
    try {
      await onProceed(pendingEmbeddingModel.provider, pendingEmbeddingModel.model);
      setIsSuccess(true);
    } catch (error) {
      console.error('切换嵌入模型出错：', error);
      showErrorToast('切换嵌入模型失败，请重试。');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClose = async () => {
    if (!lastEmbeddingModel) {
      setIsSuccess(false);
      onClose();
      return;
    }

    try {
      await onCancel(lastEmbeddingModel.provider, lastEmbeddingModel.model);
      setIsSuccess(false);
      onClose();
    } catch (error) {
      console.error('恢复嵌入模型出错：', error);
      showErrorToast('恢复嵌入模型失败，请重试。');
    }
  };

  const handleContactTeam = () => {
    window.open('https://github.com/neo4j-labs/llm-graph-builder/issues/new', '_blank');
  };

  return (
    <Dialog
      size='medium'
      isOpen={open}
      onClose={handleClose}
      htmlAttributes={{
        'aria-labelledby': 'embedding-dimension-warning-dialog',
      }}
    >
      <Dialog.Header htmlAttributes={{ id: 'embedding-dimension-warning-dialog' }}>
        {isSuccess ? '嵌入模型已成功切换' : '重要提示：更新嵌入模型'}
      </Dialog.Header>
      <Dialog.Content className='n-flex n-flex-col n-gap-token-4'>
        <div className='n-flex n-flex-col n-gap-token-3'>
          <Typography variant='body-medium'>
            你正在切换到新的嵌入模型，该模型会用不同方式理解你的文档。
          </Typography>
          <div className='n-flex n-flex-col n-gap-token-2'>
            <Typography variant='body-medium'>
              原模型维度：<strong>{dbDimension}</strong>
            </Typography>
            <Typography variant='body-medium'>
              新模型维度：<strong>{selectedDimension}</strong>
            </Typography>
          </div>
          <Typography variant='body-medium'>
            为确保新模型正常工作，需要完成两个步骤：
          </Typography>
          <div className='n-bg-palette-neutral-bg-weak n-p-token-4 n-rounded'>
            <ol className='n-list-decimal n-ml-token-6 n-flex n-flex-col n-gap-token-3'>
              <li>
                <Typography variant='body-medium'>
                  <strong>更新数据库索引：</strong>点击<strong>“更新索引”</strong>后，会自动为新模型更新数据库向量索引。
                </Typography>
              </li>
              <li>
                <Typography variant='body-medium'>
                  <strong>重新处理文件：</strong>索引更新后，你需要<strong>手动</strong>重新处理之前已经处理过的文件，以确保文档与新模型兼容。
                </Typography>
              </li>
            </ol>
          </div>
          <Banner
            type='warning'
            name='警告提示'
            description='跳过文件重新处理步骤可能导致错误或结果不准确。'
            usage='inline'
          />
        </div>
      </Dialog.Content>
      <Dialog.Actions>
        <ButtonWithToolTip
          text='打开 GitHub 创建新的支持问题'
          label='联系团队'
          onClick={handleContactTeam}
          size='medium'
          fill='outlined'
          disabled={isProcessing}
        >
          联系团队
        </ButtonWithToolTip>
        <ButtonWithToolTip
          text='取消嵌入模型切换'
          label='取消'
          onClick={onClose}
          size='medium'
          fill='outlined'
          disabled={isProcessing}
        >
          取消
        </ButtonWithToolTip>
        <ButtonWithToolTip
          text='更新向量索引以匹配新的嵌入维度'
          label='更新索引'
          onClick={handleProceed}
          size='medium'
          loading={isProcessing}
          disabled={isProcessing}
        >
          <strong>更新索引</strong>
        </ButtonWithToolTip>
      </Dialog.Actions>
    </Dialog>
  );
}

export default memo(EmbeddingDimensionWarningModal);
