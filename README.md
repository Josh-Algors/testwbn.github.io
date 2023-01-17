# Express-Sequelize-API boilerplate
This is a simple boilerplate for creating APIs with NodeJs Express framework.
Here API access token encapsulated/encrypted with Passport and JWT token based system.
 - Sample API ready for login 
 - Deploy your app with cluster (cluster implementation is integrated)
 - jest test configured

## Getting Started
You can download this repo or clone using below command. (folder-name will be project folder in which you want to start your project).
```
git clone https://github.com/binitghetiya/express-sequelize-api-boilerplate.git <folder-name>
```
or from **Download Zip**
```
https://github.com/binitghetiya/express-sequelize-api-boilerplate 
```
### Project Setup
Once you clone or download project go into you folder

>now cope **.env.local** file to **.env** file

### Installing
```
> npm install
```

### Database Config Setup
Create new database (let's say i'm going to use mysql and my database name is **express-sequelize-api**).
so in my **.env** file will set below parameters.
```
DB_HOST=localhost               # database connection host
DB_USER=root                    # database username
DB_PASS=secret@123              # database password
DB_NAME=express-sequelize-api   # database name
DB_PORT=3306                    # database port
```
some other inportant parameters/keys in **.env** file
```
APP_HOST=localhost      # application host name
APP_PORT=3000           # application port
SECRET=secret           # secret key for encrypt/decrypt JWT token
```


### Migration and Seeders run
After creating database and updating .env file run below commands
```
> npm run migrate
```
Migration will create users, oauth and password_reset tables

`npm start` to run your project 
>Everythig is setup and you are good to go now. Happy Coding :)

```

## Git Setup
```
> rm -rf .git  (Remove git folder so you can use your own git/bitbucket)
```
## Middlewares
```
> Passport: this will check user access token that we have return in login response.
```
### Login
```
> POST : http:localhost:4000/api/login   
> Payload: email, password
> Response : 
{
    "success": {
        "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MzcsImVtYWlsIjoiYWpvYmlld2VmZW1pMkBnbWFpbC5jb20iLCJmaXJzdG5hbWUiOiJGZW1pIiwibGFzdG5hbWUiOiJBam9iaWV3ZSIsImlhdCI6MTYyMTI0NjQ4OCwiZXhwIjoxNjIxMjQ4Mjg4fQ.tD4BiD_RiniQsY4iZff2JzqZBG5_PdFpsbvVK2M87AQ"
    }
}
```
### Register
```
> POST : http:localhost:4000/api/register
> Payload: firstname, lastname, email, password, mobile
> Response : 
{
    "success": {
        "status": "SUCCESS",
        "message": "Account created successfully"
    }
}
```
### Get user
```
> GET : http:localhost:8000/api/auth/profile   
> Headers : 
        Authorization: Bearer (access token)
> Response : 
{
    "success": {
        "status": "SUCCESS",
        "data": {
            "id": 37,
            "uuid": "39e59601-129f-4fe1-90c7-dffb66491112",
            "firstname": "Femmy",
            "lastname": "Ajobz",
            "password": "$2a$10$mkbqv1CXWGGMywJB8AXXqO97wbsvi5fUy6ccqn2LWVescA0K35tsy",
            "email": "ajobiewefemi@gmail.com",
            "mobile": "07033505443"
        }
    }
}
```
### Success Response
```
{
    "success": "SUCCESS",
    "message": "Success response"
    "data": "object or array" //optional
}
```
### Error Response
```
{
    "success": "ERROR,
    "message": "Error message"
}
```
### Upcoming update
```
> suggestions and improvements are most welcome
```

### Contact 
* Follow [@me](https://twitter.com/femiajobs) on Twitter
* Email <ajobiewefemi@gmail.com>