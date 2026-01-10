# Architecture — 教师签到管理系统（React + Node.js + Postgres）

## 1. 总体架构概览

### 1.1 组件

- **Frontend**：React（JavaScript）单页应用（SPA）
- **Backend**：Node.js REST API（Express 或 Fastify，推荐 Express 先做简单）
- **Database**：PostgreSQL（持久化课程/课次/学生/签到记录）
- **Auth**：JWT（Bearer Token）

### 1.2 运行时数据流

浏览器（React 页面）
→ 调用后端 API（JWT 鉴权）
→ 后端 Service 处理业务 & 校验权限
→ Repository 读写 Postgres
→ 返回 JSON 给前端渲染

------

## 2. 前端架构（React + MVVM 思路）

> 不用 TS，用 JS；但仍建议用“分层目录”和 JSDoc 注释保持可维护性。

### 2.1 分层原则

- **View（页面/组件）**：只管展示和交互触发（按钮点击、表单输入）
- **ViewModel（状态+页面逻辑）**：维护页面状态、调用 Service、处理交互流程
- **Service（API 请求）**：封装 axios/fetch，统一 baseURL、token、错误处理
- **Model（数据结构约定）**：用 JSDoc/注释描述字段（与后端返回保持一致）

### 2.2 推荐目录结构

```
src/
  app/
    router.js
    layout/
  shared/
    api/
      http.js            # axios实例，注入token
      auth.js            # token存取
    ui/                  # 通用组件：Button, Modal, Table...
    utils/
  modules/
    auth/
      views/
      vm/
      service/
      model/
    course/
      views/
      vm/
      service/
      model/
    session/             # 课次（排课 + 本周课表 + 签到入口）
      views/
      vm/
      service/
      model/
    student/
      views/
      vm/
      service/
      model/
    attendance/
      views/
      vm/
      service/
      model/
```

### 2.3 页面路由（MVP）

- `/login`
- `/` 本周课程表（来自“课次 sessions”，按周筛选）
- `/courses` 课程列表
- `/courses/new` 新建课程
- `/courses/:courseId` 课程详情（含课次列表、学生名单、统计入口）
- `/courses/:courseId/sessions/new` 为该课程新增课次（自定义日期时间）
- `/sessions/:sessionId/checkin` 签到页
- `/courses/:courseId/students/:studentId` 学生在该课程下的统计&明细

------

## 3. 后端架构（Node.js 分层）

### 3.1 分层结构

- **Routes/Controllers**：定义路由、解析参数、返回 JSON
- **Services**：业务逻辑（创建课次、初始化签到、统计口径）
- **Repositories (DAO)**：只负责数据库 CRUD
- **Middlewares**：JWT 鉴权、错误处理、CORS
- **Validation**：请求体校验（zod/joi，建议 zod）

### 3.2 推荐目录结构

```
server/
  src/
    app.js
    routes/
      auth.routes.js
      courses.routes.js
      students.routes.js
      sessions.routes.js
      attendance.routes.js
      stats.routes.js
    controllers/
    services/
    repositories/
    middleware/
      auth.middleware.js
      error.middleware.js
    db/
      pool.js            # pg连接池
      migrations/        # SQL迁移
```

### 3.3 安全与权限原则（必须）

- 除注册/登录外，所有 API 需要 JWT
- **所有资源按 teacher_id 隔离**：
  - 课程 courses.teacher_id
  - 学生 students.teacher_id
  - 任何查询必须确保“当前 teacher 拥有该课程/学生/课次”

------

## 4. 核心数据架构（PostgreSQL 表设计）

> 你的排课模型已改为“每节课次都可自定义时间”，所以不再需要 course_rules。周课表直接查询 sessions。

### 4.1 teachers（教师）

- `id` UUID PK
- `email` VARCHAR(255) UNIQUE NOT NULL
- `password_hash` TEXT NOT NULL
- `name` VARCHAR(80) NOT NULL
- `created_at` TIMESTAMPTZ DEFAULT now()

### 4.2 courses（课程）

