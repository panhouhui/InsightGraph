import { GraphLabel, Typography } from '@neo4j-ndl/react';
import { GraphPropertiesTableProps } from '../../types';

const propertyKeyLabels: Record<string, string> = {
  '<id>': '内部 ID',
  '<element_id>': '关系 ID',
  '<from>': '起点',
  '<to>': '终点',
  '<caption>': '关系',
  id: '名称',
  entity_type: '类型',
  fileName: '文件名',
  status: '状态',
  token_usage: 'Token 用量',
};

const GraphPropertiesTable = ({ propertiesWithTypes }: GraphPropertiesTableProps): JSX.Element => {
  return (
    <div className='flex w-full flex-col break-all px-4 text-sm' data-testid='viz-details-pane-properties-table'>
      <div className='mb-1 flex! flex-row pl-2'>
        <Typography variant='body-medium' className='basis-1/3'>
          属性
        </Typography>
        <Typography variant='body-medium'>值</Typography>
      </div>
      {propertiesWithTypes
        .filter(({ value }) => value !== undefined && value !== null && value !== '' && !Array.isArray(value))
        .map(({ key, value }, _) => {
          return (
            <div key={key} className='border-palette-neutral-border-weak flex! border-t py-1 pl-2 first:border-none'>
              <div className='shrink basis-1/3 overflow-hidden whitespace-nowrap'>
                <GraphLabel
                  type='propertyKey'
                  className='pointer-events-none max-w-full! text-ellipsis'
                  htmlAttributes={{
                    tabIndex: -1,
                  }}
                >
                  {propertyKeyLabels[key] ?? key}
                </GraphLabel>
              </div>
              <div className={`ml-2 flex-1 whitespace-pre-wrap`}>{value}</div>
            </div>
          );
        })}
    </div>
  );
};

export default GraphPropertiesTable;
