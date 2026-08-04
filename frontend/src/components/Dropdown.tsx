import { Tooltip, useMediaQuery, Select, SpotlightTarget } from '@neo4j-ndl/react';
import { OptionType, ReusableDropdownProps } from '../types';
import { memo, useMemo } from 'react';
import { capitalize, capitalizeWithUnderscore } from '../utils/Utils';
import { modelTooltipMap, orderedProdLlms } from '../utils/Constants';

const DropdownComponent: React.FC<ReusableDropdownProps> = ({
  options,
  placeholder,
  defaultValue,
  onSelect,
  children,
  view,
  isDisabled,
  value,
}) => {
  const isProdEnv = import.meta.env.VITE_ENV === 'PROD';
  const isLargeDesktop = useMediaQuery(`(min-width:1440px )`);
  const handleChange = (selectedOption: OptionType | null | void) => {
    onSelect(selectedOption);
    const existingModel = localStorage.getItem('selectedModel');
    if (existingModel != selectedOption?.value) {
      localStorage.setItem('selectedModel', selectedOption?.value ?? '');
    }
  };
  const allOptions = useMemo(() => options, [options]);
  return (
    <>
      <div className={view === 'ContentView' ? 'w-[150px]' : ''}>
        <SpotlightTarget id='llmdropdown'>
          <Select
            type='select'
            label={
              <div className='w-max! flex! gap-1 items-center'>
                <span>处理与聊天模型</span>
              </div>
            }
            selectProps={{
              onChange: handleChange,
              // @ts-ignore
              options: allOptions?.map((option) => {
                const label = typeof option === 'string' ? capitalizeWithUnderscore(option) : capitalize(option.label);
                const value = typeof option === 'string' ? option : option.value;
                const isModelSupported = !isProdEnv || orderedProdLlms?.includes(value);
                const modelTooltip = modelTooltipMap[value];
                return {
                  label: !isModelSupported ? (
                    <Tooltip type='simple' placement={isLargeDesktop ? 'left' : 'right'}>
                      <Tooltip.Trigger>
                        <span className='text-nowrap'>{label}</span>
                      </Tooltip.Trigger>
                      <Tooltip.Content>开发版本可用</Tooltip.Content>
                    </Tooltip>
                  ) : modelTooltip ? (
                    <Tooltip type='simple' placement={isLargeDesktop ? 'left' : 'right'}>
                      <Tooltip.Trigger>
                        <span className='text-nowrap'>{label}</span>
                      </Tooltip.Trigger>
                      <Tooltip.Content>{modelTooltip}</Tooltip.Content>
                    </Tooltip>
                  ) : (
                    <span className='text-nowrap'>{label}</span>
                  ),
                  value,
                  isDisabled: !isModelSupported,
                };
              }),
              placeholder: placeholder || '请选择',
              defaultValue: defaultValue
                ? { label: capitalizeWithUnderscore(defaultValue), value: defaultValue }
                : undefined,
              menuPlacement: 'auto',
              isDisabled: isDisabled,
              value: value,
            }}
            size='medium'
            isFluid
            htmlAttributes={{
              'aria-label': '选择下拉框',
            }}
          />
        </SpotlightTarget>
        {children}
      </div>
    </>
  );
};
export default memo(DropdownComponent);