- `id` UUID PK
- `teacher_id` UUID FK → teachers(id) ON DELETE CASCADE
- `title` VARCHAR(120) NOT NULL
- `location` VARCHAR(120) NULL
- `total_planned_sessions` INT NOT NULL DEFAULT 0 （“计划总课次”，用于目标对比）
- `created_at` TIMESTAMPTZ DEFAULT now()
- `updated_at` TIMESTAMPTZ DEFAULT now()

索引：

- `(teacher_id)`
- `(teacher_id, title)`

### 4.3 students（学生库，按教师隔离）

- `id` UUID PK
- `teacher_id` UUID FK → teachers(id) ON DELETE CASCADE
- `student_no` VARCHAR(64) NULL
- `name` VARCHAR(80) NOT NULL
- `note` TEXT NULL
- `created_at` TIMESTAMPTZ DEFAULT now()

索引/建议约束：

- `(teacher_id)`
- 可选唯一：`UNIQUE(teacher_id, student_no)`

### 4.4 course_students（课程-学生关系）

- `course_id` UUID FK → courses(id) ON DELETE CASCADE
- `student_id` UUID FK → students(id) ON DELETE CASCADE
- `joined_at` TIMESTAMPTZ DEFAULT now()
- **PK** `(course_id, student_id)`

索引：

- `(student_id)`

### 4.5 sessions（课次：每一节课都单独建）

- `id` UUID PK
- `course_id` UUID FK → courses(id) ON DELETE CASCADE
- `starts_at` TIMESTAMPTZ NOT NULL （课次开始时间：含日期+时间）
- `ends_at` TIMESTAMPTZ NOT NULL （课次结束时间）
- `location` VARCHAR(120) NULL （可覆盖课程地点）
- `status` VARCHAR(20) NOT NULL DEFAULT 'scheduled'
  - `scheduled`：已排课但未签到
  - `open`：签到中（开始本节课后）
  - `closed`：签到完成/锁定
- `created_at` TIMESTAMPTZ DEFAULT now()

索引：

- `(course_id, starts_at)`
- `(starts_at)`（周课表按时间范围查）

**关键约束建议（避免重复课次）**

- 可选：`UNIQUE(course_id, starts_at)`（同课程同开始时间不重复）

### 4.6 attendance_records（签到记录）

- `id` UUID PK
- `session_id` UUID FK → sessions(id) ON DELETE CASCADE
- `student_id` UUID FK → students(id) ON DELETE CASCADE
- `status` VARCHAR(20) NOT NULL
  - `present` `late` `leave` `absent`
- `note` TEXT NULL
- `marked_at` TIMESTAMPTZ DEFAULT now()

约束：

- `UNIQUE(session_id, student_id)`（同课次同学生只能一条记录）

索引：

- `(session_id)`
- `(student_id)`
- `(status)`

------

## 5. API 设计（MVP，REST）

> base：`/api`
> 鉴权：`Authorization: Bearer <token>`
> 返回统一 JSON：`{ data, error }` 或直接 `data`（二选一，建议统一）

### 5.1 Auth

**POST** `/api/auth/register`
body：`{ email, password, name }`

**POST** `/api/auth/login`
body：`{ email, password }`
resp：`{ token, teacher:{id,name,email} }`

**GET** `/api/auth/me`

------

### 5.2 Courses（课程）

**POST** `/api/courses`
body：`{ title, location, totalPlannedSessions }`

**GET** `/api/courses`（当前教师课程列表，可带 q 搜索）
query：`?q=`

**GET** `/api/courses/:courseId`

**PATCH** `/api/courses/:courseId`
body：可改 `title/location/totalPlannedSessions`

**DELETE** `/api/courses/:courseId`

------

### 5.3 Students（学生库）

**POST** `/api/students`
body：`{ name, studentNo, note }`

**GET** `/api/students`
query：`?q=`

**GET** `/api/students/:studentId`

------

### 5.4 Course roster（课程学生名单）

**POST** `/api/courses/:courseId/students`
body：`{ studentId }`

