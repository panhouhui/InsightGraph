import { Banner, Box, Button, Flex, TextInput } from '@neo4j-ndl/react';
import { CustomInput } from '../../types';

export default function CustomSourceInput({
  value,
  label,
  placeHolder,
  onChangeHandler,
  submitHandler,
  disabledCheck,
  onCloseHandler,
  id,
  onBlurHandler,
  status,
  setStatus,
  statusMessage,
  isValid,
  isFocused,
  onPasteHandler,
}: CustomInput) {
  return (
    <Flex gap='6'>
      {status !== 'unknown' && (
        <Box>
          <Banner
            isCloseable={true}
            description={statusMessage}
            onClose={() => setStatus('unknown')}
            type={status}
            name='自定义提示'
            className='text-lg font-semibold'
            usage='inline'
          />
        </Box>
      )}
      <Box>
        <div className='w-full inline-block'>
          <TextInput
            htmlAttributes={{
              id: id,
              onBlur: onBlurHandler,
              autoFocus: true,
              onPaste: onPasteHandler,

              onKeyDown: (e) => {
                if (e.code === 'Enter') {
                  submitHandler(value);
                }
              },

              'aria-label': label,
              placeholder: placeHolder,
            }}
            value={value}
            isDisabled={false}
            label={label}
            isFluid={true}
            isRequired={true}
            onChange={onChangeHandler}
            errorText={!isValid && isFocused && '请输入有效的 URL'}
          />
        </div>
      </Box>
      <Flex flexDirection='row' justifyContent='flex-end'>
        <div className='websource-btn-container'>
          <Button
            isDisabled={value.trim() === ''}
            color='neutral'
            fill='outlined'
            onClick={onCloseHandler}
            size='medium'
            className='mr-4'
          >
            重置
          </Button>
          <Button onClick={() => submitHandler(value)} size='medium' isDisabled={disabledCheck}>
            提交
          </Button>
        </div>
      </Flex>
    </Flex>
  );
}
