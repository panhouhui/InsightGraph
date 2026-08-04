const nodeLabelTranslations: Record<string, string> = {
  Document: '文档',
  Chunk: '文本块',
  __Community__: '社区',
  Person: '人物',
  Organization: '组织',
  Company: '公司',
  Work: '作品',
  Event: '事件',
  Platform: '平台',
  Ideology: '思潮',
  Characteristic: '特征',
  Location: '地点',
  Entity: '实体',
};

const relationshipTranslations: Record<string, string> = {
  ACCUSED_OF: '被指控',
  ACTED_IN: '参演',
  ACTIVE_ON: '活跃于',
  ANALYZED: '分析',
  BORN_IN: '出生于',
  CITED_BY: '被引用',
  COLLABORATES_WITH: '合作',
  CONDUCTED: '开展',
  CO_HOSTED: '联合主办',
  CRITICIZED: '批评',
  DESCRIBED_AS: '被描述为',
  DIRECTED: '导演',
  DISCUSSED: '讨论',
  FORMER_EMPLOYEE_OF: '曾任职于',
  FORMER_HEAD_OF: '曾负责人',
  FROM: '来自',
  HAS_POSITION: '担任职务',
  HOSTED: '主办',
  INTERPRETED: '解读',
  IP_LOCATED_IN: 'IP 属地',
  LEADS: '领导',
  LIVES_IN: '居住于',
  MEMBER_OF: '属于',
  ORIGINATED_FROM: '源自',
  PARTICIPATED_IN: '参与',
  PROMOTES: '推动',
  REMOVED: '下架',
  REPORTED_ON: '报道',
  RESPONDED_TO: '回应',
  WORKS_FOR: '任职于',
  PART_OF: '属于文档',
  HAS_ENTITY: '包含实体',
  FIRST_CHUNK: '首个文本块',
  NEXT_CHUNK: '下一个文本块',
  SIMILAR: '相似',
  IN_COMMUNITY: '属于社区',
  PARENT_COMMUNITY: '上级社区',
};

export const translateNodeLabel = (label: string) => nodeLabelTranslations[label] ?? label;

export const translateRelationshipType = (type: string) => {
  if (!type) {
    return '';
  }
  if (relationshipTranslations[type]) {
    return relationshipTranslations[type];
  }
  return /[A-Z_]{2,}/.test(type) ? '关联' : type;
};
