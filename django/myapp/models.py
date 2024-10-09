from django.db import models

# class Users(models.Model):
# 	nickname = models.CharField(max_length=100)
# 	username = models.CharField(max_length=100, unique=True)
# 	password = models.CharField(max_length=100, default='')
# 	avatar = models.CharField(max_length=200, default='')
# 	created_at = models.DateTimeField(auto_now_add=True)
# 	updated_at = models.DateTimeField(auto_now=True)

class Profile(models.Model):
	id = models.AutoField(primary_key=True)
	is_online = models.BooleanField(default=False)
	user_id = models.IntegerField()  # Не связываем напрямую с моделью User
	username = models.CharField(max_length=100, blank=True, null=True)
	# user = models.OneToOneField(User, on_delete=models.CASCADE)  # Связь с моделью User
	avatar_url = models.CharField(max_length=200, blank=True, null=True)
	created_at = models.DateTimeField(auto_now_add=True)
	friends = models.JSONField(default=list, blank=True)
	
class Games(models.Model):
	user_one_id = models.IntegerField()
	user_two_id = models.IntegerField()
	user_one_score = models.IntegerField()
	user_two_score = models.IntegerField()
	created_at = models.DateTimeField(auto_now_add=True)
	updated_at = models.DateTimeField(auto_now=True)
	status = models.CharField(max_length=100)

class Image(models.Model):
	image = models.ImageField(upload_to='images/')
	uploaded_at = models.DateTimeField(auto_now_add=True)

# migrations fix
# rm myapp/migrations/00*.py
# python manage.py makemigrations
# python manage.py migrate
# !!
# python manage.py flush
# python manage.py makemigrations
# python manage.py migrate