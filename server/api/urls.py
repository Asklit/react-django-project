from django.urls import path
from . import views

from django.urls import path
from .views import UsersCreateView, UserDetailView, UsersListView

urlpatterns = [
    path("create/users", UsersCreateView.as_view(), name="create-users"),
    path("list/users", UsersListView.as_view(), name="show-users"),
    path("update/users/<int:pk>/", UserDetailView.as_view(), name="edit-users"),
    path("delete/users/<int:pk>/", UserDetailView.as_view(), name="delete-users"),
]
