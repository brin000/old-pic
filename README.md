# 时光印记 Pro (Old-Pic)

> AI 驱动的老旧照片批量修复与增强工具，基于 Google Gemini 实现智能检测、裁剪、去污与上色。

## 项目介绍

时光印记 Pro 是一款面向批量历史照片修复的 Web 应用。通过对接 Google Gemini 多模态能力，对扫描件进行目标检测、透视校正、划痕与噪点去除、以及 historically-accurate 色彩还原，帮助用户一键完成多张老照片的修复与增强。

## 主要功能

- **批量处理**：支持多图上传，队列式处理，状态实时反馈
- **AI 修复流程**：目标检测与智能裁剪 → 透视校正 → 划痕/粉尘/噪点去除 → 历史感色彩还原
- **任务管理**：待处理 / 处理中 / 完成 / 失败 状态追踪
- **对比预览**：修复前后对比展示
- **访问控制**：可选访问密钥（Cookie + SHA-256），支持 API Key 配置与持久化

## 技术栈

| 类别 | 技术 |
|------|------|
| 框架 | Next.js 16（App Router） |
| 语言 | TypeScript |
| 前端 | React 19、Tailwind CSS 4 |
| AI | Google Gemini 2 Pro Image Preview |
| 部署 | Cloudflare（OpenNext.js 适配器） |

## 技术要点

- **服务端 API**：`POST /api/restore` 接收 base64 图像，调用 Gemini 完成修复，返回 data URL
- **中间件鉴权**：基于 Cookie 的访问控制，支持 SHA-256 哈希校验
- **客户端状态**：任务队列、上传与预览状态管理
- **类型安全**：TypeScript 全栈实现
- **适配 Cloudflare**：OpenNext.js Cloudflare adapter 部署配置

## 快速开始

```bash
npm install
npm run dev
```

访问 [http://localhost:3000](http://localhost:3000) 即可使用。

## 部署

```bash
npm run deploy   # Cloudflare 部署
```

