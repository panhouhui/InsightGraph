import { Button, Checkbox, Dialog } from '@neo4j-ndl/react';
import { memo, useState } from 'react';
function DeletePopUp({
  open,
  no_of_files,
  deleteHandler,
  deleteCloseHandler,
  loading,
  view,
}: {
  open: boolean;
  no_of_files: number;
  deleteHandler: (deleteEntities: boolean) => void;
  deleteCloseHandler: () => void;
  loading: boolean;
  view?: 'contentView' | 'settingsView';
}) {
  const [deleteEntities, setDeleteEntities] = useState<boolean>(true);
  const message =
    view === 'contentView'
      ? `确定要从图数据库中永久删除 ${no_of_files} 个文件${deleteEntities ? '及其关联实体' : ''}吗？`
      : `确定要从图数据库中永久删除 ${no_of_files} 个节点吗？`;
  return (
    <Dialog isOpen={open} onClose={deleteCloseHandler}>
      <Dialog.Content>
        <h5 className='max-w-[90%]'>{message}</h5>
        {view === 'contentView' && (
          <div className='mt-5'>
            <Checkbox
              label='删除实体'
              isChecked={deleteEntities}
              onChange={(e) => {
                if (e.target.checked) {
                  setDeleteEntities(true);
                } else {
                  setDeleteEntities(false);
                }
              }}
            />
          </div>
        )}
      </Dialog.Content>
      <Dialog.Actions className='mt-3'>
        <Button onClick={deleteCloseHandler} isDisabled={loading}>
          取消
        </Button>
        <Button onClick={() => deleteHandler(deleteEntities)} isLoading={loading}>
          继续
        </Button>
      </Dialog.Actions>
    </Dialog>
  );
}
export default memo(DeletePopUp);
