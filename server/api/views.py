from rest_framework import generics, status, permissions
from rest_framework.response import Response
from core.models import Users, Admins, UserActivity
from vocabulary.models import Words, UserWordProgress, Stage, WordLevel, PartOfSpeech
from .serializers import (
    UserSerializer, UserDetailsSerializer, WordSerializer,
    AdminSerializer, AdminCreateSerializer, AdminUpdateSerializer,
    PartOfSpeechSerializer, WordSerializer, BulkWordUploadSerializer,
)
from rest_framework.permissions import IsAuthenticated, AllowAny
from datetime import date
from config import ACTIVITY_WORD_THRESHOLD
from django.db import models
from django.db.models import F
from django.utils import timezone
from django.db.models import Count
from core.permissions import IsAdminOrSelf
import logging
from django.db import transaction
import pandas as pd
from rest_framework.views import APIView


logger = logging.getLogger(__name__)

STAGE_TRANSITIONS = {
    'introduction': {'next_stage': 'active_recall', 'interactions_needed': 1},
    'active_recall': {'next_stage': 'consolidation', 'interactions_needed': 3},
    'consolidation': {'next_stage': 'spaced_repetition', 'interactions_needed': 5},
    'spaced_repetition': {'next_stage': 'active_usage', 'interactions_needed': 7},
    'active_usage': {'next_stage': None, 'interactions_needed': 10},
}

class UsersCreateView(generics.ListCreateAPIView):
    serializer_class = UserSerializer
    queryset = Users.objects.all()
    permission_classes = [IsAdminOrSelf]

    def create(self, request, *args, **kwargs):
        logger.info(f"User creation request: {request.data}")
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            logger.info(f"User created successfully: {user.id_user}")
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        logger.error(f"User creation errors: {serializer.errors}")
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class UsersListView(generics.ListAPIView):
    serializer_class = UserDetailsSerializer
    queryset = Users.objects.all()
    permission_classes = [IsAdminOrSelf]

class UserDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Users.objects.all()
    serializer_class = UserDetailsSerializer
    permission_classes = [IsAdminOrSelf]
    lookup_field = 'id_user'

    def put(self, request, *args, **kwargs):
        logger.info(f"User update request for id_user={self.kwargs['id_user']}: {request.data}")
        user = self.get_object()
        serializer = self.get_serializer(user, data=request.data, partial=True)
        if serializer.is_valid():
            if 'password' in request.data:
                user.set_password(request.data['password'])
                user.save()
            serializer.save()
            logger.info(f"User {user.id_user} updated successfully")
            return Response(serializer.data)
        logger.error(f"User update errors: {serializer.errors}")
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, *args, **kwargs):
        try:
            user = self.get_object()
            logger.info(f"Attempting to delete user {user.id_user} by request.user {request.user.id_user}")
            user.delete()
            logger.info(f"Successfully deleted user {user.id_user}")
            return Response(status=status.HTTP_204_NO_CONTENT)
        except Users.DoesNotExist:
            logger.error(f"User {self.kwargs['id_user']} not found for deletion")
            return Response({"error": "Пользователь не найден"}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            logger.error(f"Error deleting user {self.kwargs['id_user']}: {str(e)}")
            return Response({"error": f"Ошибка при удалении пользователя: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

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
            queryset = queryset.filter(word_level__level=level)
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
                userwordprogress_set__user=user,
                userwordprogress_set__stage__name=stage
            )

        if level and level != 'all':
            queryset = queryset.filter(word_level__level=level)

        words = list(queryset.distinct())[:4]
        if len(words) < 4:
            exclude_ids = [w.id_word for w in words]
            additional_queryset = Words.objects.exclude(id_word__in=exclude_ids)
            if level and level != 'all':
                additional_queryset = additional_queryset.filter(word_level__level=level)
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
            defaults={'stage': Stage.objects.get(name='introduction'), 'interaction_count': 0}
        )

        if is_correct:
            progress.interaction_count += 1
            current_stage = progress.stage.name
            transition_info = STAGE_TRANSITIONS.get(current_stage)
            if (
                transition_info['next_stage'] and
                progress.interaction_count >= transition_info['interactions_needed']
            ):
                progress.stage = Stage.objects.get(name=transition_info['next_stage'])
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
            'stage': progress.stage.name,
            'interaction_count': progress.interaction_count,
            'interactions_needed': STAGE_TRANSITIONS[progress.stage.name]['interactions_needed']
        })

