from rest_framework import generics
from rest_framework import viewsets
from .models import Games, Profile
from .serializers import UserSerializer, GameSerializer, ProfileSerializer
from django.contrib.auth.models import User


import random
import string
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth.models import User
from django.core.cache import cache
from .serializers import OTPRequestSerializer, OTPVerifySerializer
import requests

# image upload
from rest_framework.parsers import MultiPartParser, FormParser
from .models import Image
from .serializers import ImageSerializer
from rest_framework.permissions import AllowAny


class UserCreateView(generics.CreateAPIView):
	queryset = User.objects.all()
	serializer_class = UserSerializer
	authentication_classes = []  # Отключение всех методов аутентификации (включая JWT)
	permission_classes = [AllowAny]
	# permission_classes = [AllowAny]

	# если не активен при создании
	# def perform_create(self, serializer):
	# 	user = serializer.save()
	# 	user.is_active = True
	# 	user.save()

class GameViewSet(viewsets.ModelViewSet):
	queryset = Games.objects.all()
	serializer_class = GameSerializer

def generate_otp():
	return ''.join(random.choices(string.digits, k=6))

resend_k = 're_VXnif9Dp_5UKJQDvKKbL7UE5HG56uLSx2'

def send_email(email, otp):
	url = 'https://api.resend.com/emails'
	headers = {
		'Authorization': f'Bearer {resend_k}',
		'Content-Type': 'application/json'
	}
	data = {
		"from": "42_game <noreply@resend.dev>",
		"to": [email],
		"subject": "your otp code is here 🏆",
		"html": f"<p>hello! your otp code is: {otp}. enjoy</p>"
	}

	response = requests.post(url, headers=headers, json=data)
	if response.status_code == 200:
		print('Email sent successfully')
	else:
		print(f'Failed to send email: {response.status_code}')
		print(response.text)

# image upload
class ImageViewSet(viewsets.ModelViewSet):
	queryset = Image.objects.all()
	serializer_class = ImageSerializer
	parser_classes = (MultiPartParser, FormParser)

class GetOTPView(APIView):
	# permission_classes = [AllowAny]  # Разрешить доступ без аутентификации

	def post(self, request):
		serializer = OTPRequestSerializer(data=request.data)
		if serializer.is_valid():
			username = serializer.validated_data['username']
			try:
				user = User.objects.get(username=username)
				otp = generate_otp()
				cache.set(f'otp_{username}', otp, timeout=300)  # Сохраняем OTP в кэше на 5 минут
				print(f"Your OTP is: {otp}")
				send_email(user.email, otp)
				return Response({otp}, status=status.HTTP_200_OK)
			except User.DoesNotExist:
				return Response({'error': 'User does not exist'}, status=status.HTTP_400_BAD_REQUEST)
		return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class VerifyOTPView(APIView):
	def post(self, request):
		serializer = OTPVerifySerializer(data=request.data)
		if serializer.is_valid():
			username = serializer.validated_data['username']
			received_otp = serializer.validated_data['otp']
			stored_otp = cache.get(f'otp_{username}')
			if stored_otp and received_otp == stored_otp:
				cache.delete(f'otp_{username}')
				return Response({'message': 'OTP verified successfully'}, status=status.HTTP_200_OK)
			return Response({'error': 'Invalid OTP'}, status=status.HTTP_400_BAD_REQUEST)
		return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class ProfileViewSet(viewsets.ModelViewSet):
	queryset = Profile.objects.all()
	serializer_class = ProfileSerializer