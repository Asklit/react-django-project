from rest_framework import generics, status, permissions
from rest_framework.response import Response
from core.models import Users, Admins, UserActivity
from vocabulary.models import Words, UserWordProgress
from .serializers import UserSerializer, UserDetailsSerializer, WordSerializer, AdminSerializer, AdminCreateSerializer, AdminUpdateSerializer
from rest_framework.permissions import IsAuthenticated, AllowAny
from datetime import date
from config import ACTIVITY_WORD_THRESHOLD
from django.db import models
from django.db.models import F
from django.utils import timezone
from django.db.models import Count

STAGE_TRANSITIONS = {
    'introduction': {'next_stage': 'active_recall', 'interactions_needed': 1},
    'active_recall': {'next_stage': 'consolidation', 'interactions_needed': 3},
    'consolidation': {'next_stage': 'spaced_repetition', 'interactions_needed': 5},
    'spaced_repetition': {'next_stage': 'active_usage', 'interactions_needed': 7},
    'active_usage': {'next_stage': None, 'interactions_needed': 10},
}


class IsAdminOrSelf(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated

    def has_object_permission(self, request, view, obj):
        if Admins.objects.filter(id_admin=request.user.id_user).exists():
            return True
        return obj.id_user == request.user.id_user

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
    permission_classes = [IsAdminOrSelf]

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

class UserMeView(generics.RetrieveAPIView):
    serializer_class = UserDetailsSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        return self.request.user

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
    permission_classes = [AllowAny]

    def get_queryset(self):
        level = self.request.query_params.get('level', None)
        queryset = Words.objects.all()
        if level and level != 'all':
            queryset = queryset.filter(word_level=level)
        return queryset

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
    permission_classes = [IsAdminOrSelf]

    def get_serializer_class(self):
        if self.request.method in ['PUT', 'PATCH']:
            return AdminUpdateSerializer
        return AdminSerializer

    def update(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=True)
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
            used_word_ids = UserWordProgress.objects.filter(user=user).values_list('word_id', flat=True)
            queryset = Words.objects.exclude(id_word__in=used_word_ids)
        else:
            queryset = Words.objects.filter(
                userwordprogress__user=user,
                userwordprogress__stage=stage
            )

        if level and level != 'all':
            queryset = queryset.filter(word_level=level)

        words = list(queryset.distinct())[:4]
        if len(words) < 4:
            exclude_ids = [w.id_word for w in words]
            additional_queryset = Words.objects.exclude(id_word__in=exclude_ids)
            if level and level != 'all':
                additional_queryset = additional_queryset.filter(word_level=level)
            additional_words = list(additional_queryset.distinct())[:4 - len(words)]
            words.extend(additional_words)

        return words

class UpdateWordProgressView(generics.GenericAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = WordSerializer

    def post(self, request, *args, **kwargs):
        user = self.request.user
        word_id = request.data.get('word_id')
        is_correct = request.data.get('is_correct', False)

        if not word_id:
            return Response({'error': 'word_id is required'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            word = Words.objects.get(id_word=word_id)
        except Words.DoesNotExist:
            return Response({'error': 'Word not found'}, status=status.HTTP_404_NOT_FOUND)

        progress, created = UserWordProgress.objects.get_or_create(
            user=user,
            word=word,
            defaults={'stage': 'introduction', 'interaction_count': 0}
        )

        if is_correct:
            progress.interaction_count += 1
            current_stage = progress.stage
            transition_info = STAGE_TRANSITIONS.get(current_stage)
            if (
                transition_info['next_stage'] and
                progress.interaction_count >= transition_info['interactions_needed']
            ):
                progress.stage = transition_info['next_stage']
                progress.interaction_count = 0
            progress.save()

            today = date.today()
            activity, activity_created = UserActivity.objects.get_or_create(
                user=user,
                date=today,
                defaults={'word_count': 0}
            )
            activity.word_count += 1
            if activity.word_count >= ACTIVITY_WORD_THRESHOLD:
                activity.save()

        return Response({
            'status': 'success',
            'stage': progress.stage,
            'interaction_count': progress.interaction_count,
            'interactions_needed': STAGE_TRANSITIONS[progress.stage]['interactions_needed']
        })

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

class UserActivityView(generics.GenericAPIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        user = self.request.user
        year = int(request.query_params.get('year', timezone.now().year))
        
        activities = UserActivity.objects.filter(
            user=user,
            date__year=year
        ).values('date', 'word_count')

        max_words = UserActivity.objects.filter(user=user).aggregate(
            max_words=models.Max('word_count')
        )['max_words'] or 1

        return Response({
            'activities': list(activities),
            'max_words': max_words
        })

class UserActivityUpdateView(generics.GenericAPIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, *args, **kwargs):
        user = self.request.user
        today = timezone.now().date()
        count = request.data.get('count', 0)

        try:
            count = int(count)
            if count < 0:
                return Response({
                    'error': 'Count must be a non-negative integer'
                }, status=status.HTTP_400_BAD_REQUEST)
        except (ValueError, TypeError):
            return Response({
                'error': 'Count must be a valid integer'
            }, status=status.HTTP_400_BAD_REQUEST)

        try:
            activity, created = UserActivity.objects.get_or_create(
                user=user,
                date=today,
                defaults={'word_count': 0}
            )

            activity.word_count = F('word_count') + count
            activity.save()

            activity.refresh_from_db()
            return Response({
                'date': activity.date,
                'word_count': activity.word_count
            }, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({
                'error': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class UserLevelProgressView(generics.GenericAPIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        user = self.request.user
        levels = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2']
        
        studied_words = {
            level: UserWordProgress.objects.filter(
                user=user,
                stage__in=['active_recall', 'consolidation', 'spaced_repetition', 'active_usage'],
                word__word_level=level
            ).count()
            for level in levels
        }
        
        total_words = {
            level: Words.objects.filter(word_level=level).count()
            for level in levels
        }

        return Response({
            'studied_words': studied_words,
            'total_words': total_words
        })
    
class DailyUserActivityView(generics.GenericAPIView):
    def get(self, request, *args, **kwargs):
        days = 30
        end_date = timezone.now().date()
        start_date = end_date - timezone.timedelta(days=days)
        activities = (
            Users.objects.filter(last_day_online__date__range=[start_date, end_date])
            .values("last_day_online__date")
            .annotate(user_count=Count("id_user"))
            .order_by("last_day_online__date")
        )

        result = []
        current_date = start_date
        activity_dict = {str(a["last_day_online__date"]): a["user_count"] for a in activities}
        while current_date <= end_date:
            date_str = str(current_date)
            result.append({"date": date_str, "user_count": activity_dict.get(date_str, 0)})
            current_date += timezone.timedelta(days=1)
        return Response(result)
