import { LegendChipProps } from '../../types';
import { graphLabels } from '../../utils/Constants';
import { translateNodeLabel, translateRelationshipType } from '../../utils/GraphDisplay';
import Legend from '../UI/Legend';

export const LegendsChip: React.FunctionComponent<LegendChipProps> = ({ scheme, label, type, count, onClick }) => {
  const title =
    type === 'node'
      ? label === '__Community__'
        ? graphLabels.community
        : translateNodeLabel(label)
      : translateRelationshipType(label);

  return (
    <Legend
      title={title}
      {...(count !== undefined && { count })}
      bgColor={scheme[label]}
      type={type}
      onClick={onClick}
    />
  );
};
