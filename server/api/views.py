from rest_framework import generics, status
from rest_framework.response import Response
from core.models import Users, Admins
from vocabulary.models import Words, UserWordProgress
from .serializers import UserSerializer, UserDetailsSerializer, WordSerializer, AdminSerializer, AdminCreateSerializer
from rest_framework.permissions import IsAuthenticated

# Константы для количества итераций для перехода на следующий уровень
STAGE_TRANSITIONS = {
    'introduction': {'next_stage': 'active_recall', 'interactions_needed': 1},
    'active_recall': {'next_stage': 'consolidation', 'interactions_needed': 3},
    'consolidation': {'next_stage': 'spaced_repetition', 'interactions_needed': 5},
    'spaced_repetition': {'next_stage': 'active_usage', 'interactions_needed': 7},
    'active_usage': {'next_stage': None, 'interactions_needed': None}
}

class UsersCreateView(generics.ListCreateAPIView):
    serializer_class = UserSerializer
    queryset = Users.objects.all()

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
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
            if 'password' in request.data:
                user.set_password(request.data['password'])
                user.save()
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

class UserStageWordsView(generics.ListAPIView):
    serializer_class = WordSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        stage = self.request.query_params.get('stage', 'introduction')
        level = self.request.query_params.get('level', None)

        if stage == 'introduction':
            # Fetch words not in UserWordProgress for this user
            used_word_ids = UserWordProgress.objects.filter(user=user).values_list('word_id', flat=True)
            queryset = Words.objects.exclude(id_word__in=used_word_ids)
        else:
            # Fetch words from UserWordProgress for the given stage
            queryset = Words.objects.filter(
                userwordprogress__user=user,
                userwordprogress__stage=stage
            )

        if level and level != 'all':
            queryset = queryset.filter(word_level=level)

        # If fewer than 5 words, loop the queryset
        words = list(queryset)
        if len(words) < 5 and len(words) > 0:
            words = words * (5 // len(words) + 1)
        return words[:5]

class UpdateWordProgressView(generics.GenericAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = WordSerializer

    def post(self, request, *args, **kwargs):
        user = self.request.user
        word_id = request.data.get('word_id')
        is_correct = request.data.get('is_correct', False)

        if not word_id or not is_correct:
            return Response({'error': 'word_id and is_correct are required'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            word = Words.objects.get(id_word=word_id)
        except Words.DoesNotExist:
            return Response({'error': 'Word not found'}, status=status.HTTP_404_NOT_FOUND)

        progress, created = UserWordProgress.objects.get_or_create(
            user=user,
            word=word,
            defaults={'stage': 'introduction', 'interaction_count': 1}  # Начинаем с introduction
        )

        if not created and is_correct:
            progress.interaction_count += 1
            current_stage = progress.stage
            transition_info = STAGE_TRANSITIONS.get(current_stage)
            if (
                transition_info['next_stage'] and
                progress.interaction_count >= transition_info['interactions_needed']
            ):
                progress.stage = transition_info['next_stage']
            progress.save()

        return Response({'status': 'success', 'stage': progress.stage, 'interaction_count': progress.interaction_count})

class StageCountsView(generics.GenericAPIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        user = self.request.user
        stage_counts = {
            'introduction': Words.objects.exclude(
                userwordprogress__user=user
            ).count(),
            'active_recall': UserWordProgress.objects.filter(user=user, stage='active_recall').count(),
            'consolidation': UserWordProgress.objects.filter(user=user, stage='consolidation').count(),
            'spaced_repetition': UserWordProgress.objects.filter(user=user, stage='spaced_repetition').count(),
            'active_usage': UserWordProgress.objects.filter(user=user, stage='active_usage').count(),
        }
        return Response(stage_counts)