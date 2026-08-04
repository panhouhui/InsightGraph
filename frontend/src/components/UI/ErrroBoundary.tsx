import React from 'react';
import { Banner } from '@neo4j-ndl/react';

export default class ErrorBoundary extends React.Component<any, any> {
  state = { hasError: false, errorMessage: '', errorName: '' };

  static getDerivedStateFromError(_error: unknown) {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    this.setState({ ...this.state, errorMessage: error.message, errorName: error.name });
    console.log({ error });
    console.log({ errorInfo });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className='n-size-full n-flex n-flex-col n-items-center n-justify-center n-rounded-md n-bg-palette-neutral-bg-weak n-box-border'>
          <Banner
            hasIcon={true}
            type='info'
            description={
              this.state.errorMessage === 'Missing required parameter client_id.'
                ? '请为 GCS 来源配置 Google Client ID'
                : this.state.errorName === 'InvalidCharacterError'
                  ? '安全配置已更新。为保证正常访问，请清空本地存储后重试'
                  : '页面加载时出现问题'
            }
            title='出现问题'
            className='mt-8'
            actions={
              this.state.errorName === 'InvalidCharacterError'
                ? [
                    {
                      label: '清空本地存储',
                      onClick: () => {
                        localStorage.clear();
                        window.location.reload();
                      },
                    },
                  ]
                : [
                    {
                      label: '文档',
                      href: 'https://github.com/neo4j-labs/llm-graph-builder',
                      target: '_blank',
                    },
                  ]
            }
            usage='inline'
          ></Banner>
        </div>
      );
    }
    return this.props.children;
  }
}
