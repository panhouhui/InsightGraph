import { translateCopy } from './ChineseCopy';

export default function Loader({ title }: { title: string }) {
  return (
    <div className='n-flex n-flex-col n-justify-center n-items-center n-gap-y-2'>
      <div className='ndl-spin-wrapper ndl-large' role='status' aria-label='正在加载内容' aria-live='polite'>
        <div className='ndl-spin'></div>
      </div>
      <div>{translateCopy(title)}</div>
    </div>
  );
}
