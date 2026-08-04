import { DropdownButton, Menu } from '@neo4j-ndl/react';
import { useRef, useState } from 'react';
import TooltipWrapper from '../UI/TipWrapper';
import { useFileContext } from '../../context/UsersFiles';
interface SchemaDropdownProps {
  isDisabled: boolean;
  onSchemaSelect?: (source: string, nodes: any[], rels: any[]) => void; // <-- NEW
}
const SchemaDropdown: React.FunctionComponent<SchemaDropdownProps> = ({ isDisabled, onSchemaSelect }) => {
  const [isOpen, setIsOpen] = useState(false);
  const btnRef = useRef(null);
  const {
    userDefinedNodes,
    userDefinedRels,
    dbNodes,
    dbRels,
    schemaValNodes,
    schemaValRels,
    preDefinedNodes,
    preDefinedRels,
  } = useFileContext();
  const handleSelect = (source: string, nodes: any[], rels: any[]) => {
    setIsOpen(false);
    if (onSchemaSelect) {
      onSchemaSelect(source, nodes, rels);
    }
  };
  return (
    <div className='relative'>
      <DropdownButton
        isOpen={isOpen}
        ref={btnRef}
        isDisabled={isDisabled}
        htmlAttributes={{
          onClick: (e) => {
            e.preventDefault();
            setIsOpen((prev) => !prev);
          },
        }}
      >
        显示 Schema 来源...
      </DropdownButton>
      <Menu isOpen={isOpen} anchorRef={btnRef} onClose={() => setIsOpen(false)}>
        <Menu.Items htmlAttributes={{ id: 'default-menu' }}>
          <Menu.Item
            title={
              <TooltipWrapper placement='right' tooltip={'预定义 Schema'}>
                预定义 Schema
              </TooltipWrapper>
            }
            onClick={() => handleSelect('predefined', preDefinedNodes, preDefinedRels)}
          />
          <Menu.Item
            title={
              <TooltipWrapper placement='right' tooltip={'数据库 Schema'}>
                数据库 Schema
              </TooltipWrapper>
            }
            onClick={() => handleSelect('db', dbNodes, dbRels)}
          />
          <Menu.Item
            title={
              <TooltipWrapper placement='right' tooltip={'从文本获取 Schema'}>
                从文本获取 Schema
              </TooltipWrapper>
            }
            onClick={() => handleSelect('text', schemaValNodes, schemaValRels)}
          />
          <Menu.Item
            title={
              <TooltipWrapper placement='right' tooltip={'用户自定义'}>
                用户配置
              </TooltipWrapper>
            }
            onClick={() => handleSelect('user', userDefinedNodes, userDefinedRels)}
          />
        </Menu.Items>
      </Menu>
    </div>
  );
};
export default SchemaDropdown;
