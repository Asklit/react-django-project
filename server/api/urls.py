from django.urls import path
from .views import (
    UsersCreateView, UserDetailView, UsersListView,
    WordsCreateView, WordDetailView, WordsListView,
    AdminListCreateView, AdminDetailView,
)
from authapp.views import RegisterView, LoginView
from rest_framework_simplejwt.views import TokenRefreshView

urlpatterns = [
    path('auth/register/', RegisterView.as_view(), name='register'),
    path('auth/login/', LoginView.as_view(), name='login'),
    path('auth/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    
    path('users/', UsersCreateView.as_view(), name='users-create'),
    path('users/list/', UsersListView.as_view(), name='users-list'),
    path('users/<int:pk>/', UserDetailView.as_view(), name='user-detail'),
    
    path('words/', WordsCreateView.as_view(), name='words-create'),
    path('words/list/', WordsListView.as_view(), name='words-list'),
    path('words/<int:pk>/', WordDetailView.as_view(), name='word-detail'),
    
    path('admins/', AdminListCreateView.as_view(), name='admin-list-create'),
    path('admins/<int:id_admin>/', AdminDetailView.as_view(), name='admin-detail'),
]