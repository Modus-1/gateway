FROM node:lts-alpine

COPY . .
RUN npm install
EXPOSE 23456

CMD ["npm", "run", "start-dev"]