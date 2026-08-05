# InsightGraph

InsightGraph 是一个把非结构化文档转换成 Neo4j 知识图谱的应用。它支持本地文件、压缩包、网页、YouTube、Wikipedia、S3 / GCS 等来源，并可使用多种大模型完成抽取、问答和图谱增强。

## 主要能力

- 文档上传与批量处理
- 压缩包加密兼容
- 知识图谱自动构建
- 中文前端界面
- 左侧菜单 + 右侧内容区布局
- 模型配置与 API Key 管理
- MiniMax 国际版接入
- 基于图谱的问答

## 运行要求

- Python 3.12+
- Node.js 18+
- Neo4j 5.23+，并安装 APOC

## 本地启动

### 后端

```bash
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
uvicorn score:app --reload
```

### 前端

```bash
cd frontend
yarn
yarn dev
```

默认访问：

- 前端: `http://127.0.0.1:5173`
- 后端: `http://127.0.0.1:8010`

## Neo4j 配置

在 `backend/.env` 中配置：

```env
NEO4J_URI=bolt://localhost:7687
NEO4J_USERNAME=neo4j
NEO4J_PASSWORD=你的密码
NEO4J_DATABASE=neo4j
```

如果你使用的是 Neo4j Aura，请替换为对应的连接地址和账号密码。

## 模型配置

前端会提供模型选择和 API Key 配置入口。后端读取的配置格式如下：

```env
LLM_MODEL_CONFIG_MINIMAX_M3="MiniMax-M3,https://api.minimax.io/v1,你的MiniMaxKey"
```

MiniMax 国际版已按 OpenAI 兼容接口接入，`base_url` 使用：

```text
https://api.minimax.io/v1
```

## 使用流程

1. 先连接 Neo4j。
2. 在左侧选择“模型配置”，填写模型和 API Key。
3. 在“文档处理”里上传文件或压缩包。
4. 等待处理完成后，查看知识图谱。
5. 在“聊天问答”里基于图谱提问。

## 项目结构

- `backend/` 后端 FastAPI 服务
- `frontend/` 前端 React/Vite 应用
- `data/` 示例数据
- `docs/` 项目文档

## 说明

- 前端文案已统一为中文。
- 压缩包支持加密文件场景。
- 大文件一次最大支持 10 万个字符。

## 相关链接

- [Neo4j LLM Graph Builder 原仓库](https://github.com/neo4j-labs/llm-graph-builder)
