# 빌드 스테이지
FROM node:20-alpine AS builder

WORKDIR /app

ARG NEXT_PUBLIC_API_BASE_URL
ENV NEXT_PUBLIC_API_BASE_URL=$NEXT_PUBLIC_API_BASE_URL

# 패키지 매니저 파일 복사 및 의존성 설치
# 패키지 파일이 변경되지 않으면 캐시 활용
COPY package.json package-lock.json* ./
RUN npm ci

# 소스 코드 복사 및 빌드
COPY . .
RUN npm run build

# 프로덕션 런타임 스테이지
FROM node:20-alpine AS runner

WORKDIR /app

# 보안을 위한 non-root 사용자 생성
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Next.js standalone 출력 파일 복사
# standalone 폴더에는 server.js와 필요한 node_modules가 포함됨
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
# public 폴더와 static 파일 복사
COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# nextjs 사용자로 전환
USER nextjs

# 포트 노출
EXPOSE 3000

# 환경 변수 설정
ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# 애플리케이션 실행
CMD ["node", "server.js"]

