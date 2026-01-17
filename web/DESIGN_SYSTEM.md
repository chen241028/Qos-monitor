# 设计系统文档

基于 UI/UX Pro Max 生成的设计系统

## 设计模式

**Immersive/Interactive Experience**
- 全屏交互元素
- 引导式产品体验
- 关键功能逐步揭示
- 完成后的 CTA

## 视觉风格

**Dark Mode (OLED)**
- 深色主题，低光环境友好
- 高对比度，符合 WCAG AAA 标准
- OLED 设备优化，低功耗
- 眼部友好，适合长时间使用

## 颜色方案

- **主色调 (Primary)**: `#4F46E5` (Indigo)
- **次要色 (Secondary)**: `#818CF8` (Light Indigo)
- **CTA 按钮**: `#F97316` (Orange)
- **背景**: `#0A0A0F` (深黑)
- **文本**: `#EEF2FF` (浅灰白)

## 字体

- **代码/数据**: Fira Code (等宽字体)
- **界面**: Fira Sans (无衬线字体)
- **用途**: 仪表板、数据分析、代码显示

Google Fonts 链接:
```
https://fonts.googleapis.com/css2?family=Fira+Code:wght@400;500;600;700&family=Fira+Sans:wght@300;400;500;600;700
```

## 视觉效果

- **文字发光**: `text-shadow: 0 0 10px rgba(79, 70, 229, 0.6)`
- **卡片发光**: `box-shadow: 0 0 20px rgba(79, 70, 229, 0.3)`
- **过渡动画**: 150-300ms 平滑过渡
- **暗色到亮色渐变**: 低亮度发射，高可读性

## 交互原则

- ✅ 所有可点击元素使用 `cursor-pointer`
- ✅ 悬停状态提供视觉反馈
- ✅ 平滑过渡动画 (150-300ms)
- ✅ 支持键盘导航的焦点状态
- ✅ 尊重 `prefers-reduced-motion`

## 响应式设计

支持断点:
- 375px (移动设备)
- 768px (平板)
- 1024px (桌面)
- 1440px (大屏)

## 避免的反模式

- ❌ 慢速更新 + 无自动化
- ❌ 无反馈的交互
- ❌ 过长的加载时间
