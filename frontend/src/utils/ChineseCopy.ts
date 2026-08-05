type Replacer = {
  pattern: RegExp;
  replace: (match: string, ...groups: string[]) => string;
};

const exactTranslations: Record<string, string> = {
  or: '或',
  browse: '浏览',
  'Drag & Drop': '拖拽上传',
  'Try Document Intelligence in Neo4j Aura': '试用 Neo4j Aura 中的文档智能',
  'Document Intelligence': '文档智能',
  Protocol: '协议',
  URI: '地址',
  Database: '数据库',
  Username: '用户名',
  Password: '密码',
  password: '请输入密码',
  'Not Connected': '未连接',
  'No data available': '暂无数据',
  Showing: '显示',
  of: '/',
  results: '条结果',
  Show: '显示',
  'Select...': '请选择...',
  Dismiss: '跳过',
  Next: '下一步',
  Back: '上一步',
  Done: '完成',
  'Neo4j graph builder': 'Neo4j 图谱构建器',
  'Neo4j connection': 'Neo4j 连接',
  '(Read only Mode)': '（只读模式）',
  'Graph Schema configured': '图谱 Schema 已配置',
  'No Graph Schema configured': '未配置图谱 Schema',
  Labels: '标签',
  'Rel Types': '关系类型',
  'Graph Settings': '图谱设置',
  'Graph Enhancement Settings': '图谱增强设置',
  'Enhance graph quality': '增强图谱质量',
  'Connect to Neo4j': '连接 Neo4j',
  'Connect To Neo4j Database': '连接 Neo4j 数据库',
  'Please connect to Neo4j': '请先连接 Neo4j',
  'Please login first to connect': '请先登录再连接',
  'Please log in first': '请先登录',
  Disconnect: '断开连接',
  'Select LLM Model': '选择 LLM 模型',
  'Generate Graph': '生成图谱',
  'generate graph': '生成图谱',
  'Delete Files': '删除文件',
  'Preview Graph': '预览图谱',
  'Explore Graph': '探索图谱',
  'Graph Schema': '图谱 Schema',
  'Explore Graph in Neo4j': '在 Neo4j 中探索图谱',
  'Please select file to delete': '请选择要删除的文件',
  'Please select file to Preview Graph': '请选择要预览图谱的文件',
  'Please select completed file(s) to Preview Graph': '请选择已完成的文件来预览图谱',
  'Generate graph from selected files': '从选中文件生成图谱',
  'Select one or more files to delete': '选择一个或多个文件进行删除',
  'Preview generated graph.': '预览生成的图谱。',
  'Visualize the graph in Bloom': '在 Bloom 中可视化图谱',
  'File/Files to be deleted': '个文件将被删除',
  'File/Files to Preview Graph': '个文件可预览图谱',
  Documentation: '文档',
  'GitHub 仓库': 'GitHub 仓库',
  'Light / Dark mode': '浅色 / 深色模式',
  'Entity Graph Extraction Settings': '实体图谱抽取设置',
  'Start a chat': '开始聊天',
  'Upload files': '上传文件',
  Delete: '删除',
  Maximise: '最大化',
  'Copy to Clipboard': '复制到剪贴板',
  Copied: '已复制',
  'Stop Speaking': '停止朗读',
  'Text to Speech': '文本转语音',
  'Define schema from text': '从文本定义 Schema',
  'Fetch schema from database': '从数据库获取 Schema',
  'Clear Chat History': '清空聊天记录',
  Continue: '继续',
  'Clear configured Graph Schema': '清除已配置的图谱 Schema',
  'Apply Graph Schema': '应用图谱 Schema',
  Chat: '聊天',
  'Download Conversation': '下载对话',
  'Visualize Graph Schema': '可视化图谱 Schema',
  'Analyze instructions for schema': '分析 Schema 指令',
  'Predefined Schema': '预定义 Schema',
  'Data Importer JSON': '数据导入器 JSON',
  'Show Preview Graph': '显示图谱预览',
  'Documents, Images, Unstructured text': '文档、图片、非结构化文本',
  Youtube: 'YouTube',
  'No Labels Found in the Database': '数据库中未找到标签',
  'Drop your neo4j credentials file here': '将 Neo4j 凭据文件拖到这里',
  'Analyze text to extract graph schema': '分析文本并抽取图谱 Schema',
  Connect: '连接',
  Submit: '提交',
  Cancel: '取消',
  Details: '详情',
  'Clear Schema': '清除 Schema',
  Apply: '应用',
  Ask: '提问',
  'Provide Processing Configuration for Entity Extractions': '提供实体抽取处理配置',
  'Analyze Instructions': '分析指令',
  'Provide specific instructions for entity extraction, such as focusing on the key topics.':
    '提供实体抽取的具体指令，例如聚焦关键主题。',
  'JSON Documents': 'JSON 文档',
  'Microsoft Office (.docx, .pptx, .xls, .xlsx)': 'Microsoft Office（.docx、.pptx、.xls、.xlsx）',
  'PDF (.pdf)': 'PDF（.pdf）',
  'Archives (.zip)': '压缩包（.zip）',
  'Images (.jpeg, .jpg, .png, .svg)': '图片（.jpeg、.jpg、.png、.svg）',
  'Text (.html, .txt , .md)': '文本（.html、.txt、.md）',
  'Source info': '来源说明',
  Uploading: '上传中',
  'Failed To Upload, Unsupported file extention': '上传失败，不支持的文件扩展名',
  'Error Occurred:': '发生错误：',
  'Upload Failed': '上传失败',
  New: '待生成图谱',
  None: '无',
  Processing: '处理中',
  Waiting: '等待中',
  Completed: '已完成',
  Failed: '失败',
  Cancelled: '已取消',
  Uploaded: '已上传',
  'Ready to Reprocess': '准备重新处理',
  'cancel the processing job': '取消处理任务',
  'cancel job button': '取消任务按钮',
  'Upload Status': '上传状态',
  'Size (KB)': '大小（KB）',
  Name: '名称',
  Status: '状态',
  Source: '来源',
  Type: '类型',
  Model: '模型',
  Nodes: '节点',
  Relations: '关系',
  'Token Usage': 'Token 用量',
  Actions: '操作',
  'Embedding Model': '嵌入模型',
  'All Files': '全部文件',
  'Completed Files': '已完成文件',
  'New Files': '新文件',
  'Failed Files': '失败文件',
  'All Sources': '全部来源',
  'All Types': '全部类型',
  All: '全部',
  'Copy Row': '复制行',
  'Graph view': '图谱视图',
  'Cancel Queue': '取消队列',
  'Cancel all waiting files': '取消所有等待中的文件',
  'Cancelling...': '正在取消...',
  'Cancelling files in waiting queue...': '正在取消等待队列中的文件...',
  'No files in queue to cancel': '队列中没有可取消的文件',
  'Failed to cancel queue': '取消队列失败',
  'Files are in processing please wait till previous batch completes': '文件正在处理中，请等待上一批完成',
  'Please check backend connection': '请检查后端连接',
  'Loading content': '正在加载内容',
  'LLM Model for Processing & Chat': '用于处理和聊天的 LLM 模型',
  'Backend connection status': '后端连接状态',
  'Connect to Neo4j to upload documents': '连接 Neo4j 后上传文档',
  'No Sources Found': '未找到来源',
  Website: '网站',
  'Web Sources': '网页来源',
  Communities: '社区',
  'Sources used': '使用的来源',
  Chunks: '文本块',
  'Top Entities used': '使用最多的实体',
  'Generated Cypher Query': '生成的 Cypher 查询',
  'Evaluation Metrics': '评估指标',
  'Some metrics are not available for Gemini model.': '部分指标不适用于 Gemini 模型。',
  'No Chunks Found': '未找到文本块',
  'Score :': '分数：',
  Mode: '模式',
  Relevancy: '相关性',
  Faithful: '忠实度',
  Context: '上下文',
  Semantic: '语义',
  Rouge: 'ROUGE',
  Metric: '指标',
  Score: '分数',
  Value: '值',
  'Related Documents': '相关文档',
  'Connected Chunks': '已连接文本块',
  'Database Index Update:': '数据库索引更新：',
  'Update Index': '更新索引',
  'Reprocess Your Files:': '重新处理文件：',
  'Reprocess Options': '重新处理选项',
  'Files are under processing': '文件正在处理中',
  'Text Chunks': '文本块',
  'Position :': '位置：',
  'Page No :': '页码：',
  'Large Document Notice': '大文档提示',
  'Document Expiration Notice': '文档过期提示',
  'JSON Data Graph Extraction Settings': 'JSON 数据图谱抽取设置',
  'Some Q&A functionality will only be available afterwards': '部分问答功能将在后处理完成后可用',
  'Ongoing Post Processing Jobs': '正在进行的后处理任务',
  'Provider:': '提供方：',
  'Dimension:': '维度：',
  'JSON (.json)': 'JSON（.json）',
  'local file': '本地文件',
  's3 bucket': 'S3 存储桶',
  'web-url': '网页链接',
  Wikipedia: '维基百科',
  'Large files may be partially processed up to 10K characters due to resource limit.':
    '受资源限制，大文件可能只会处理最多 10 万个字符。',
  "It seems like you haven't ingested any data yet. To begin building your knowledge graph, you'll need to log in to the main application.":
    '看起来你还没有导入任何数据。要开始构建知识图谱，请先登录主应用。',
  'A selection dropdown': '选择下拉框',
  'Available In Development Version': '开发版本可用',
  'Connection Modal': '连接弹窗',
  "Don't have a Neo4j instance? Start for free today": '还没有 Neo4j 实例？今天即可免费开始',
  'Please drop a valid file': '请拖入有效文件',
  'Successfully created the vector index': '向量索引创建成功',
  'LLM Model Not Supported ,Please Choose Different Model': '不支持该 LLM 模型，请选择其他模型',
  'Reference Answer': '参考答案',
  'Retrieval information': '检索信息',
  'Graph Entities used for Answer Generation': '用于生成答案的图谱实体',
  'Q&A Button': '问答按钮',
  Deleting: '正在删除',
  'Deleting...': '正在删除...',
  'Bucket URL': '存储桶 URL',
  'Access Key': '访问密钥',
  'Secret Key': '密钥',
  'Wikipedia Link': 'Wikipedia 链接',
  'Youtube Link': 'YouTube 链接',
  'Web Link': '网页链接',
  'Login with Neo4j': '使用 Neo4j 登录',
  'Using Google Account or Email Address': '使用 Google 账号或邮箱地址',
  'Fill out the neo4j credentials and click on connect': '填写 Neo4j 凭据并点击连接',
  'Upload documents': '上传文档',
  'Upload any unstructured files': '上传任意非结构化文件',
  'Choose The Desired LLM': '选择需要的 LLM',
  'Start The Extraction Process': '开始抽取流程',
  'Click On Generate Graph': '点击生成图谱',
  'Visualize The Knowledge Graph': '可视化知识图谱',
  'Select At Least One or More Completed Files From The Table For Visualization':
    '从表格中选择至少一个已完成文件进行可视化',
  'Ask Questions Related To Documents': '围绕文档提问',
  'Session verification failed. Please log in again.': '会话验证失败，请重新登录。',
  'Error loading chat history:': '加载聊天历史失败：',
  'localStorage email sync failed': '同步本地邮箱失败',
  'Connection Data:': '连接数据：',
  'from else cndition error is there': '连接分支返回错误',
  'Welcome to the Neo4j Knowledge Graph Chat. You can ask questions related to documents which have been completely processed.':
    '欢迎使用 Neo4j 知识图谱聊天。你可以围绕已完全处理的文档提问。',
  'All Q&A functionality is available now.': '所有问答功能现在都可用了。',
  'Post-processing failed': '后处理失败',
  'Unexpected error format:': '非预期的错误格式：',
  'Axios error occurred:': 'Axios 请求出错：',
  'An unexpected error occurred:': '发生非预期错误：',
  'An unknown error occurred:': '发生未知错误：',
  'Select/Create Source': '选择/创建源节点',
  'Select/Create Type': '选择/创建关系类型',
  'Select/Create Target': '选择/创建目标节点',
  'Add Values': '添加值',
  'Continue to extract': '继续抽取',
  'Clear Graph Settings': '清除图谱设置',
  'Apply Graph Settings': '应用图谱设置',
  'Document Text': '文档文本',
  'Text is schema description': '文本是 Schema 描述',
  'Analyze button': '分析按钮',
  vector: '向量',
  graph: '图谱',
  'graph+vector': '图谱 + 向量',
  fulltext: '全文检索',
  'graph+vector+fulltext': '图谱 + 向量 + 全文检索',
  'entity search+vector': '实体搜索 + 向量',
  'global search+vector+fulltext': '全局搜索 + 向量 + 全文检索',
  'Chat mode is unavailable when files are selected': '选择文件时聊天模式不可用',
  Selected: '已选择',
  'Performs semantic similarity search on text chunks using vector indexing.':
    '使用向量索引对文本块进行语义相似度搜索。',
  'Translates text to Cypher queries for precise data retrieval from a graph database.':
    '将文本转换为 Cypher 查询，以便从图数据库中精确检索数据。',
  'Combines vector indexing and graph connections for contextually enhanced semantic search.':
    '结合向量索引和图谱连接，增强带上下文的语义搜索。',
  'Conducts fast, keyword-based search using full-text indexing on text chunks.':
    '使用文本块全文索引进行快速关键词搜索。',
  'Integrates vector, graph, and full-text indexing for comprehensive search results.':
    '整合向量、图谱和全文索引，获得更全面的搜索结果。',
  'Uses vector indexing on entity nodes for highly relevant entity-based search.':
    '对实体节点使用向量索引，进行高相关性的实体搜索。',
  'Use vector and full-text indexing on community nodes to provide accurate, context-aware answers globally.':
    '对社区节点使用向量和全文索引，提供准确且具备上下文的全局答案。',
};

