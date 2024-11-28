from django.urls import path
from . import views


urlpatterns = [
    path('user/getusers', views.GetUserList.as_view(), name='get-users')
]