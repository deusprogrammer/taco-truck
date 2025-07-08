# build environment
FROM node:12.2.0-alpine as build
WORKDIR /app
ENV PATH /app/node_modules/.bin:$PATH
ARG REACT_APP_TWITCH_CLIENT_ID
ARG REACT_APP_MEDIA_SERVER_URL
ARG REACT_APP_API_DOMAIN
ENV REACT_APP_TWITCH_CLIENT_ID $REACT_APP_TWITCH_CLIENT_ID
ENV REACT_APP_API_DOMAIN $REACT_APP_API_DOMAIN
ENV REACT_APP_MEDIA_SERVER_URL $REACT_APP_MEDIA_SERVER_URL
COPY package.json /app/package.json
RUN npm install --silent
RUN npm install react-scripts@3.4.1 -g --silent
COPY . /app
RUN ls -al .
RUN ls -al /app
RUN npm run build

# production environment
FROM nginx:1.16.0-alpine
COPY --from=build /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
