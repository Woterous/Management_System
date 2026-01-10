# Checklist — 教师签到管理系统（React + Node.js + Postgres）完成步骤索引

> 目标：按顺序做，做到哪一步就能跑到哪一步。每个大项都可独立验收。

------

## 0. 需求与范围锁定

-  0.1 确认 MVP 功能：登录/课程/学生/课次 sessions/签到/统计/本周课表
-  0.2 确认出勤状态枚举：present / late / leave / absent
-  0.3 确认“计划总课次”来源：courses.total_planned_sessions（手动设置）

------

## 1. 开发环境准备

-  1.1 安装 Node.js（建议 LTS）与 pnpm
-  1.2 安装 Git
-  1.3 安装 PostgreSQL（本地）或准备 Docker（可选）
-  1.4 创建项目文件夹与 Git 仓库（mono repo 或前后端分开）

------

## 2. 项目初始化（前后端）

### 2.1 前端初始化（React + JS）

-  2.1.1 `pnpm create vite` 创建 React 项目（JavaScript）
-  2.1.2 安装依赖：react-router-dom、axios（及 UI 库可选）
-  2.1.3 配置路由骨架（/login, /, /courses…）
-  2.1.4 配置 API 基础封装（baseURL、token 注入）
-  2.1.5 前端能 `pnpm dev` 正常启动

### 2.2 后端初始化（Node.js）

-  2.2.1 初始化 server：`pnpm init`
-  2.2.2 安装依赖：express、cors、dotenv、pg、jsonwebtoken、bcrypt（校验库可选 zod）
-  2.2.3 创建 app.js、路由与中间件骨架
-  2.2.4 后端能 `pnpm run dev` 启动并响应 `/health`

------

## 3. 数据库搭建（Postgres）

-  3.1 创建数据库（例如 `attendance_app`）
-  3.2 建表脚本（teachers / courses / students / course_students / sessions / attendance_records）
-  3.3 创建索引与约束（UNIQUE(session_id, student_id)，可选 UNIQUE(course_id, starts_at)）
-  3.4 配置 `DATABASE_URL` 环境变量
-  3.5 后端能成功连接数据库（启动时报连接成功或简单查询通过）

------

## 4. 鉴权与账户（Auth）

### 4.1 后端

-  4.1.1 实现注册：POST /api/auth/register（bcrypt hash）
-  4.1.2 实现登录：POST /api/auth/login（生成 JWT）
-  4.1.3 实现鉴权中间件（解析 Bearer Token → req.teacher）
-  4.1.4 实现 GET /api/auth/me

### 4.2 前端

-  4.2.1 登录页 UI + 表单提交
-  4.2.2 token 存储（localStorage）
-  4.2.3 axios 拦截器自动带 Authorization
-  4.2.4 路由保护：未登录跳转 /login

------

## 5. 课程模块（Courses）

### 5.1 后端 API

-  5.1.1 POST /api/courses（teacher_id 绑定当前用户）
-  5.1.2 GET /api/courses（只查当前 teacher）
-  5.1.3 GET /api/courses/:courseId（权限校验）
-  5.1.4 PATCH /api/courses/:courseId
-  5.1.5 DELETE /api/courses/:courseId（级联）

### 5.2 前端页面

-  5.2.1 课程列表页（展示 + 跳转详情）
-  5.2.2 新建课程页（title/location/totalPlannedSessions）
-  5.2.3 课程详情页骨架（tabs/区域：学生、课次、统计）

------

## 6. 学生模块（Students + 课程名单）

### 6.1 后端 API

-  6.1.1 POST /api/students（归属 teacher）
-  6.1.2 GET /api/students（支持 q 搜索）
-  6.1.3 GET /api/students/:studentId（权限校验）
-  6.1.4 POST /api/courses/:courseId/students（加入课程）
-  6.1.5 GET /api/courses/:courseId/students（课程名单）
-  6.1.6 DELETE /api/courses/:courseId/students/:studentId（移除）

### 6.2 前端页面

-  6.2.1 课程详情页：学生名单显示
-  6.2.2 新增学生弹窗/页面（name/studentNo/note）
-  6.2.3 将学生加入课程（选择已有学生或快速创建后加入）
-  6.2.4 从课程移除学生

------

## 7. 课次模块（Sessions：每节课自定义时间）

### 7.1 后端 API

-  7.1.1 POST /api/courses/:courseId/sessions（创建 scheduled session）
-  7.1.2 GET /api/courses/:courseId/sessions（可按 from/to 过滤）
-  7.1.3 GET /api/sessions?from&to（用于“本周课表”，按时间范围查）
-  7.1.4 GET /api/sessions/:sessionId（含签到表数据）
-  7.1.5 可选：课程同 starts_at 去重（409 冲突）

### 7.2 前端页面

-  7.2.1 课程详情页：课次列表（scheduled/open/closed）
-  7.2.2 新增课次页：自定义 startsAt/endsAt/location
-  7.2.3 本周课表页：调用 /api/sessions?from&to 展示本周课次

------

## 8. 签到模块（Attendance）

### 8.1 后端 API

-  8.1.1 POST /api/sessions/:sessionId/open
  -  初始化签到记录（给该课程所有学生创建 attendance_records，不存在才插入）
  -  默认状态（推荐 present）
  -  session.status → open
-  8.1.2 PATCH /api/sessions/:sessionId/attendance（批量更新 status/note）
-  8.1.3 POST /api/sessions/:sessionId/close（status → closed）

### 8.2 前端页面

-  8.2.1 签到页加载：GET /api/sessions/:sessionId（拿学生+状态）
-  8.2.2 “开始本节课”按钮：调用 open
-  8.2.3 一键全员出勤（本地状态全设 present）
-  8.2.4 单个学生切换状态（present/late/leave/absent）
-  8.2.5 保存：批量 PATCH attendance
-  8.2.6 关闭课次（可选按钮）

------

## 9. 统计模块（Stats）

### 9.1 后端 API

-  9.1.1 GET /api/courses/:courseId/stats（每个学生一行统计）
-  9.1.2 GET /api/courses/:courseId/students/:studentId/stats（summary + 明细）

### 9.2 前端页面

-  9.2.1 课程详情页：展示学生统计表（出勤/迟到/请假/缺勤/出勤率）
-  9.2.2 学生详情页：展示 summary + records（按日期排序）

------

## 10. 质量与验收

-  10.1 权限验收：登录 A 不能访问 B 的 course/student/session
-  10.2 数据一致性：同 session+student 只能一条签到记录
-  10.3 课次不重复：同 course_id + starts_at 重复返回 409（如果启用）
-  10.4 MVP 验收用例全跑通：
  -  注册/登录
  -  新建课程
  -  创建学生并加入课程
  -  新增课次（自定义时间）
  -  本周课表可见
  -  开始签到、修改状态、保存
  -  课程统计与学生详情统计正确

------

## 11. 部署上线（可选，但建议你做）

### 11.1 数据库与后端部署

-  11.1.1 选择平台（Render/Fly.io/Railway 任一）
-  11.1.2 创建托管 Postgres，拿到 `DATABASE_URL`
-  11.1.3 部署 Node API，配置环境变量：DATABASE_URL、JWT_SECRET、CORS_ORIGIN
-  11.1.4 线上 API 健康检查通过

### 11.2 前端部署

-  11.2.1 Vercel/Netlify 部署 React
-  11.2.2 配置前端 API baseURL 指向线上后端
-  11.2.3 线上登录、课程、签到走通

### 11.3 域名（可选）

-  11.3.1 购买域名
-  11.3.2 绑定前端域名（www）
-  11.3.3 绑定后端子域名（api）