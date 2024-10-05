FROM nginx:latest

# Копируем конфигурационный файл Nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Создаем директорию для хранения сертификатов
RUN mkdir -p /etc/nginx/ssl

# Генерация самоподписанного сертификата и ключа
RUN openssl genrsa -out /etc/nginx/ssl/nginx-selfsigned.key 2048 && \
    openssl req -new -x509 -key /etc/nginx/ssl/nginx-selfsigned.key -out /etc/nginx/ssl/nginx-selfsigned.crt -days 365 -subj "/CN=localhost"