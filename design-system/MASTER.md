# 时光印记 Pro — Design System

基于 ui-ux-pro-max 产品类型：**Photography Studio** + **AI/Chatbot Platform**

## 风格定位

- **Primary**: Minimalism + Flat Design
- **Secondary**: Dark Mode (OLED) + Motion-Driven
- **Pattern**: Interactive Product Demo + Hero-Centric
- **Stack**: Next.js + Tailwind (html-tailwind)

## 色彩系统

| 角色 | 色值 | 用法 |
|------|------|------|
| 背景 | `#09090b` | 主背景 (zinc-950) |
| 表面 | `#18181b` | 卡片、模态 (zinc-900) |
| 边框 | `rgba(255,255,255,0.06)` | 分割线 |
| 正文 | `#fafafa` | 主文本 |
| 次要 | `#71717a` | 辅助文本 (zinc-500) |
| 强调 | `#0ea5e9` | CTA、链接、状态 (sky-500) |
| 成功 | `#22c55e` | 已完成、已配置 |
| 警告 | `#f59e0b` | 错误、清除 |

## 排版

- **字体**: Inter / system-ui（简洁、可读）
- **标题**: font-weight 600–700, tracking-tight
- **正文**: 14–16px, line-height 1.5–1.6
- **层次**: 清晰的 h1 > h2 > h3 > body > caption

## 组件规范

### 按钮
- 主按钮: `bg-accent hover:bg-accent/90`, `transition-colors duration-200`
- 次按钮: `bg-white/5 hover:bg-white/10`
- 触摸目标: 最小 44×44px

### 卡片
- `rounded-xl` (12px)，`border border-white/5`
- Hover: `border-white/10`，无 layout shift

### 输入框
- `rounded-lg`，`border` focus 时 `ring-2 ring-accent/30`
- Placeholder: `text-zinc-500`

## UX 规则（ui-ux-pro-max）

- ✓ 所有可点击元素 `cursor-pointer`
- ✓ Hover 提供视觉反馈
- ✓ 过渡 150–300ms
- ✓ 使用 Lucide 图标（不用 emoji）
- ✓ Focus 状态可见
- ✓ 触摸目标 ≥ 44px
- ✓ 尊重 `prefers-reduced-motion`

## 避免

- 过多渐变/光晕
- 过圆角 (rounded-3xl 仅在 hero)
- 动画 > 500ms
- 纯色传达信息（需配合图标/文字）
