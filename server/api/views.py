from rest_framework import generics, status
from rest_framework.response import Response
from core.models import Users, Admins
from vocabulary.models import Words
from .serializers import UserSerializer, UserDetailsSerializer, WordSerializer, AdminSerializer, AdminCreateSerializer
from django.contrib.auth.hashers import make_password

class UsersCreateView(generics.ListCreateAPIView):
    serializer_class = UserSerializer
    queryset = Users.objects.all()

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save(
                password_hash=make_password(request.data['password_hash']),
                is_email_verificated=False,
                days_in_berserk=0,
            )
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class UsersListView(generics.ListAPIView):
    serializer_class = UserDetailsSerializer
    queryset = Users.objects.all()

class UserDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Users.objects.all()
    serializer_class = UserDetailsSerializer

    def put(self, request, *args, **kwargs):
        user = self.get_object()
        serializer = self.get_serializer(user, data=request.data, partial=True)
        if serializer.is_valid():
            if 'password_hash' in request.data:
                user.password_hash = make_password(request.data['password_hash'])
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class WordsCreateView(generics.ListCreateAPIView):
    serializer_class = WordSerializer
    queryset = Words.objects.all()

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class WordDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Words.objects.all()
    serializer_class = WordSerializer

    def put(self, request, *args, **kwargs):
        word = self.get_object()
        serializer = self.get_serializer(word, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class WordsListView(generics.ListAPIView):
    serializer_class = WordSerializer

    def get_queryset(self):
        level = self.request.query_params.get('level', None)
        if level:
            return Words.objects.filter(word_level=level)
        return Words.objects.all()

class AdminListCreateView(generics.ListCreateAPIView):
    queryset = Admins.objects.all()
    serializer_class = AdminSerializer

    def create(self, request, *args, **kwargs):
        serializer = AdminCreateSerializer(data=request.data)
        if serializer.is_valid():
            id_admin = serializer.validated_data['id_admin']
            if not Users.objects.filter(id_user=id_admin.id_user).exists():
                return Response({"detail": "User does not exist"}, status=status.HTTP_404_NOT_FOUND)
            if Admins.objects.filter(id_admin=id_admin).exists():
                return Response({"detail": "User is already an admin"}, status=status.HTTP_400_BAD_REQUEST)
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class AdminDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Admins.objects.all()
    serializer_class = AdminSerializer
    lookup_field = 'id_admin'

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = AdminCreateSerializer(instance, data=request.data, partial=partial)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)