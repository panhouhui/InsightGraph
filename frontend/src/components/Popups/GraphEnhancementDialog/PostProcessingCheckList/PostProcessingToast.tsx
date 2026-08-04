import { Flex, Typography } from '@neo4j-ndl/react';
import SelectedJobList from './SelectedJobList';

export default function PostProcessingToast({
  postProcessingTasks,
  isGdsActive,
  isSchema,
}: {
  postProcessingTasks: string[];
  isGdsActive: boolean;
  isSchema: boolean;
}) {
  return (
    <Flex flexDirection='column'>
      <Typography variant='subheading-medium'>部分问答功能会在后处理完成后可用</Typography>
      <Typography variant='subheading-small'>正在进行的后处理任务</Typography>
      <SelectedJobList postProcessingTasks={postProcessingTasks} isGdsActive={isGdsActive} isSchema={isSchema} />
    </Flex>
  );
}
