import { toast } from '@neo4j-ndl/react';
import { ReactNode } from 'react';

const toastTranslations: Record<string, string> = {
  'Internal server error': '服务器内部错误',
  'Network Error': '网络连接错误',
  'Request failed with status code 500': '请求失败：服务器内部错误',
  'Request failed with status code 404': '请求失败：接口不存在',
  'Request failed with status code 401': '请求失败：未授权，请重新登录',
  'Request failed with status code 403': '请求失败：没有权限',
  'Error Occurred': '发生错误',
  'Error clearing chat history': '清空聊天记录失败',
};

const translateToastMessage = (message: string) => toastTranslations[message.trim()] ?? message;

export const showErrorToast = (message: string, shouldAutoClose: boolean = true) => {
  return toast.danger(translateToastMessage(message), {
    isCloseable: true,
    shouldAutoClose,
  });
};

export const showSuccessToast = (message: string) => {
  return toast.success(translateToastMessage(message), {
    isCloseable: true,
    shouldAutoClose: true,
  });
};

export const showNormalToast = (message: string | ReactNode) => {
  return toast.neutral(typeof message === 'string' ? translateToastMessage(message) : message, {
    isCloseable: true,
    shouldAutoClose: true,
  });
};
