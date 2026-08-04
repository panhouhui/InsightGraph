import { useAuth0 } from '@auth0/auth0-react';
import { Button, Flex, Typography } from '@neo4j-ndl/react';

export default function Login() {
  const { loginWithRedirect } = useAuth0();

  return (
    <div className='ng-bg-palette-neutral-bg-default'>
      <div className='flex flex-col p-4 n-bg-palette-neutral-bg-weak n-rounded-lg gap-4'>
        <Flex flexDirection='column' gap='4' alignItems='center'>
          <Typography variant='body-medium'>
            看起来你还没有导入任何数据。要开始构建知识图谱，请先登录主应用。
          </Typography>
        </Flex>
        <div className='flex justify-center items-center'>
          <Button
            size='large'
            onClick={() => {
              loginWithRedirect();
            }}
          >
            使用 Neo4j 登录
          </Button>
        </div>
      </div>
    </div>
  );
}