const regexTranslations: Replacer[] = [
  {
    pattern: /^Showing (\d+) of (\d+) results$/,
    replace: (_match, shown, total) => `显示 ${shown} / ${total} 条结果`,
  },
  {
    pattern: /^(.+) will take approx (.+) (Min|Sec)$/,
    replace: (_match, fileName, time, unit) => `${fileName} 预计需要 ${time} ${unit === 'Min' ? '分钟' : '秒'}`,
  },
  {
    pattern: /^(.+) Failed to process$/,
    replace: (_match, fileName) => `${fileName} 处理失败`,
  },
  {
    pattern: /^Processing (\d+) files at a time\.$/,
    replace: (_match, count) => `每次处理 ${count} 个文件。`,
  },
  {
    pattern: /^(.+) uploaded successfully$/,
    replace: (_match, fileName) => `${fileName} 上传成功`,
  },
  {
    pattern: /^(.+) (is|are) already being processed\. Please wait for it to finish before re-uploading\.$/,
    replace: (_match, fileNames) => `${fileNames} 正在处理中，请等待完成后再重新上传。`,
  },
  {
    pattern: /^(\d+) selected, (\d+) file\(s\) ready to preview$/,
    replace: (_match, selected, ready) => `已选择 ${selected} 个，其中 ${ready} 个文件可预览`,
  },
  {
    pattern: /^(\d+) files? waiting in queue$/,
    replace: (_match, count) => `${count} 个文件正在队列中等待`,
  },
  {
    pattern: /^Successfully cancelled (\d+) waiting file\(s\)$/,
    replace: (_match, count) => `已成功取消 ${count} 个等待中的文件`,
  },
  {
    pattern: /^Failed to cancel queue: (.+)$/,
    replace: (_match, error) => `取消队列失败：${error}`,
  },
  {
    pattern: /^(.+) Graph Schema configured\((\d+) Labels \+ (\d+) Rel Types\)$/,
    replace: (_match, prefix, labels, rels) => `${prefix} 图谱 Schema 已配置（${labels} 个标签 + ${rels} 个关系类型）`,
  },
];

