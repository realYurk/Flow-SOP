module.exports = {
  collections: [
    {
      id: "col-1",
      name: "VFB Project",
      icon: "⚡",
      color: "#6366f1",
      sortOrder: 0,
      folders: [
        {
          id: "fol-1",
          name: "Auth Module",
          sortOrder: 0,
          sopItems: [
            {
              id: "sop-1",
              title: "快速构建 JWT 登录模块",
              sortOrder: 0,
              mermaidSource: "graph LR\n  A[客户端请求] --> B{携带 Token?}\n  B -- 是 --> C[JWT 过滤器]\n  C -- 有效 --> D[Controller]\n  C -- 无效 --> E[401]\n  B -- 否 --> F[登录接口]\n  F --> G[校验凭据]\n  G -- 通过 --> H[颁发 JWT]\n  G -- 失败 --> I[403]",
              variables: { PROJECT_NAME: "vfb-budget", JWT_SECRET: "your-256-bit-secret" },
              actionCards: [
                {
                  id: "card-1",
                  title: "Step 1 · 添加 Maven 依赖",
                  language: "xml",
                  completed: false,
                  sortOrder: 0,
                  code: "<dependency>\n    <groupId>org.springframework.boot</groupId>\n    <artifactId>spring-boot-starter-security</artifactId>\n</dependency>\n<dependency>\n    <groupId>io.jsonwebtoken</groupId>\n    <artifactId>jjwt-api</artifactId>\n    <version>0.12.3</version>\n</dependency>",
                  notes: "⚠️ 引入 security 后所有端点默认拦截，务必配置 permitAll 白名单"
                },
                {
                  id: "card-2",
                  title: "Step 2 · SecurityFilterChain 配置",
                  language: "java",
                  completed: false,
                  sortOrder: 1,
                  code: "@Bean\npublic SecurityFilterChain filterChain(HttpSecurity http) throws Exception {\n    return http\n        .csrf(csrf -> csrf.disable())\n        .sessionManagement(s -> s.sessionCreationPolicy(STATELESS))\n        .authorizeHttpRequests(auth -> auth\n            .requestMatchers(\"/api/auth/**\").permitAll()\n            .anyRequest().authenticated()\n        )\n        .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class)\n        .build();\n}",
                  notes: "STATELESS 下 Spring 不创建 Session，适合前后端分离场景"
                },
                {
                  id: "card-3",
                  title: "Step 3 · JWT 工具类",
                  language: "java",
                  completed: false,
                  sortOrder: 2,
                  code: "@Component\npublic class JwtUtil {\n    @Value(\"${jwt.secret}\")\n    private String secret;\n\n    public String generate(String username) {\n        return Jwts.builder()\n            .subject(username)\n            .issuedAt(new Date())\n            .expiration(new Date(System.currentTimeMillis() + 86_400_000))\n            .signWith(Keys.hmacShaKeyFor(secret.getBytes()))\n            .compact();\n    }\n\n    public boolean isValid(String token) {\n        try { extractUser(token); return true; }\n        catch (JwtException e) { return false; }\n    }\n}",
                  notes: "jwt.secret 至少 32 字符，生产环境通过环境变量注入"
                },
                {
                  id: "card-4",
                  title: "Step 4 · application.yml",
                  language: "yaml",
                  completed: false,
                  sortOrder: 3,
                  code: "jwt:\n  secret: ${JWT_SECRET:{{JWT_SECRET}}}\n  expiration: 86400000\n\nspring:\n  security:\n    user:\n      name: disabled",
                  notes: "{{JWT_SECRET}} 会被顶部变量自动替换"
                }
              ]
            },
            {
              id: "sop-2",
              title: "Token 刷新机制设计",
              sortOrder: 1,
              mermaidSource: "sequenceDiagram\n  Client->>API: 携带过期 AccessToken\n  API-->>Client: 401 Token Expired\n  Client->>API: POST /auth/refresh (RefreshToken)\n  API->>DB: 校验 RefreshToken\n  DB-->>API: Valid\n  API-->>Client: 新 AccessToken + 新 RefreshToken\n  Client->>API: 重试原请求",
              variables: {},
              actionCards: [
                {
                  id: "card-5",
                  title: "Step 1 · Refresh Token 数据库表",
                  language: "sql",
                  completed: true,
                  sortOrder: 0,
                  code: "CREATE TABLE refresh_tokens (\n    id          BIGSERIAL PRIMARY KEY,\n    user_id     BIGINT NOT NULL,\n    token       VARCHAR(512) NOT NULL UNIQUE,\n    expires_at  TIMESTAMP NOT NULL,\n    created_at  TIMESTAMP DEFAULT NOW(),\n    revoked     BOOLEAN DEFAULT FALSE\n);",
                  notes: "expires_at 建议 30 天，定期清理过期 token 防止表膨胀"
                }
              ]
            }
          ]
        },
        {
          id: "fol-2",
          name: "Polars ETL Engine",
          sortOrder: 1,
          sopItems: [
            {
              id: "sop-3",
              title: "TM1 → PostgreSQL 高性能 ETL",
              sortOrder: 0,
              mermaidSource: "graph TD\n  A[TM1 Cube] --> B[TM1py 异步提取]\n  B --> C[Polars LazyFrame]\n  C --> D{Schema 校验}\n  D -- OK --> E[类型转换]\n  D -- FAIL --> F[错误日志]\n  E --> G[ADBC 批量写入]\n  G --> H[(PostgreSQL)]",
              variables: { DB_URL: "postgresql://user:pass@localhost:5432/vfb" },
              actionCards: [
                {
                  id: "card-6",
                  title: "Step 1 · TM1py 异步提取",
                  language: "python",
                  completed: false,
                  sortOrder: 0,
                  code: "import asyncio, polars as pl\nfrom TM1py import TM1Service\n\nasync def extract_cube(svc: TM1Service, mdx: str) -> pl.DataFrame:\n    loop = asyncio.get_event_loop()\n    raw = await loop.run_in_executor(\n        None, lambda: svc.cubes.cells.execute_mdx(mdx)\n    )\n    return pl.from_dicts([\n        {\"dims\": k, \"value\": v.get(\"Value\")}\n        for k, v in raw.items()\n    ])",
                  notes: "run_in_executor 避免 TM1py 同步调用阻塞事件循环"
                },
                {
                  id: "card-7",
                  title: "Step 2 · ADBC 零拷贝写入",
                  language: "python",
                  completed: false,
                  sortOrder: 1,
                  code: "import adbc_driver_postgresql.dbapi as adbc\n\ndef write_postgres(df: pl.DataFrame, table: str) -> int:\n    arrow = df.to_arrow()\n    with adbc.connect(\"{{DB_URL}}\") as conn:\n        with conn.cursor() as cur:\n            cur.adbc_ingest(table, arrow, mode=\"append\")\n        conn.commit()\n    return len(df)",
                  notes: "adbc_ingest 走 Arrow IPC，比 executemany 快 5-10x"
                }
              ]
            }
          ]
        }
      ]
    },
    {
      id: "col-2",
      name: "Personal DevOps",
      icon: "🚀",
      color: "#22c55e",
      sortOrder: 1,
      folders: [
        {
          id: "fol-3",
          name: "Docker Runbook",
          sortOrder: 0,
          sopItems: [
            {
              id: "sop-4",
              title: "Docker 生产部署标准流程",
              sortOrder: 0,
              mermaidSource: "graph TD\n  A[git push main] --> B[CI: 单元测试]\n  B -- pass --> C[docker build]\n  B -- fail --> D[❌ 通知]\n  C --> E[推送 Registry]\n  E --> F[SSH 服务器]\n  F --> G[docker compose pull]\n  G --> H[docker compose up -d]\n  H --> I{健康检查}\n  I -- 200 --> J[✅ 部署成功]\n  I -- fail --> K[⏪ 自动回滚]",
              variables: { SERVER_IP: "192.168.1.100", IMAGE_TAG: "latest" },
              actionCards: [
                {
                  id: "card-8",
                  title: "Step 1 · 多阶段 Dockerfile",
                  language: "dockerfile",
                  completed: false,
                  sortOrder: 0,
                  code: "FROM eclipse-temurin:17-jdk-alpine AS builder\nWORKDIR /app\nCOPY pom.xml .\nRUN mvn dependency:go-offline -q\nCOPY src ./src\nRUN mvn package -DskipTests -q\n\nFROM eclipse-temurin:17-jre-alpine\nWORKDIR /app\nRUN addgroup -S app && adduser -S app -G app\nCOPY --from=builder /app/target/*.jar app.jar\nUSER app\nEXPOSE 8080\nENTRYPOINT [\"java\",\"-Xmx512m\",\"-jar\",\"app.jar\"]",
                  notes: "多阶段构建：最终镜像只含 JRE，体积从 600MB → 180MB"
                },
                {
                  id: "card-9",
                  title: "Step 2 · docker-compose.yml",
                  language: "yaml",
                  completed: false,
                  sortOrder: 1,
                  code: "services:\n  app:\n    image: registry.example.com/myapp:{{IMAGE_TAG}}\n    restart: unless-stopped\n    ports: [\"8080:8080\"]\n    environment:\n      SPRING_PROFILES_ACTIVE: prod\n      DB_URL: ${DB_URL}\n    healthcheck:\n      test: [\"CMD\",\"wget\",\"-qO-\",\"http://localhost:8080/actuator/health\"]\n      interval: 30s\n      timeout: 5s\n      retries: 3",
                  notes: "{{IMAGE_TAG}} 由 CI/CD 注入 commit SHA，实现版本可追溯"
                }
              ]
            }
          ]
        }
      ]
    }
  ]
}
