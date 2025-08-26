# About project

Information System Development for Learning Languages ​​and Practicing Typing Skills.

This project was done as part of the course work of a second-year HSE student.

## Built With

- [React](https://reactjs.org/) - Frontend framework
- [Django](https://www.djangoproject.com/) - Backend framework
- [Chart.js](https://www.chartjs.org/) - Charting library
- [PostgreSQL](https://www.postgresql.org/) - Database
- [Docker](https://www.docker.com/) - Containerization for database

## Prerequisites

- [Node.js](https://nodejs.org/) and npm for the frontend
- [Python 3](https://www.python.org/) and pip for the backend
- [Docker](https://www.docker.com/get-started) and [Docker Compose](https://docs.docker.com/compose/install/) for the database
- Ensure port `5432` is free (stop any local PostgreSQL service)

# Installation

1. Clone the repo
   ```sh
   git clone https://github.com/Asklit/react-django-project
   ```
2. Install NPM packages
   ```sh
   cd frontend
   npm install
   ```
3. Run npm
   ```sh
   npm start
   ```
4. Install requirements.txt
   ```sh
   cd server
   pip install -r reqirements.txt
   ```
5. Setup database
   ```sh
   python manage.py makemigrations
   python manage.py migrate
   ```
6. Run backend part
   ```sh
   python manage.py runserver
   ```
7. Change git remote url to avoid accidental pushes to base project
   ```sh
   git remote set-url origin github_username/repo_name
   git remote -v # confirm the changes
   ```
8. Create superadmin (Optional)
   ```sql
   INSERT INTO Admins (id_admin_id, first_name, surname, established_post)
   VALUES (1, 'your_name', 'your_surname', 'your_established_post');
   ```
   
   or

    ```py
    user = Users.objects.get(id=1)
    admin = Admins.objects.create(
        id_admin=user,
        first_name='your_name',
        surname='your_surname',
        established_post='your_established_post'
    )
   ```
8. Add lexic into database (Optional)
   ```
   upload server/expanded_words.xlsx in admin panel
   ```
