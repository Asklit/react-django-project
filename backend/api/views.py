from django.shortcuts import render
from .models import Users
from rest_framework import generics
from .serializers import UserSerializer
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework import viewsets, status
from rest_framework.response import Response
from .models import Users, Admins, Words, LearnedWords, WordsInProgress
from .serializers import UserSerializer, AdminSerializer, WordsSerializer, LearnedWordsSerializer, WordsInProgressSerializer
from django.db import connection
from rest_framework.decorators import api_view


class CreateUserView(generics.ListCreateAPIView):
    queryset = Users.objects.all()
    print(queryset)
    serializer_class = UserSerializer
    permission_classes = [AllowAny]