const translatedAttrNames = ['title', 'aria-label', 'placeholder', 'alt'];
const ignoredTags = new Set(['SCRIPT', 'STYLE', 'CODE', 'PRE', 'TEXTAREA']);

function normalizeText(value: string) {
  return value.replace(/\s+/g, ' ').trim();
}

export function translateCopy(value: string) {
  const normalized = normalizeText(value);
  if (!normalized) {
    return value;
  }
  const exact = exactTranslations[normalized];
  if (exact) {
    return value.replace(normalized, exact);
  }
  for (const item of regexTranslations) {
    const match = normalized.match(item.pattern);
    if (match) {
      return value.replace(normalized, item.replace(match[0], ...match.slice(1)));
    }
  }
  return value;
}

function translateTextNode(node: Text) {
  const translated = translateCopy(node.nodeValue ?? '');
  if (translated !== node.nodeValue) {
    node.nodeValue = translated;
  }
}

function translateElement(element: Element) {
  if (ignoredTags.has(element.tagName)) {
    return;
  }
  for (const attr of translatedAttrNames) {
    const value = element.getAttribute(attr);
    if (!value) {
      continue;
    }
    const translated = translateCopy(value);
    if (translated !== value) {
      element.setAttribute(attr, translated);
    }
  }
}

function translateTree(root: Node) {
  if (root.nodeType === Node.TEXT_NODE) {
    translateTextNode(root as Text);
    return;
  }
  if (root.nodeType !== Node.ELEMENT_NODE && root.nodeType !== Node.DOCUMENT_NODE) {
    return;
  }

  if (root.nodeType === Node.ELEMENT_NODE) {
    translateElement(root as Element);
  }

  const walker = document.createTreeWalker(root, NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT);
  let current = walker.nextNode();
  while (current) {
    if (current.nodeType === Node.ELEMENT_NODE) {
      translateElement(current as Element);
    } else if (current.nodeType === Node.TEXT_NODE) {
      const parent = current.parentElement;
      if (!parent || !ignoredTags.has(parent.tagName)) {
        translateTextNode(current as Text);
      }
    }
    current = walker.nextNode();
  }
}

function installDialogTranslations() {
  const originalAlert = window.alert.bind(window);
  const originalConfirm = window.confirm.bind(window);
  const originalPrompt = window.prompt.bind(window);

  window.alert = (message?: string) => originalAlert(message === undefined ? message : translateCopy(message));
  window.confirm = (message?: string) => originalConfirm(message === undefined ? message : translateCopy(message));
  window.prompt = (message?: string, defaultValue?: string) =>
    originalPrompt(message === undefined ? message : translateCopy(message), defaultValue);
}

export function installChineseCopy() {
  document.documentElement.lang = 'zh-CN';
  document.title = translateCopy(document.title);
  installDialogTranslations();

  const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      mutation.addedNodes.forEach(translateTree);
      if (mutation.type === 'attributes' && mutation.target) {
        translateTree(mutation.target);
      }
    }
  });

  const start = () => {
    translateTree(document.body);
    if (document.body) {
      observer.observe(document.body, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: translatedAttrNames,
      });
    }
  };

  if (document.body) {
    start();
  } else {
    window.addEventListener('DOMContentLoaded', start, { once: true });
  }
}
