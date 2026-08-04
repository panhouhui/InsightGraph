import { useMemo, useState } from 'react';
import { RiKey2Line, RiShieldKeyholeLine } from 'react-icons/ri';
import { useFileContext } from '../../context/UsersFiles';
import { orderedLlms } from '../../utils/Constants';
import { capitalizeWithUnderscore } from '../../utils/Utils';
import { showErrorToast, showSuccessToast } from '../../utils/Toasts';
import { saveModelConfig } from '../../services/ModelConfig';

type ModelPreset = {
  provider: string;
  modelName: string;
  endpoint?: string;
  endpointEditable?: boolean;
  configurable?: boolean;
  note?: string;
};

const normalizeModelKey = (modelKey: string) => modelKey.toLowerCase().replace(/[.-]/g, '_');

const MODEL_PRESETS: Record<string, ModelPreset> = {
  openai_gpt_5_5: { provider: 'OpenAI', modelName: 'gpt-5.5' },
  openai_gpt_5_4_mini: { provider: 'OpenAI', modelName: 'gpt-5.4-mini' },
  diffbot: { provider: 'Diffbot', modelName: 'diffbot' },
  groq_llama3_1_8b: {
    provider: 'Groq',
    modelName: 'llama-3.1-8b-instant',
    endpoint: 'https://api.groq.com/openai/v1',
    endpointEditable: true,
  },
  anthropic_claude_4_5_haiku: { provider: 'Anthropic', modelName: 'claude-4-5-haiku' },
  anthropic_claude_4_6_sonnet: { provider: 'Anthropic', modelName: 'claude-sonnet-4-6' },
  anthropic_claude_4_7_opus: { provider: 'Anthropic', modelName: 'claude-opus-4-7' },
  fireworks_qwen3_6: { provider: 'Fireworks', modelName: 'accounts/fireworks/models/qwen3p6-plus' },
  fireworks_gpt_oss: { provider: 'Fireworks', modelName: 'accounts/fireworks/models/gpt-oss-120b' },
  fireworks_deepseek_v3: { provider: 'Fireworks', modelName: 'accounts/fireworks/models/deepseek-v3p1' },
  fireworks_deepseek_v4_flash: { provider: 'Fireworks', modelName: 'accounts/fireworks/models/deepseek-v4-flash' },
  fireworks_kimi_k2p6: { provider: 'Fireworks', modelName: 'accounts/fireworks/models/kimi-k2p6' },
  fireworks_glm_5_1: { provider: 'Fireworks', modelName: 'accounts/fireworks/models/glm-5.1' },
  minimax_m3: {
    provider: 'MiniMax 国际版',
    modelName: 'MiniMax-M3',
    endpoint: 'https://api.minimax.io/v1',
    endpointEditable: true,
  },
  gemini_3_5_flash: {
    provider: 'Gemini',
    modelName: 'gemini-3.5-flash',
    configurable: false,
    note: '当前 Gemini 使用 Google Vertex AI 默认凭据，需要在服务器配置 Google 凭据。',
  },
  gemini_3_1_pro_preview: {
    provider: 'Gemini',
    modelName: 'gemini-3.1-pro-preview',
    configurable: false,
    note: '当前 Gemini 使用 Google Vertex AI 默认凭据，需要在服务器配置 Google 凭据。',
  },
  bedrock_nova_pro_v1: {
    provider: 'AWS Bedrock',
    modelName: 'amazon.nova-pro-v1:0',
    configurable: false,
    note: 'Bedrock 需要 AWS Access Key、Secret Key 和 Region，请继续在后端 .env 中配置。',
  },
};

const getPreset = (modelKey: string): ModelPreset => {
  return MODEL_PRESETS[normalizeModelKey(modelKey)] ?? {
    provider: '兼容 OpenAI 的模型',
    modelName: capitalizeWithUnderscore(modelKey),
    endpointEditable: true,
  };
};

