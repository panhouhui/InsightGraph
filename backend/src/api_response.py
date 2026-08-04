EXACT_TRANSLATIONS = {
    "Internal server error": "服务器内部错误",
    "An unexpected error occurred.": "发生非预期错误。",
    "Token verified": "Token 验证成功",
    "All tasks completed successfully": "所有任务已完成",
    "Source Node Created Successfully": "来源节点创建成功",
    "Backend connection successful": "后端连接成功",
    "Backend connection is not successful": "后端连接失败",
    "source_type is other than accepted source": "来源类型不受支持",
    "Unable to fetch source list": "无法获取来源列表",
    "Unable to complete post processing tasks": "无法完成后处理任务",
    "Unable to extract entities from chunk ids": "无法从文本块中提取实体",
    "Unable to extract neighbour nodes for given element ID": "无法获取指定节点的相邻节点",
    "Unable to get graph query response": "无法获取图谱查询结果",
    "Unable to clear chat History": "无法清空聊天记录",
    "Unable to upload file in chunks": "无法分片上传文件",
    "Unable to get the labels and relationtypes from neo4j database": "无法从 Neo4j 数据库获取标签和关系类型",
    "Unable to get the document status": "无法获取文档状态",
    "Unable to cancel the running job": "无法取消正在运行的任务",
    "Unable to get the schema from text": "无法从文本中获取 Schema",
    "Unable to get the list of unconnected nodes": "无法获取未连接节点列表",
    "Unable to delete the unconnected nodes": "无法删除未连接节点",
    "Unable to get the list of duplicate nodes": "无法获取重复节点列表",
    "Unable to merge the duplicate nodes": "无法合并重复节点",
    "Unable to drop and re-create vector index with correct dimesion as per application configuration": "无法按应用配置重建正确维度的向量索引",
    "Unable to set status to Retry": "无法将状态设置为重试",
    "Failed to calculate evaluation metrics.": "评估指标计算失败。",
    "Error while calculating evaluation metrics": "计算评估指标时出现错误",
    "Unable to connect backend DB": "无法连接后端数据库",
    "Unable to get schema visualization from neo4j database": "无法从 Neo4j 数据库获取 Schema 可视化结果",
    "Unable to fetch embedding model": "无法获取嵌入模型",
    "Failed to change embedding model.": "切换嵌入模型失败。",
    "Unconnected entities delete successfully": "未连接实体已删除",
    "Duplicate entities merged successfully": "重复实体已合并",
}


PREFIX_TRANSLATIONS = {
    "Unable to get chat response due to ": "获取聊天回答失败：",
    "Failed To Process File:": "文件处理失败：",
    "LLM Unable To Parse Content due to ": "LLM 无法解析内容，原因：",
    "Unable to delete document ": "无法删除文档 ",
    "Status set to Ready to Reprocess for filename : ": "已将文件状态设置为准备重新处理：",
    "Total elapsed API time ": "接口总耗时 ",
}


def translate_response_text(value):
    if not isinstance(value, str):
        return value
    if value in EXACT_TRANSLATIONS:
        return EXACT_TRANSLATIONS[value]
    translated = value
    for source, target in PREFIX_TRANSLATIONS.items():
        translated = translated.replace(source, target)
    return translated

def create_api_response(status,success_count=None,failed_count=None, data=None, error=None,message=None,file_source=None,file_name=None):
    """
    Create a response to be sent to the API. This is a helper function to create a JSON response that can be sent to the API.
    
    Args:
        status: The status of the API call. Should be one of the constants in this module.
        data: The data that was returned by the API call.
        error: The error that was returned by the API call.
        success_count: Number of files successfully processed.
        failed_count: Number of files failed to process.
    Returns: 
      A dictionary containing the status data and error if any
    """
    response = {"status": status}

    # Set the data of the response
    if data is not None:
      response["data"] = data

    # Set the error message to the response.
    if error is not None:
      response["error"] = translate_response_text(error)
    
    if success_count is not None:
      response['success_count']=success_count
      response['failed_count']=failed_count
    
    if message is not None:
      response['message']=translate_response_text(message)

    if file_source is not None:
      response['file_source']=file_source

    if file_name is not None:
      response['file_name']=file_name
      
    return response
