from django.urls import path
from .views import (
    UsersCreateView, UserDetailView, UsersListView,
    WordsCreateView, WordDetailView, WordsListView,
    AdminListCreateView, AdminDetailView,
    UserStageWordsView, UpdateWordProgressView, StageCountsView,
    UserActivityView, UserMeView, UserActivityUpdateView,
    UserLevelProgressView, DailyUserActivityView,
    WordLevelListView, PartOfSpeechListView, BulkWordUploadView,
    GetAvatarView, StageListCreateView, StageDetailView,
    WordLevelListCreateView, WordLevelDetailView,
    PartOfSpeechListCreateView, PartOfSpeechDetailView,
)
from authapp.views import (
    RegisterView, LoginView, ChangePasswordView, 
    ChangeUsernameView, ChangeAvatarView, AdminMeView,
    RequestVerificationView, VerifyEmailView
)
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
    path('auth/get-avatar/<int:user_id>/', GetAvatarView.as_view(), name='get-avatar'),
    path('auth/request-verification/', RequestVerificationView.as_view(), name='request-verification'),
    path('auth/verify-email/<str:token>/', VerifyEmailView.as_view(), name='verify-email'),

    path('users/', UsersCreateView.as_view(), name='users-create'),
    path('users/list/', UsersListView.as_view(), name='users-list'),
    path('users/me/', UserMeView.as_view(), name='user-me'),
    path('users/<int:id_user>/', UserDetailView.as_view(), name='user-detail'),
    
    path('words/', WordsCreateView.as_view(), name='words-create'),
    path('words/list/', WordsListView.as_view(), name='words-list'),
    path('words/<int:pk>/', WordDetailView.as_view(), name='word-detail'),
    path('parts-of-speech/', PartOfSpeechListView.as_view(), name='part-of-speech-list'),
    path('words/bulk-upload/', BulkWordUploadView.as_view(), name='bulk-word-upload'),
    
    path('words/stage/', UserStageWordsView.as_view(), name='user-stage-words'),
    path('words/progress/', UpdateWordProgressView.as_view(), name='update-word-progress'),
    path('words/stage-counts/', StageCountsView.as_view(), name='stage-counts'),
    path('words/level-progress/', UserLevelProgressView.as_view(), name='level-progress'),
    
    path('admins/', AdminListCreateView.as_view(), name='admin-list-create'),
    path('admins/<int:id_admin>/', AdminDetailView.as_view(), name='admin-detail'),
    
    path('users/activity/', UserActivityView.as_view(), name='user-activity'),
    path('users/activity/update/', UserActivityUpdateView.as_view(), name='user-activity-update'),
    path('activity/users-daily/', DailyUserActivityView.as_view(), name='users-daily-activity'),

    path('levels/', WordLevelListView.as_view(), name='word-levels'),
    
    path('admins/me/', AdminMeView.as_view(), name='admin-me'),

    path('stages/', StageListCreateView.as_view(), name='stage-list-create'),
    path('stages/<int:pk>/', StageDetailView.as_view(), name='stage-detail'),
    path('wordlevels/', WordLevelListCreateView.as_view(), name='wordlevel-list-create'),
    path('wordlevels/<int:pk>/', WordLevelDetailView.as_view(), name='wordlevel-detail'),
    path('partsofspeech/', PartOfSpeechListCreateView.as_view(), name='partsofspeech-list-create'),
    path('partsofspeech/<int:pk>/', PartOfSpeechDetailView.as_view(), name='partsofspeech-detail'),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)