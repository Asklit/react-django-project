from django.urls import path
from .views import (
    UsersCreateView, UserDetailView, UsersListView,
    WordsCreateView, WordDetailView, WordsListView,
    AdminListCreateView, AdminDetailView,
    UserStageWordsView, UpdateWordProgressView, StageCountsView,
    UserActivityView, UserMeView, UserActivityUpdateView,
    UserLevelProgressView,DailyUserActivityView,
)
from authapp.views import RegisterView, LoginView, ChangePasswordView, ChangeUsernameView, ChangeAvatarView, AdminMeView
from rest_framework_simplejwt.views import TokenRefreshView

from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('auth/register/', RegisterView.as_view(), name='register'),
    path('auth/login/', LoginView.as_view(), name='login'),
    path('auth/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('auth/change-password/', ChangePasswordView.as_view(), name='change-password'),
    path('auth/change-username/', ChangeUsernameView.as_view(), name='change-username'),
    path('auth/change-avatar/', ChangeAvatarView.as_view(), name='change-avatar'),
    
    path('users/', UsersCreateView.as_view(), name='users-create'),
    path('users/list/', UsersListView.as_view(), name='users-list'),
    path('users/me/', UserMeView.as_view(), name='user-me'),
    path('users/<int:pk>/', UserDetailView.as_view(), name='user-detail'),
    
    path('words/', WordsCreateView.as_view(), name='words-create'),
    path('words/list/', WordsListView.as_view(), name='words-list'),
    path('words/<int:pk>/', WordDetailView.as_view(), name='word-detail'),
    
    path('words/stage/', UserStageWordsView.as_view(), name='user-stage-words'),
    path('words/progress/', UpdateWordProgressView.as_view(), name='update-word-progress'),
    path('words/stage-counts/', StageCountsView.as_view(), name='stage-counts'),
    path('words/level-progress/', UserLevelProgressView.as_view(), name='level-progress'),
    
    path('admins/', AdminListCreateView.as_view(), name='admin-list-create'),
    path('admins/<int:id_admin>/', AdminDetailView.as_view(), name='admin-detail'),
    
    path('users/activity/', UserActivityView.as_view(), name='user-activity'),
    path('users/activity/update/', UserActivityUpdateView.as_view(), name='user-activity-update'),
    path('activity/users-daily/', DailyUserActivityView.as_view(), name='users-daily-activity'),

    path('admins/me/', AdminMeView.as_view(), name='admin-me'),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)