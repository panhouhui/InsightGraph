import { useEffect, useRef, useState } from 'react';
import { TextLink, Typography } from '@neo4j-ndl/react';
import { ArrowDownTrayIconOutline, TrashIconOutline } from '@neo4j-ndl/react/icons';
import { RiChatSettingsLine } from 'react-icons/ri';
import { useLocation } from 'react-router';
import Chatbot from '../ChatBot/Chatbot';
import ChatModeToggle from '../ChatBot/ChatModeToggle';
import { useCredentials } from '../../context/UserCredentials';
import { useMessageContext } from '../../context/UserMessages';
import { Messages } from '../../types';
import { IconButtonWithToolTip } from '../UI/IconButtonToolTip';
import { tooltips } from '../../utils/Constants';
import { downloadClickHandler, getIsLoading } from '../../utils/Utils';

type ChatWorkspaceProps = {
  messages: Messages[];
  clearHistoryData: boolean;
  connectionStatus: boolean;
  deleteOnClick: () => void;
};

const ChatWorkspace: React.FC<ChatWorkspaceProps> = ({
  messages,
  clearHistoryData,
  connectionStatus,
  deleteOnClick,
}) => {
  const { setMessages, isDeleteChatLoading } = useMessageContext();
  const { setUserCredentials, setIsGCSActive, setGdsActive, setIsReadOnlyUser } = useCredentials();
  const location = useLocation();
  const chatAnchor = useRef<HTMLDivElement>(null);
  const downloadLinkRef = useRef<HTMLAnchorElement>(null);
  const [showChatMode, setShowChatMode] = useState(false);

  useEffect(() => {
    if (connectionStatus) {
      if (location && location.state && Array.isArray(location.state)) {
        setMessages(location.state);
      } else if (
        location &&
        location.state &&
        typeof location.state === 'object' &&
        Object.keys(location.state).length > 1
      ) {
        setUserCredentials(location.state.credential);
        setIsGCSActive(location.state.isGCSActive);
        setGdsActive(location.state.isgdsActive);
        setIsReadOnlyUser(location.state.isReadOnlyUser);
      }
    }
  }, [location, connectionStatus]);

  return (
    <section className='workspace-panel chat-workspace'>
      <div className='workspace-panel-header'>
        <div>
          <Typography variant='h5'>聊天问答</Typography>
          <Typography variant='body-small' className='text-palette-neutral-text-weak'>
            基于已处理完成的文档向知识图谱提问。
          </Typography>
        </div>
        <div className='chat-workspace-actions'>
          <div ref={chatAnchor}>
            <IconButtonWithToolTip
              onClick={() => setShowChatMode(true)}
              clean
              text='聊天模式'
              placement='bottom'
              label='聊天模式'
            >
              <RiChatSettingsLine />
            </IconButtonWithToolTip>
          </div>
          <ChatModeToggle
            open={showChatMode}
            closeHandler={(_, reason) => {
              if (reason.type === 'backdropClick') {
                setShowChatMode(false);
              }
            }}
            menuAnchor={chatAnchor}
            isRoot={false}
          />
          <IconButtonWithToolTip
            text={tooltips.clearChat}
            aria-label='清除聊天记录'
            clean
            onClick={deleteOnClick}
            disabled={messages.length === 1}
            placement='bottom'
            label={tooltips.clearChat}
          >
            <TrashIconOutline />
          </IconButtonWithToolTip>
          <IconButtonWithToolTip
            text='下载对话'
            aria-label='下载对话'
            clean
            onClick={() => {
              downloadClickHandler({ conversation: messages }, downloadLinkRef, 'graph-builder-conversation.json');
            }}
            placement='bottom'
            label='下载对话'
          >
            <ArrowDownTrayIconOutline />
          </IconButtonWithToolTip>
          <TextLink ref={downloadLinkRef} className='hidden!'>
            ""
          </TextLink>
        </div>
      </div>

      <div className='chat-workspace-body'>
        <Chatbot
          isFullScreen={true}
          messages={messages}
          setMessages={setMessages}
          clear={clearHistoryData}
          isLoading={getIsLoading(messages)}
          connectionStatus={connectionStatus}
          isDeleteChatLoading={isDeleteChatLoading}
        />
      </div>
    </section>
  );
};

export default ChatWorkspace;
