from django.urls import path
from . import views

urlpatterns = [
    path("users/", views.CreateUserView.as_view(), name="note-list"),
    # path("users/delete/<int:pk>/", views.CreateUserView.as_view(), name="delete-note"),
]