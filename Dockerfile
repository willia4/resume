#IMAGE-NAME: willia4/resume
#IMAGE-VERSION: 3.1.3
FROM nginx
LABEL me.jameswilliams.author="james@jameswilliams.me"

ADD dist /usr/share/nginx/html
ADD assets /usr/share/nginx/html