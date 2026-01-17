# QoS 网络竞速监控

一个交互式的游戏化网络质量体验应用，通过卡片系统和竞速游戏让用户感受网络性能的差异。

## 特性

- 🎮 **游戏化体验**: 通过竞速游戏展示网络性能差异
- 🃏 **卡片系统**: 抽取不同稀有度的网络卡片（SSR/SR/R）
- 📊 **实时分析**: 比赛后生成详细的性能分析报告
- 📈 **Grafana 集成**: 右侧面板显示 Grafana 仪表板（可选）
- 🎨 **现代 UI**: 基于 UI/UX Pro Max 设计系统的暗色主题

## 技术栈

- React 18 + TypeScript
- Vite
- Tailwind CSS
- Zustand (状态管理)
- Framer Motion (动画)
- Lucide React (图标)

## 开始使用

### 安装依赖

```bash
npm install
```

### 开发模式

```bash
npm run dev
```

### 构建

```bash
npm run build
```

### 预览

```bash
npm run preview
```

## 配置 Grafana

如果需要显示 Grafana 仪表板，请设置环境变量：

```bash
VITE_GRAFANA_URL=https://your-grafana-url.com/dashboard
```

或创建 `.env.local` 文件：

```
VITE_GRAFANA_URL=https://your-grafana-url.com/dashboard
```

## 游戏流程

1. **开始屏幕**: 点击"开始游戏"进入游戏
2. **抽取卡片**: 抽取 3 张网络卡片，每张卡片有不同的性能属性
3. **竞速比赛**: 观看两个网络竞速，比赛持续约 10 秒
4. **结果分析**: 查看比赛结果和详细的性能分析
5. **重试/新局**: 可以选择重新开始或抽取新卡片开始新的一局

## 卡片系统

卡片分为以下类别：
- **带宽** (Bandwidth): 影响网络传输速度
- **延迟** (Latency): 影响响应速度
- **抖动** (Jitter): 影响网络稳定性
- **丢包** (Packet Loss): 影响数据传输可靠性
- **特殊事件** (Special): 各种特殊网络事件

稀有度等级：
- **SSR**: 超稀有，性能优异
- **SR**: 稀有，性能良好
- **R**: 普通，性能一般

## 设计系统

基于 UI/UX Pro Max 设计系统：

- **主题**: 暗色模式 (OLED)
- **主色调**: Indigo (#4F46E5)
- **强调色**: Orange (#F97316)
- **字体**: Fira Code / Fira Sans
- **效果**: 最小化发光效果，平滑过渡动画

## 项目结构

```
web/
├── src/
│   ├── components/      # React 组件
│   ├── data/           # 卡片数据
│   ├── store/          # Zustand 状态管理
│   ├── types/          # TypeScript 类型定义
│   ├── utils/          # 工具函数
│   ├── App.tsx         # 主应用组件
│   └── main.tsx        # 入口文件
├── .shared/
│   └── ui-ux-pro-max/  # UI/UX Pro Max 设计系统
└── ...
```

## 许可证

MIT
