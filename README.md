# 我的健康手账

个人饮食与健康记录网页。网站地址（仅站点所有者可访问）：https://my-health-journal-1108.mauveclef1.chatgpt.site

## 功能

- 按日期记录餐食与摄入热量；可用每 100 克热量和食用重量自动计算。
- 搜索 124 种常见中文食物，或搜索 8,790 条完整 USDA 英文食物记录。参考值来自 [USDA Standard Reference 28](https://fdc.nal.usda.gov/download-datasets/) 的 ABBREV 数据（2016 年）。
- 每天北京时间 08:00 生成昨日饮食回顾，显示已记录的热量、可改进的记录线索、今日自设目标和一般饮食参考。报告仅根据已记录信息生成，不能诊断健康问题。
- 设置每日摄入、饮水、活动和睡眠参考目标；记录饮水、体重、活动与睡眠，查看近 7 天摄入趋势。
- 导出或导入 JSON 备份。

## 使用与数据

打开网站后，原有浏览器记录会同步到这个仅站点所有者可访问的网站，以便每天早上在网站关闭时仍能生成报告。新记录同时保留在当前浏览器，并同步到网站云端存储。页面“数据备份”处会显示同步状态；建议定期导出备份。公开 GitHub 仓库只保存网页源码和 USDA 参考数据，不保存个人健康记录。

在“常见中文”中搜索中文名称；需要更多食物时切换“完整 USDA（英文）”，输入至少两个英文字母，例如 rice、chicken、tofu。选择食物后填写实际食用重量。热量受品牌、烹饪方式和调味影响，以包装或食谱为准。

晨间建议参考 [WHO 健康饮食原则](https://www.who.int/news-room/fact-sheets/detail/healthy-diet) 与 [USDA MyPlate](https://www.myplate.gov/) 的一般性内容。网站无法识别全部营养素、过敏原、疾病或个人医疗需求，需要个性化医疗建议时应咨询专业人士。

## 构建

运行 `node scripts/build-worker.mjs`，生成 `dist/server/index.js`。站点部署使用 `.openai/hosting.json` 中的 Worker 与私有 R2 存储配置。
