# syntax=docker/dockerfile:1

# ── build 階段：CRA 打包 ─────────────────────────────────
# 注意：REACT_APP_* 在「build 時」就被寫死進 bundle，
# 換 API 位址必須重新 build image，不能只改 runtime 環境變數。
FROM node:20-alpine AS build
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

ARG REACT_APP_BASEURL=http://localhost:5000
ARG REACT_APP_CHAT_URL=http://localhost:4000
ENV REACT_APP_BASEURL=$REACT_APP_BASEURL \
    REACT_APP_CHAT_URL=$REACT_APP_CHAT_URL \
    CI=false \
    GENERATE_SOURCEMAP=false

COPY . .
RUN npm run build

# ── runtime 階段：nginx 提供靜態檔 ───────────────────────
FROM nginx:1.27-alpine AS runtime
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/build /usr/share/nginx/html

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget -q --spider http://127.0.0.1/ || exit 1

CMD ["nginx", "-g", "daemon off;"]
