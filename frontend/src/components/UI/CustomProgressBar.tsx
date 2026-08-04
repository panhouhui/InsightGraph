import { ProgressBar } from '@neo4j-ndl/react';

export default function CustomProgressBar({ value }: { value: number }) {
  return <ProgressBar heading={value < 100 ? '上传中 ' : '已上传'} size='small' value={value}></ProgressBar>;
}
