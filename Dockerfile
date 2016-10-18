#IMAGE-NAME: willia4/resume
#IMAGE-VERSION: 2.5.4
FROM willia4/nginx_base:1.8.1-1
MAINTAINER james@jameswilliams.me

COPY nginx.conf /etc/nginx/nginx.conf

ADD *.js /www/
ADD *.css /www/
ADD *.map /www/
ADD *.html /www/
ADD *.scss /www/
ADD *.pdf /www/
ADD *.txt /www/

CMD nginx