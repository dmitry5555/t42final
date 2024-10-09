# """
# ASGI config for myproject project.

# It exposes the ASGI callable as a module-level variable named ``application``.

# For more information on this file, see
# https://docs.djangoproject.com/en/5.0/howto/deployment/asgi/
# """

# import os

# from django.core.asgi import get_asgi_application

# os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'myproject.settings')

# application = get_asgi_application()

from channels.routing import ProtocolTypeRouter, URLRouter
from django.core.asgi import get_asgi_application
from channels.auth import AuthMiddlewareStack
from django.urls import re_path
from myapp.consumers import TestConsumer
from myapp.routing import websocket_urlpatterns
import os

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'myproject.settings')

application = ProtocolTypeRouter({
  "http": get_asgi_application(),
  "websocket": URLRouter(
			# re_path(r'ws/(?P<room_name>\w+)/$', TestConsumer.as_asgi()),
			# re_path(r'ws/$', TestConsumer.as_asgi()),
      websocket_urlpatterns
    ),
})