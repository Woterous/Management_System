# 教师签到管理系统

一个面向教师的课程/学生/课次/签到管理全栈应用，前端 React + Vite + Tailwind，后端 Node/Express + PostgreSQL。

## 功能
- 教师注册/登录（JWT）
- 课程管理：列表、详情、课次、学生名单
- 学生管理：列表、新建、搜索、加入/移除课程
- 课次管理：批量选日期+时间新增课次（支持范围多选）
- 签到：开课、修改状态、保存、关闭
- 统计：课程维度、学生维度（出勤、迟到、请假、缺勤）

## 目录
```
server/      后端 Express 服务
frontend/    前端 Vite+React
docs/        需求/架构/清单文档
```

## 环境变量
后端（Render/本地）：
- `DATABASE_URL`：Postgres 连接串
- `JWT_SECRET`：JWT 密钥
- `PORT`：监听端口（Render 自动注入）
- `CORS_ORIGIN`：前端域名或 `*`

前端：
- `VITE_API_BASE_URL`：后端地址，示例 `https://your-api-domain.com/api`

## 本地启动
后端：
```bash
cd server
pnpm install
pnpm dev          # http://localhost:3000
```
前端：
```bash
cd frontend
pnpm install
pnpm dev          # http://localhost:5173
```

## 构建与部署
后端（Render 示例）：
- Root Directory: `server`
- Build Command: `pnpm install`
- Start Command: `pnpm start`
- 环境变量：`DATABASE_URL`（Render Internal URL）、`JWT_SECRET`、`NODE_ENV=production`、`CORS_ORIGIN`

前端（Vercel/Netlify 示例）：
- Root: `frontend`
- Build: `pnpm install && pnpm run build`
- Output: `dist`
- Env: `VITE_API_BASE_URL=https://<后端域名>/api`

## 关键接口（后端）
- Auth: `POST /api/auth/login`、`POST /api/auth/register`、`GET /api/auth/me`
- Courses: `GET/POST /api/courses`、`GET/PATCH/DELETE /api/courses/:courseId`
- Students: `GET/POST /api/students`、`GET /api/students/:studentId`
- 课程学生：`POST /api/courses/:courseId/students`、`GET /api/courses/:courseId/students`、`DELETE /api/courses/:courseId/students/:studentId`
- Sessions：`POST /api/courses/:courseId/sessions`、`GET /api/courses/:courseId/sessions`、`GET /api/sessions`（周课表）`GET /api/sessions/:sessionId`
- Attendance：`POST /api/sessions/:sessionId/open`、`PATCH /api/sessions/:sessionId/attendance`、`POST /api/sessions/:sessionId/close`
- Stats：`GET /api/stats/courses/:courseId`、`GET /api/stats/courses/:courseId/students/:studentId`

## 前端亮点
- 底部导航（移动优先），页面切换与卡片轻动画
- 课次创建：Flowbite 日历 + 双滚轮时间选取，支持多日期多时段批量创建
- 学生出勤统计：日历高亮出勤状态，滚轮选择年份/月，显示备注
- 课程详情：搜索/新建并加入学生，课次列表直达签到

## 开发提示
- Tailwind 3 + Flowbite 样式在 `frontend/src/main.jsx` 引入 CSS，`tailwind.config.js` 已包含 flowbite 路径与插件。
- 新建学生、课程、课次等表单已接入真实 API，若接口 401 会被 http 拦截器重定向登录。

