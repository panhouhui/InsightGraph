import CustomPopOver from './CustomPopOver';
import { InformationCircleIconOutline } from '@neo4j-ndl/react/icons';
import { CustomFileBase } from '../../types';
import { useCredentials } from '../../context/UserCredentials';

export default function BreakDownPopOver({ file, isNodeCount = true }: { file: CustomFileBase; isNodeCount: boolean }) {
  const { isGdsActive } = useCredentials();

  return (
    <CustomPopOver Trigger={<InformationCircleIconOutline className='n-size-token-6' />}>
      {isNodeCount ? (
        <ul className='p-2'>
          <li>文本块节点：{file.chunkNodeCount}</li>
          <li>实体节点：{file.entityNodeCount}</li>
          {isGdsActive && <li>社区节点：{file.communityNodeCount}</li>}
        </ul>
      ) : (
        <ul className='p-2'>
          <li>文本块关系：{file.chunkRelCount}</li>
          <li>实体关系：{file.entityEntityRelCount}</li>
          {isGdsActive && <li>社区关系：{file.communityRelCount}</li>}
        </ul>
      )}
    </CustomPopOver>
  );
}
