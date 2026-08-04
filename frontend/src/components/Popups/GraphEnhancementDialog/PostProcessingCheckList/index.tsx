import { Checkbox, Flex, Typography, useMediaQuery } from '@neo4j-ndl/react';
import { POST_PROCESSING_JOBS } from '../../../../utils/Constants';
import { capitalize } from '../../../../utils/Utils';
import { useFileContext } from '../../../../context/UsersFiles';
import { tokens } from '@neo4j-ndl/base';
import { useCredentials } from '../../../../context/UserCredentials';

const postProcessingJobLabels: Record<string, string> = {
  materialize_text_chunk_similarities: '物化文本块相似关系',
  enable_hybrid_search_and_fulltext_search_in_bloom: '启用 Bloom 混合搜索和全文搜索',
  materialize_entity_similarities: '物化实体相似关系',
  enable_communities: '启用社区发现',
  graph_schema_consolidation: '图谱结构合并',
};

export default function PostProcessingCheckList() {
  const { breakpoints } = tokens;
  const tablet = useMediaQuery(`(min-width:${breakpoints.xs}) and (max-width: ${breakpoints.lg})`);
  const { postProcessingTasks, setPostProcessingTasks, selectedNodes, selectedRels } = useFileContext();
  const { isGdsActive } = useCredentials();
  return (
    <Flex gap={tablet ? '6' : '8'}>
      <div>
        <Flex flexDirection='column'>
          <Flex justifyContent='space-between' flexDirection='row'>
            <Typography variant={tablet ? 'subheading-medium' : 'subheading-large'}>
              这些选项可用于微调知识图谱，以提升性能并支持更深入的分析。
            </Typography>
          </Flex>
          <Flex justifyContent='space-between' flexDirection='column' gap='6'>
            {POST_PROCESSING_JOBS.map((job, idx) => {
              const isGraphCleanupDisabled =
                job.title === 'graph_schema_consolidation'
                  ? !(selectedNodes.length === 0 && selectedRels.length === 0)
                  : false;
              const isDisabled =
                job.title === 'enable_communities'
                  ? !isGdsActive
                  : job.title === 'graph_schema_consolidation'
                    ? isGraphCleanupDisabled
                    : false;
              const isChecked =
                job.title === 'graph_schema_consolidation'
                  ? !isGraphCleanupDisabled && postProcessingTasks.includes(job.title)
                  : job.title === 'enable_communities'
                    ? isGdsActive && postProcessingTasks.includes(job.title)
                    : postProcessingTasks.includes(job.title);
              return (
                <Flex key={`${job.title}${idx}`}>
                  <Checkbox
                    label={
                      <Typography variant='label'>
                        {postProcessingJobLabels[job.title] ??
                          job.title
                            .split('_')
                            .map((s) => capitalize(s))
                            .join(' ')}
                      </Typography>
                    }
                    isChecked={isChecked}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setPostProcessingTasks((prev) => [...prev, job.title]);
                      } else {
                        setPostProcessingTasks((prev) => prev.filter((s) => s !== job.title));
                      }
                    }}
                    isDisabled={isDisabled}
                    ariaLabel={`checkbox-${job.title}`}
                  />
                  <Typography variant={tablet ? 'body-small' : 'body-medium'}>{job.description}</Typography>
                </Flex>
              );
            })}
          </Flex>
        </Flex>
      </div>
    </Flex>
  );
}
