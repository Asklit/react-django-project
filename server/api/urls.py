from django.urls import path
from .views import (
    UsersCreateView, UserDetailView, UsersListView, 
    WordsCreateView, WordDetailView, WordsListView, 
    AdminListCreateView, AdminDetailView, 
    RegisterView, LoginView
)
from rest_framework_simplejwt.views import TokenRefreshView

urlpatterns = [
    path("register/", RegisterView.as_view(), name="register"),
    path("login/", LoginView.as_view(), name="login"),
    path("token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    path("create/users", UsersCreateView.as_view(), name="create-users"),
    path("list/users", UsersListView.as_view(), name="show-users"),
    path("update/users/<int:pk>/", UserDetailView.as_view(), name="edit-users"),
    path("delete/users/<int:pk>/", UserDetailView.as_view(), name="delete-users"),
    path("create/words", WordsCreateView.as_view(), name="create-words"),
    path("list/words", WordsListView.as_view(), name="list-words"),
    path("update/words/<int:pk>/", WordDetailView.as_view(), name="update-words"),
    path("delete/words/<int:pk>/", WordDetailView.as_view(), name="delete-words"),
    path('list/admins/', AdminListCreateView.as_view(), name='admin-list-create'),
    path('admins/<int:id_admin>/', AdminDetailView.as_view(), name='admin-detail'),
]