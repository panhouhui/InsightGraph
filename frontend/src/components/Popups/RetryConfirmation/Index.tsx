import { Banner, Dialog, Flex, Radio } from '@neo4j-ndl/react';
import { RETRY_OPIONS } from '../../../utils/Constants';
import { useFileContext } from '../../../context/UsersFiles';
import { BannerAlertProps } from '../../../types';
import ButtonWithToolTip from '../../UI/ButtonWithToolTip';
import { memo } from 'react';

const retryOptionLabels: Record<string, string> = {
  start_from_beginning: '从头开始处理',
  delete_entities_and_start_from_beginning: '删除实体并从头开始',
  start_from_last_processed_position: '从上次处理位置继续',
};

function RetryConfirmationDialog({
  open,
  onClose,
  fileId,
  retryLoading,
  retryHandler,
  alertStatus,
  onBannerClose,
}: {
  open: boolean;
  onClose: () => void;
  fileId: string;
  retryLoading: boolean;
  alertStatus: BannerAlertProps;
  retryHandler: (filename: string, retryoption: string) => void;
  onBannerClose: () => void;
}) {
  const { filesData, setFilesData } = useFileContext();
  const file = filesData.find((c) => c.id === fileId);
  const RetryOptionsForFile =
    file?.status === 'Failed' || file?.status === 'Cancelled'
      ? RETRY_OPIONS
      : RETRY_OPIONS.filter(
          (option) => option !== 'start_from_beginning' && option !== 'start_from_last_processed_position'
        );

  return (
    <Dialog isOpen={open} onClose={onClose}>
      <Dialog.Header>重新处理选项</Dialog.Header>
      <Dialog.Description>
        点击“继续”会把文件标记为“准备重新处理”。随后点击“生成图谱”即可按所选方式重新处理。
      </Dialog.Description>
      <Dialog.Content>
        {alertStatus.showAlert && (
          <Banner isCloseable onClose={onBannerClose} className='my-4' type={alertStatus.alertType} usage='inline'>
            {alertStatus.alertMessage}
          </Banner>
        )}
        <Flex>
          {RetryOptionsForFile.map((option, index) => {
            return (
              <Radio
                key={`${option}${index}`}
                onChange={(event) => {
                  setFilesData((prev) => {
                    return prev.map((f) => {
                      return f.id === fileId
                        ? { ...f, retryOptionStatus: event.target.checked, retryOption: option }
                        : f;
                    });
                  });
                }}
                htmlAttributes={{
                  name: 'retryoptions',
                  onKeyDown: (event) => {
                    if (event.code === 'Enter' && file?.retryOption.length) {
                      retryHandler(file?.name as string, file?.retryOption as string);
                    }
                  },
                }}
                isChecked={option === file?.retryOption && file?.retryOptionStatus}
                label={retryOptionLabels[option] ?? option}
              />
            );
          })}
        </Flex>
        <Dialog.Actions>
          <Dialog.Actions className='mt-3!'>
            <ButtonWithToolTip
              placement='left'
              label='重新处理按钮'
              text={!file?.retryOption.length ? '请选择一个选项' : '将状态重置为准备重新处理'}
              loading={retryLoading}
              disabled={!file?.retryOption.length}
              onClick={() => {
                retryHandler(file?.name as string, file?.retryOption as string);
              }}
            >
              继续
            </ButtonWithToolTip>
          </Dialog.Actions>
        </Dialog.Actions>
      </Dialog.Content>
    </Dialog>
  );
}

export default memo(RetryConfirmationDialog);