**GET** `/api/courses/:courseId/students`

**DELETE** `/api/courses/:courseId/students/:studentId`

------

### 5.5 Sessions（课次排课 + 本周课表来源）

#### 5.5.1 为课程新增课次（你要的“每节课自定义时间”）

**POST** `/api/courses/:courseId/sessions`
body：

```json
{
  "startsAt": "2026-01-10T09:00:00+04:00",
  "endsAt": "2026-01-10T10:30:00+04:00",
  "location": "A101"
}
```

resp：`{ sessionId }`

#### 5.5.2 课程课次列表（历史/未来）

**GET** `/api/courses/:courseId/sessions`
query：`?from=2026-01-01&to=2026-02-01`

#### 5.5.3 本周课程表（按时间范围取课次）

**GET** `/api/sessions`
query：`?from=...&to=...`（前端传本周周一00:00 到下周一00:00）
resp：返回按时间排序的 sessions，并带 course 标题/地点等摘要字段（减少前端二次请求）

#### 5.5.4 获取课次详情（含签到表）

**GET** `/api/sessions/:sessionId`
resp：

- session 基本信息
- 该课次的 attendance_records（含学生姓名/学号，便于直接渲染）

------

### 5.6 Attendance（签到）

#### 5.6.1 开始本节课（将课次状态改为 open，并初始化签到记录）

**POST** `/api/sessions/:sessionId/open`
后端行为：

- 校验该 session 属于当前 teacher
- 将 sessions.status → `open`
- 为该课程的所有学生创建 attendance_records（不存在才创建）
- 默认状态建议 `present`（老师省事）

resp：`{ ok: true }`

#### 5.6.2 批量保存签到

**PATCH** `/api/sessions/:sessionId/attendance`
body：

```json
{
  "records": [
    { "studentId": "uuid", "status": "late", "note": "迟到10分钟" }
  ]
}
```

#### 5.6.3 关闭课次

**POST** `/api/sessions/:sessionId/close`
行为：sessions.status → `closed`
（是否禁止再改签到：MVP 可以先允许，后续再加锁定）

------

### 5.7 Stats（统计）

#### 5.7.1 课程统计（每个学生一行）

**GET** `/api/courses/:courseId/stats`
返回：

- `totalPlannedSessions`（课程计划）
- `sessionsCount`（已排课/已发生课次数量，可按需求选择统计口径：全部 sessions 或只统计 open/closed）
- 每个学生：present/late/leave/absent 次数 + rate

#### 5.7.2 学生在某课程的明细

**GET** `/api/courses/:courseId/students/:studentId/stats`
返回 summary + records（按 session.startsAt 排序）

------

## 6. 关键业务规则（必须写清）

### 6.1 “计划总课次” vs “已排课课次”

- `courses.total_planned_sessions`：老师手动设定目标（例如 16）
- `sessions`：真实排出来的每一节课（时间可变）
- 统计时可同时展示：
  - 计划总课次
  - 已排课次数（sessions count）
  - 已完成课次（status=closed count）

### 6.2 签到初始化策略

- 当 session open 时：
  - 针对该课程当前学生名单，生成 `attendance_records`
  - 默认 `present`（推荐），老师只改异常

### 6.3 权限隔离

- session → course → teacher 必须一致
- 课程学生名单 course_students 中的学生必须属于同一个 teacher

------

## 7. 部署架构（简版，供后续落地）

- Frontend：Vercel/Netlify（构建 React 静态站）
- Backend：Render/Fly.io/Railway（Node API）
- Database：同平台托管 Postgres
- 环境变量（后端）：
  - `DATABASE_URL`
  - `JWT_SECRET`
  - `CORS_ORIGIN`（前端域名）

------

## 8. 错误处理与返回规范（建议）

- 400：参数校验失败
- 401：未登录/Token 无效
- 403：无权限（访问他人课程/学生/课次）
- 404：资源不存在
- 409：冲突（如重复创建同 course_id + starts_at 的 session）
- 500：服务端异常