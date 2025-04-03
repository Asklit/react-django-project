# Generated by Django 5.1.7 on 2025-04-02 11:16

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='Users',
            fields=[
                ('id_user', models.AutoField(primary_key=True, serialize=False)),
                ('username', models.CharField(error_messages={'max_length': 'Неверный формат имени пользователя.'}, max_length=20, unique=True)),
                ('email', models.CharField(error_messages={'max_length': 'Неверный формат электронной почты.'}, max_length=20, unique=True)),
                ('password_hash', models.CharField()),
                ('english_level', models.CharField(error_messages={'max_length': 'Убедитесь, что это поле не содержит более 2 символов.'}, max_length=2)),
                ('is_email_verificated', models.BooleanField(default=False)),
                ('account_created_at', models.DateTimeField(auto_now_add=True)),
                ('password_changed_at', models.DateTimeField(auto_now=True)),
                ('last_day_online', models.DateTimeField(auto_now_add=True)),
                ('days_in_berserk', models.IntegerField(default=0)),
            ],
            options={
                'db_table': 'Users',
            },
        ),
        migrations.CreateModel(
            name='Admins',
            fields=[
                ('id_admin', models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, primary_key=True, serialize=False, to='core.users')),
                ('first_name', models.CharField(max_length=20)),
                ('surname', models.CharField(max_length=20)),
                ('established_post', models.CharField(max_length=20)),
            ],
            options={
                'db_table': 'Admins',
            },
        ),
    ]
