from rest_framework import serializers
from .models import Games, Image, Profile
from django.contrib.auth.models import User

class UserSerializer(serializers.ModelSerializer):
	class Meta:
		model = User
		fields = ['id', 'username', 'email', 'password']
		extra_kwargs = {'password': {'write_only': True}}
	
	def create(self, validated_data):
		user = User(
			email=validated_data['email'],
			username=validated_data['username']
		)
		user.set_password(validated_data['password'])
		user.save()
		return user

class GameSerializer(serializers.ModelSerializer):
	class Meta:
		model = Games
		fields = ['id', 'user_one_id', 'user_two_id', 'user_one_score', 'user_two_score', 'created_at', 'updated_at', 'status']
	
class ImageSerializer(serializers.ModelSerializer):
	class Meta:
		model = Image
		fields = ('id', 'image', 'uploaded_at')

class OTPRequestSerializer(serializers.Serializer):
	username = serializers.CharField()

class OTPVerifySerializer(serializers.Serializer):
	username = serializers.CharField()
	otp = serializers.CharField()

class ProfileSerializer(serializers.ModelSerializer):
	class Meta:
		model = Profile
		fields = ['id', 'user_id', 'username', 'created_at', 'avatar_url', 'is_online', 'friends']