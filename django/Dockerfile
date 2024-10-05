FROM python:3.12-slim
ENV PYTHONUNBUFFERED 1
WORKDIR /app
COPY requirements.txt /app/
RUN pip install -r requirements.txt
# RUN pip install daphne
COPY . /app/

# CMD ["daphne", "-b", "0.0.0.0", "-p", "8000", "myproject.asgi:application"]
ENV DJANGO_SETTINGS_MODULE=myproject.settings

RUN python manage.py collectstatic --noinput

CMD ["sh", "-c", "python3 manage.py makemigrations && python3 manage.py migrate && daphne -b 0.0.0.0 -p 8000 myproject.asgi:application"]