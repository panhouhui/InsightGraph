import {
  useReactTable,
  getCoreRowModel,
  createColumnHelper,
  getFilteredRowModel,
  getPaginationRowModel,
} from '@tanstack/react-table';
import { capitalize } from '../../utils/Utils';
import { useContext, useMemo, useRef } from 'react';
import { Banner, Box, DataGrid, DataGridComponents, Flex, IconButton, Popover, Typography } from '@neo4j-ndl/react';
import { multimodelmetric } from '../../types';
import { ThemeWrapperContext } from '../../context/ThemeWrapper';
import { InformationCircleIconOutline } from '@neo4j-ndl/react/icons';
import NotAvailableMetric from './NotAvailableMetric';

export default function MultiModeMetrics({
  data,
  metricsLoading,
  error,
  isWithAdditionalMetrics,
}: {
  data: multimodelmetric[];
  metricsLoading: boolean;
  error: string;
  isWithAdditionalMetrics: boolean | null;
}) {
  const { colorMode } = useContext(ThemeWrapperContext);
  const tableRef = useRef<HTMLDivElement>(null);
  const columnHelper = createColumnHelper<multimodelmetric>();
  const columns = useMemo(
    () => [
      columnHelper.accessor((row) => row.mode, {
        id: 'Mode',
        cell: (info) => {
          const metric = info.getValue();
          const capitilizedMetric = metric.includes('_')
            ? metric
                .split('_')
                .map((w) => capitalize(w))
                .join(' ')
            : capitalize(metric);
          return (
            <div className='textellipsis'>
              <span title={metric}>{capitilizedMetric}</span>
            </div>
          );
        },
        header: () => <span>模式</span>,
        footer: (info) => info.column.id,
        maxSize: 150,
      }),
      columnHelper.accessor((row) => row.answer_relevancy as number, {
        id: '回答相关性',
        cell: (info) => {
          const value = isNaN(info.getValue()) ? 'N.A' : info.getValue()?.toFixed(2);
          if (value === 'N.A') {
            return <NotAvailableMetric />;
          }
          return <Typography variant='body-medium'>{value}</Typography>;
        },
        header: () => (
          <Flex flexDirection='row' alignItems='center'>
            <span>相关性</span>
            <Popover placement='top-middle-bottom-middle' hasAnchorPortal={true}>
              <Popover.Trigger hasButtonWrapper>
                <IconButton size='small' isClean ariaLabel='infoicon'>
                  <InformationCircleIconOutline />
                </IconButton>
              </Popover.Trigger>
              <Popover.Content className='p-2'>
                <Typography variant='body-small'>
                  判断回答是否切合用户的问题。
                </Typography>
              </Popover.Content>
            </Popover>
          </Flex>
        ),
        maxSize: 150,
      }),
      columnHelper.accessor((row) => row.faithfulness as number, {
        id: '忠实度',
        cell: (info) => {
          const value = isNaN(info.getValue()) ? 'N.A' : info.getValue()?.toFixed(2);
          if (value === 'N.A') {
            return <NotAvailableMetric />;
          }
          return <Typography variant='body-medium'>{value}</Typography>;
        },
        header: () => (
          <Flex flexDirection='row' alignItems='center'>
            <span>忠实度</span>
            <Popover placement='top-middle-bottom-middle' hasAnchorPortal={true}>
              <Popover.Trigger hasButtonWrapper>
                <IconButton size='small' isClean ariaLabel='infoicon'>
                  <InformationCircleIconOutline />
                </IconButton>
              </Popover.Trigger>
              <Popover.Content className='p-2'>
                <Typography variant='body-small'>
                  判断回答是否准确反映了已提供的信息。
                </Typography>
              </Popover.Content>
            </Popover>
          </Flex>
        ),
        maxSize: 150,
      }),
      columnHelper.accessor((row) => row.context_entity_recall as number, {
        id: '实体召回',
        cell: (info) => {
          const value = isNaN(info.getValue()) ? 'N.A' : info.getValue()?.toFixed(2);
          if (value === 'N.A') {
            return <NotAvailableMetric />;
          }
          return <Typography variant='body-medium'>{value}</Typography>;
        },
        header: () => (
          <Flex flexDirection='row' alignItems='center'>
            <span>上下文</span>
            <Popover placement='top-middle-bottom-middle' hasAnchorPortal={true}>
              <Popover.Trigger hasButtonWrapper>
                <IconButton size='small' isClean ariaLabel='infoicon'>
                  <InformationCircleIconOutline />
                </IconButton>
              </Popover.Trigger>
              <Popover.Content className='p-2'>
                <Typography variant='body-small'>
                  判断生成答案和检索上下文中共同出现实体的召回情况。
                </Typography>
              </Popover.Content>
            </Popover>
          </Flex>
        ),
        maxSize: 150,
      }),
      columnHelper.accessor((row) => row.semantic_score as number, {
        id: '语义分数',
        cell: (info) => {
          const value = isNaN(info.getValue()) ? 'N.A' : info.getValue()?.toFixed(2);
          if (value === 'N.A') {
            return <NotAvailableMetric />;
          }
          return <Typography variant='body-medium'>{value}</Typography>;
        },
        header: () => (
          <Flex flexDirection='row' alignItems='center'>
            <span>语义</span>
            <Popover placement='top-middle-bottom-middle' hasAnchorPortal={true}>
              <Popover.Trigger hasButtonWrapper>
                <IconButton size='small' isClean ariaLabel='infoicon'>
                  <InformationCircleIconOutline />
                </IconButton>
              </Popover.Trigger>
              <Popover.Content className='p-2'>
                <Typography variant='body-small'>
                  判断生成答案是否理解了参考答案的语义。
                </Typography>
              </Popover.Content>
            </Popover>
          </Flex>
        ),
        maxSize: 150,
      }),
      columnHelper.accessor((row) => row.rouge_score as number, {
        id: 'ROUGE 分数',
        cell: (info) => {
          const value = isNaN(info.getValue()) ? 'N.A' : info.getValue()?.toFixed(2);
          if (value === 'N.A') {
            return <NotAvailableMetric />;
          }
          return <Typography variant='body-medium'>{value}</Typography>;
        },
        header: () => (
          <Flex flexDirection='row' alignItems='center'>
            <span>Rouge</span>
            <Popover placement='top-middle-bottom-middle' hasAnchorPortal={true}>
              <Popover.Trigger hasButtonWrapper>
                <IconButton size='small' isClean ariaLabel='infoicon'>
                  <InformationCircleIconOutline />
                </IconButton>
              </Popover.Trigger>
              <Popover.Content className='p-2'>
                <Typography variant='body-small'>
                  判断生成答案与参考答案在字面上的匹配程度。
                </Typography>
              </Popover.Content>
            </Popover>
          </Flex>
        ),
        maxSize: 150,
      }),
    ],
    []
  );

  const columnswithoutSemanticAndRougeScores = useMemo(
    () => [
      columnHelper.accessor((row) => row.mode, {
        id: 'Mode',
        cell: (info) => {
          const metric = info.getValue();
          const capitilizedMetric = metric.includes('_')
            ? metric
                .split('_')
                .map((w) => capitalize(w))
                .join(' ')
            : capitalize(metric);
          return (
            <div className='textellipsis'>
              <span title={metric}>{capitilizedMetric}</span>
            </div>
          );
        },
        header: () => <span>模式</span>,
        footer: (info) => info.column.id,
        maxSize: 150,
      }),
      columnHelper.accessor((row) => row.answer_relevancy as number, {
        id: '回答相关性',
        cell: (info) => {
          const value = isNaN(info.getValue()) ? 'N.A' : info.getValue()?.toFixed(2);
          if (value === 'N.A') {
            return <NotAvailableMetric />;
          }
          return <Typography variant='body-medium'>{value}</Typography>;
        },
        header: () => (
          <Flex flexDirection='row' alignItems='center'>
            <span>相关性</span>
            <Popover placement='top-middle-bottom-middle' hasAnchorPortal={true}>
              <Popover.Trigger hasButtonWrapper>
                <IconButton size='small' isClean ariaLabel='infoicon'>
                  <InformationCircleIconOutline />
                </IconButton>
              </Popover.Trigger>
              <Popover.Content className='p-2'>
                <Typography variant='body-small'>
                  判断回答是否切合用户的问题。
                </Typography>
              </Popover.Content>
            </Popover>
          </Flex>
        ),
      }),
      columnHelper.accessor((row) => row.faithfulness as number, {
        id: '忠实度',
        cell: (info) => {
          const value = isNaN(info.getValue()) ? 'N.A' : info.getValue()?.toFixed(2);
          if (value === 'N.A') {
            return <NotAvailableMetric />;
          }
          return <Typography variant='body-medium'>{value}</Typography>;
        },
        header: () => (
          <Flex flexDirection='row' alignItems='center'>
            <span>忠实度</span>
            <Popover placement='top-middle-bottom-middle' hasAnchorPortal={true}>
              <Popover.Trigger hasButtonWrapper>
                <IconButton size='small' isClean ariaLabel='infoicon'>
                  <InformationCircleIconOutline />
                </IconButton>
              </Popover.Trigger>
              <Popover.Content className='p-2'>
                <Typography variant='body-small'>
                  判断回答是否准确反映了已提供的信息。
                </Typography>
              </Popover.Content>
            </Popover>
          </Flex>
        ),
      }),
      columnHelper.accessor((row) => row.context_entity_recall as number, {
        id: '实体召回',
        cell: (info) => {
          const value = isNaN(info.getValue()) ? 'N.A' : info.getValue()?.toFixed(2);
          if (value === 'N.A') {
            return <NotAvailableMetric />;
          }
          return <Typography variant='body-medium'>{value}</Typography>;
        },
        header: () => (
          <Flex flexDirection='row' alignItems='center'>
            <span>上下文</span>
            <Popover placement='top-middle-bottom-middle' hasAnchorPortal={true}>
              <Popover.Trigger hasButtonWrapper>
                <IconButton size='small' isClean ariaLabel='infoicon'>
                  <InformationCircleIconOutline />
                </IconButton>
              </Popover.Trigger>
              <Popover.Content className='p-2'>
                <Typography variant='body-small'>
                  判断生成答案和检索上下文中共同出现实体的召回情况。
                </Typography>
              </Popover.Content>
            </Popover>
          </Flex>
        ),
      }),
    ],
    []
  );
  const config = useMemo(
    () => ({
      data,
      columns: !isWithAdditionalMetrics ? columnswithoutSemanticAndRougeScores : columns,
      getCoreRowModel: getCoreRowModel(),
      getFilteredRowModel: getFilteredRowModel(),
      getPaginationRowModel: getPaginationRowModel(),
      enableGlobalFilter: false,
      autoResetPageIndex: false,
      enableColumnResizing: true,
      enableRowSelection: true,
      enableMultiRowSelection: true,
      enableSorting: false,
    }),
    [isWithAdditionalMetrics]
  );
  const table = useReactTable(config);

  return (
    <Box>
      {error?.trim() != '' ? (
        <Banner type='danger' usage='inline'>
          {error}
        </Banner>
      ) : (
        <div className={isWithAdditionalMetrics === false ? 'flex justify-center items-center' : ''}>
          <DataGrid
            ref={tableRef}
            isResizable={true}
            tableInstance={table}
            styling={{
              borderStyle: 'all-sides',
              hasZebraStriping: true,
              headerStyle: 'clean',
            }}
            isAutoResizingColumns={true}
            isLoading={metricsLoading}
            // rootProps={{ className: isWithAdditionalMetrics === false ? 'w-[465px]!' : 'auto' }}
            components={{
              Body: () => (
                <DataGridComponents.Body
                  innerProps={{
                    className: colorMode == 'dark' ? 'tbody-dark' : 'tbody-light',
                  }}
                />
              ),
              Navigation: null,
            }}
            isKeyboardNavigable={false}
          />
        </div>
      )}
    </Box>
  );
}
