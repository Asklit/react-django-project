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

## Installation

1. Clone the repo
   ```bash
   git clone https://github.com/Asklit/react-django-project
   cd react-django-project
   ```
2. Install frontend dependencies
   ```bash
   cd frontend
   npm install
   ```
3. Run the frontend
   ```bash
   npm start
   ```
4. Install backend dependencies
   ```bash
   cd ../server
   pip install -r requirements.txt
   ```
5. Set up the PostgreSQL database with Docker
   
   Ensure you have a docker-compose.yml

   ```
   version: '3.8'
   services:
     db:
       image: postgres:15
       container_name: flash_db
       environment:
         POSTGRES_DB: flash
         POSTGRES_USER: superuser
         POSTGRES_PASSWORD: gfkjdsfghl@34kHCVklhsdfklg
       ports:
         - "5432:5432"
       volumes:
         - postgres_data:/var/lib/postgresql/data
   volumes:
     postgres_data:
   ```
   
   Start the Docker container:
     
   ```bash
   docker-compose up -d
   ```
7. Restore the database from the dump

   Download backup file by link: https://drive.google.com/file/d/1taSQm_3o-Oo1HolFDOZl4PJoaha9Fxn6/view?usp=sharing
   
   Copy the provided flash_backup.sql to the container:
   ```bash
   docker cp flash_backup.sql flash_db:/flash_backup.sql
   ```

   Restore the database:
   ```bash
   docker exec -i flash_db psql -U superuser -d flash -f /flash_backup.sql
   ```

9. Run Django migrations
   ```bash
   cd server
   python manage.py makemigrations
   python manage.py migrate
   ```
10. Run backend part
   ```bash
   python manage.py runserver
   ```
11. Visit website
    ```
    http://localhost:3000/
    ```
