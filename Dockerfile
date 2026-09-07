# syntax=docker/dockerfile:1.7

FROM node:24.14.0-alpine
ARG ALPINE_MIRROR=dl-cdn.alpinelinux.org
RUN sed -i "s/dl-cdn.alpinelinux.org/${ALPINE_MIRROR}/g" /etc/apk/repositories \
  && apk add --no-cache libc6-compat git python3 py3-pip make g++ libusb-dev eudev-dev linux-headers

# Set working directory
WORKDIR /app

# Copy root
COPY . .

# Set working directory to the web app
WORKDIR apps/web

# Enable corepack and configure yarn
ARG CLI_DIST_URL=https://registry.yarnpkg.com/@yarnpkg/cli-dist/-/cli-dist-4.14.1.tgz
ARG YARN_NPM_REGISTRY_SERVER=https://registry.yarnpkg.com
RUN mkdir -p /opt/yarn \
  && wget -qO /tmp/yarn.tgz "${CLI_DIST_URL}" \
  && tar -xzf /tmp/yarn.tgz --strip-components=1 -C /opt/yarn \
  && chmod +x /opt/yarn/bin/yarn \
  && ln -sf /opt/yarn/bin/yarn /usr/local/bin/yarn \
  && rm /tmp/yarn.tgz
RUN yarn config set httpTimeout 300000 \
  && yarn config set npmRegistryServer "${YARN_NPM_REGISTRY_SERVER}"

# Run any custom post-install scripts
ENV CYPRESS_INSTALL_BINARY=0
RUN --mount=type=cache,id=safe-yarn-cache,target=/root/.yarn/berry/cache \
  yarn install --immutable
RUN yarn after-install

# Set environment variables
ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1
ENV PORT 3000

# Expose the port
EXPOSE 3000

# Command to start the application
CMD ["yarn", "static-serve"]
