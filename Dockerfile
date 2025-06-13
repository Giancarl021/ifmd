FROM node:22.11.0 AS build

WORKDIR /app

ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV CI=true

COPY package.json yarn.lock ./
COPY .yarn/ ./.yarn/
COPY scripts/ ./scripts/

RUN corepack install --global yarn@4.9.2 &&\
  corepack enable yarn

RUN yarn install --immutable

COPY . .

RUN yarn run build

RUN rm -rf node_modules/

RUN yarn install --immutable --production

FROM node:22.11.0 AS production

WORKDIR /ifmd

RUN apt-get update && apt-get install --yes --no-install-recommends \
  fonts-liberation \
  libasound2 \
  libatk-bridge2.0-0 \
  libatk1.0-0 \
  libcups2 \
  libdrm2 \
  libgbm1 \
  libsecret-1-dev \
  libgtk-3-0 \
  libnspr4 \
  libnss3 \
  libx11-xcb1 \
  libxcomposite1 \
  libxdamage1 \
  libxrandr2 \
  xdg-utils \
  libu2f-udev \
  libxshmfence1 \
  libglu1-mesa \
  chromium \
  chromium-sandbox \
  && apt-get clean \
  && rm -rf /var/lib/apt/lists/*

ENV HOME=/home/node

RUN mkdir -p $HOME/.npm-global
RUN chown -R node:node $HOME
RUN chown -R node:node /ifmd
RUN usermod -a -G audio,video node

USER node

COPY --from=build --chown=node:node /app/node_modules/ ./node_modules/
COPY --from=build --chown=node:node /app/lib/ ./lib/
COPY --from=build --chown=node:node /app/scripts/ ./scripts/
COPY --from=build --chown=node:node /app/package.json /app/LICENSE ./

ENV NODE_ENV=production
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV PUPPETEER_EXECUTABLE_PATH="/usr/bin/chromium"
ENV NPM_CONFIG_PREFIX=$HOME/.npm-global
ENV PATH=$PATH:$HOME/.npm-global/bin

RUN npm link

RUN rm -rf ./scripts

ENTRYPOINT ["ifmd"]