class StageCountsView(generics.GenericAPIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        user = self.request.user
        try:
            stage_counts = {
                'introduction': Words.objects.exclude(
                    user_progress__user=user
                ).count(),
                'active_recall': UserWordProgress.objects.filter(user=user, stage__name='active_recall').count(),
                'consolidation': UserWordProgress.objects.filter(user=user, stage__name='consolidation').count(),
                'spaced_repetition': UserWordProgress.objects.filter(user=user, stage__name='spaced_repetition').count(),
                'active_usage': UserWordProgress.objects.filter(user=user, stage__name='active_usage').count(),
            }
            logger.info(f"Stage counts for user {user.id_user}: {stage_counts}")
            return Response(stage_counts)
        except Exception as e:
            logger.error(f"Error in StageCountsView for user {user.id_user}: {str(e)}")
            return Response({"error": f"Failed to fetch stage counts: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

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
        levels = ['A1', 'A2', 'B1', 'B2', 'C1']
        
        studied_words = {
            level: UserWordProgress.objects.filter(
                user=user,
                stage__name__in=['active_recall', 'consolidation', 'spaced_repetition', 'active_usage'],
                word__word_level__level=level
            ).count()
            for level in levels
        }
        
        total_words = {
            level: Words.objects.filter(word_level__level=level).count()
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
    
class WordLevelListView(generics.ListAPIView):
    queryset = WordLevel.objects.all()

    def list(self, request, *args, **kwargs):
        levels = WordLevel.objects.values('level')
        return Response(levels)
    
class PartOfSpeechListView(APIView):
    def get(self, request):
        try:
            parts_of_speech = PartOfSpeech.objects.all()
            serializer = PartOfSpeechSerializer(parts_of_speech, many=True)
            return Response(serializer.data)
        except Exception as e:
            logger.error(f"Error fetching parts of speech: {str(e)}")
            return Response({"error": "Ошибка при загрузке частей речи"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class BulkWordUploadView(APIView):
    def post(self, request):
        try:
            file = request.FILES.get('file')
            if not file:
                return Response({"error": "Файл не предоставлен"}, status=status.HTTP_400_BAD_REQUEST)
            if not file.name.endswith(('.xlsx', '.xls')):
                return Response({"error": "Файл должен быть в формате Excel (.xlsx или .xls)"}, status=status.HTTP_400_BAD_REQUEST)

            df = pd.read_excel(file)
            expected_columns = ['Word (English)', 'Part of Speech', 'Translation (Russian)', 'CEFR Level', 'Rating']
            if list(df.columns) != expected_columns:
                return Response({
                    "error": "Неверный формат файла. Ожидаемые столбцы: " + ", ".join(expected_columns)
                }, status=status.HTTP_400_BAD_REQUEST)

            errors = []
            words_to_create = []
            existing_words = []
            level_counts = {}
            skipped_count = 0
            new_levels_created = []
            new_parts_of_speech_created = []

            for index, row in df.iterrows():
                word_data = {
                    'word': str(row['Word (English)']).strip(),
                    'part_of_speech': str(row['Part of Speech']).strip(),
                    'translate_word': str(row['Translation (Russian)']).strip(),
                    'word_level': str(row['CEFR Level']).strip().upper(),
                    'rating': int(row['Rating']) if pd.notna(row['Rating']) else 1
                }

                if not word_data['word'] or not word_data['translate_word']:
                    errors.append(f"Строка {index + 2}: Поля 'Word (English)' и '2' обязательны")
                    continue

                try:
                    part_of_speech, created = PartOfSpeech.objects.get_or_create(name=word_data['part_of_speech'])
                    if created:
                        logger.info(f"Created new part of speech: {word_data['part_of_speech']}")
                        new_parts_of_speech_created.append(word_data['part_of_speech'])
                except Exception as e:
                    errors.append(f"Строка {index + 2}: Ошибка при обработке части речи '{word_data['part_of_speech']}': {str(e)}")
                    continue

                try:
                    word_level, created = WordLevel.objects.get_or_create(level=word_data['word_level'])
                    if created:
                        logger.info(f"Created new CEFR level: {word_data['word_level']}")
                        new_levels_created.append(word_data['word_level'])
                except Exception as e:
                    errors.append(f"Строка {index + 2}: Ошибка при обработке уровня CEFR '{word_data['word_level']}': {str(e)}")
                    continue

                if word_data['word_level'] not in level_counts:
                    level_counts[word_data['word_level']] = 0

                if word_data['rating'] < 1:
                    errors.append(f"Строка {index + 2}: Рейтинг должен быть не менее 1")
                    continue

                if Words.objects.filter(word=word_data['word'], word_level=word_level).exists():
                    existing_words.append(f"{word_data['word']} ({word_data['word_level']})")
                    skipped_count += 1
                    continue

                words_to_create.append({
                    'word': word_data['word'],
                    'part_of_speech': part_of_speech,
                    'translate_word': word_data['translate_word'],
                    'word_level': word_level,
                    'rating': word_data['rating']
                })
                level_counts[word_data['word_level']] += 1

            if errors:
                return Response({"errors": errors}, status=status.HTTP_400_BAD_REQUEST)

            with transaction.atomic():
                created_words = []
                for word_data in words_to_create:
                    word, created = Words.objects.get_or_create(
                        word=word_data['word'],
                        word_level=word_data['word_level'],
                        defaults={
                            'part_of_speech': word_data['part_of_speech'],
                            'translate_word': word_data['translate_word'],
                            'rating': word_data['rating']
                        }
                    )
                    if created:
                        created_words.append(word)
                logger.info(f"Bulk upload: {len(created_words)} words created")
                return Response({
                    'message': 'Слова успешно добавлены',
                    'added_count': len(created_words),
                    'level_counts': level_counts,
                    'skipped_count': skipped_count,
                    'existing_words': existing_words,
                    'new_levels_created': new_levels_created,
                    'new_parts_of_speech_created': new_parts_of_speech_created
                }, status=status.HTTP_201_CREATED)

        except pd.errors.EmptyDataError:
            logger.error("Uploaded file is empty")
            return Response({"error": "Загруженный файл пуст"}, status=status.HTTP_400_BAD_REQUEST)
        except pd.errors.ParserError:
            logger.error("Error parsing Excel file")
            return Response({"error": "Ошибка при разборе файла Excel"}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            logger.error(f"Unexpected error in bulk upload: {str(e)}")
            return Response({"error": f"Неожиданная ошибка при обработке файла: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)