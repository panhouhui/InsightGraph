import {
  ChatBubbleOvalLeftEllipsisIconOutline,
  CloudArrowUpIconSolid,
  DocumentTextIconSolid,
} from '@neo4j-ndl/react/icons';
import { RiKey2Line, RiSettings3Line } from 'react-icons/ri';
import insightGraphLogo from '../../assets/images/insightgraph-logo.png';

export type WorkspacePanel = 'documents' | 'sources' | 'chat' | 'modelConfig';

type AppSidebarProps = {
  activePanel: WorkspacePanel;
  onPanelChange: (panel: WorkspacePanel) => void;
  onGraphSettings: () => void;
};

const menuItems = [
  {
    key: 'documents' as const,
    label: '文档处理',
    description: '文件列表与图谱生成',
    icon: <DocumentTextIconSolid className='n-size-token-6' />,
  },
  {
    key: 'sources' as const,
    label: '上传来源',
    description: '本地、网页与云端',
    icon: <CloudArrowUpIconSolid className='n-size-token-6' />,
  },
  {
    key: 'modelConfig' as const,
    label: '模型配置',
    description: '模型选择与 API Key',
    icon: <RiKey2Line className='n-size-token-6' />,
  },
  {
    key: 'chat' as const,
    label: '聊天问答',
    description: '基于图谱提问',
    icon: <ChatBubbleOvalLeftEllipsisIconOutline className='n-size-token-6' />,
  },
];

const AppSidebar: React.FC<AppSidebarProps> = ({ activePanel, onPanelChange, onGraphSettings }) => {
  return (
    <aside className='app-sidebar'>
      <div className='app-sidebar-brand'>
        <span className='app-sidebar-brand-mark'>
          <img className='app-sidebar-logo' src={insightGraphLogo} alt='InsightGraph logo' />
        </span>
        <div>
          <div className='app-sidebar-title'>InsightGraph</div>
          <div className='app-sidebar-subtitle'>知识图谱构建器</div>
        </div>
      </div>

      <nav className='app-sidebar-nav' aria-label='主菜单'>
        {menuItems.map((item) => (
          <button
            key={item.key}
            type='button'
            className={`app-sidebar-item ${activePanel === item.key ? 'active' : ''}`}
            onClick={() => onPanelChange(item.key)}
          >
            <span className='app-sidebar-item-icon'>{item.icon}</span>
            <span className='app-sidebar-item-copy'>
              <span className='app-sidebar-item-label'>{item.label}</span>
              <span className='app-sidebar-item-description'>{item.description}</span>
            </span>
          </button>
        ))}
      </nav>

      <div className='app-sidebar-footer'>
        <button type='button' className='app-sidebar-item app-sidebar-settings' onClick={onGraphSettings}>
          <span className='app-sidebar-item-icon'>
            <RiSettings3Line />
          </span>
          <span className='app-sidebar-item-copy'>
            <span className='app-sidebar-item-label'>图谱设置</span>
            <span className='app-sidebar-item-description'>图谱结构与后处理</span>
          </span>
        </button>
      </div>
    </aside>
  );
};

export default AppSidebar;