export default function ModelConfigPanel() {
  const { model, setModel } = useFileContext();
  const initialModel = orderedLlms.includes(model) ? model : orderedLlms[0];
  const [selectedModel, setSelectedModel] = useState(initialModel);
  const preset = useMemo(() => getPreset(selectedModel), [selectedModel]);
  const [modelName, setModelName] = useState(preset.modelName);
  const [endpoint, setEndpoint] = useState(preset.endpoint ?? '');
  const [apiKey, setApiKey] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const handleModelChange = (nextModel: string) => {
    const nextPreset = getPreset(nextModel);
    setSelectedModel(nextModel);
    setModelName(nextPreset.modelName);
    setEndpoint(nextPreset.endpoint ?? '');
    setApiKey('');
  };

  const handleUseModel = () => {
    setModel(selectedModel);
    localStorage.setItem('selectedModel', selectedModel);
    showSuccessToast('已切换当前模型');
  };

  const handleSave = async () => {
    if (preset.configurable === false) {
      showErrorToast(preset.note ?? '该模型暂不支持在前端配置 API Key');
      return;
    }
    if (!modelName.trim()) {
      showErrorToast('请填写模型名称');
      return;
    }
    if (!apiKey.trim()) {
      showErrorToast('请填写 API Key');
      return;
    }

    setIsSaving(true);
    try {
      const response = await saveModelConfig({
        modelKey: selectedModel,
        modelName: modelName.trim(),
        endpoint: endpoint.trim() || undefined,
        apiKey: apiKey.trim(),
      });
      if (response.data.status !== 'Success') {
        throw new Error(response.data.message || response.data.error || '模型配置保存失败');
      }
      setApiKey('');
      setModel(selectedModel);
      localStorage.setItem('selectedModel', selectedModel);
      showSuccessToast('模型配置已保存并设为当前模型');
    } catch (error) {
      showErrorToast(error instanceof Error ? error.message : '模型配置保存失败');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <section className='workspace-panel model-config-panel'>
      <div className='model-config-shell'>
        <div className='model-config-header'>
          <div>
            <h2>模型配置</h2>
            <p>选择处理和聊天使用的模型，并配置后端调用需要的 API Key。</p>
          </div>
          <div className='model-config-current'>
            <span>当前模型</span>
            <strong>{capitalizeWithUnderscore(model)}</strong>
          </div>
        </div>

        <div className='model-config-grid'>
          <form className='model-config-form' onSubmit={(event) => event.preventDefault()}>
            <div className='model-config-section-title'>
              <span className='model-config-icon'>
                <RiKey2Line />
              </span>
              <div>
                <h3>模型凭据</h3>
                <p>保存后会立即作为当前模型使用。</p>
              </div>
            </div>

            <label className='model-config-field'>
              <span>模型</span>
              <select value={selectedModel} onChange={(event) => handleModelChange(event.target.value)}>
                {orderedLlms.map((item) => (
                  <option key={item} value={item}>
                    {capitalizeWithUnderscore(item)}
                  </option>
                ))}
              </select>
            </label>

            <div className='model-config-two-cols'>
              <label className='model-config-field'>
                <span>服务商</span>
                <input value={preset.provider} disabled />
              </label>
              <label className='model-config-field'>
                <span>模型名称</span>
                <input value={modelName} onChange={(event) => setModelName(event.target.value)} />
              </label>
            </div>

            {(preset.endpointEditable || endpoint) && (
              <label className='model-config-field'>
                <span>接口地址</span>
                <input
                  value={endpoint}
                  onChange={(event) => setEndpoint(event.target.value)}
                  disabled={!preset.endpointEditable}
                />
              </label>
            )}

            <label className='model-config-field'>
              <span>API Key</span>
              <input
                value={apiKey}
                type='password'
                autoComplete='off'
                placeholder={preset.configurable === false ? '该模型不在前端配置 API Key' : '请输入 API Key'}
                disabled={preset.configurable === false}
                onChange={(event) => setApiKey(event.target.value)}
              />
            </label>

            {preset.note && <div className='model-config-note'>{preset.note}</div>}

            <div className='model-config-actions'>
              <button type='button' className='model-config-secondary' onClick={handleUseModel}>
                设为当前模型
              </button>
              <button
                type='button'
                className='model-config-primary'
                disabled={isSaving || preset.configurable === false}
                onClick={handleSave}
              >
                {isSaving ? '保存中...' : '加密保存配置'}
              </button>
            </div>
          </form>

          <aside className='model-config-side'>
            <span className='model-config-side-icon'>
              <RiShieldKeyholeLine />
            </span>
            <h3>传输保护</h3>
            <p>API Key 不会保存在浏览器本地。提交时会先加密，再由后端解密并写入后端配置。</p>
            <div className='model-config-summary'>
              <div>
                <span>模型标识</span>
                <strong>{selectedModel}</strong>
              </div>
              <div>
                <span>后端配置项</span>
                <strong>LLM_MODEL_CONFIG_{normalizeModelKey(selectedModel).toUpperCase()}</strong>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}
