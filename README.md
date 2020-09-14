# GuestBook, A Live Guestbook System

https://limitless-stream-31809.herokuapp.com

## Project Description

```
A simple guestbook app where users can leave messages to each others and also reply to them.
```

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

	1) Nodejs
	2) Mongodb
	3) NPM
	4) Git

### Installing

Setting up the local server

```
1) git clone https://github.com/ebrahimamer/guestbook-backend
2) Open terminal and change its location where you cloned the repo
3) Run command npm install
4) After all dependencies are installed. 
5) Add nodemon.json file in the project root directory and add the following: 
{
    "env": {
        "DB_USER": "",
        "DB_PASSWORD":"",
        "DB_NAME": "guestbook",
        "JWT_KEY": "PrivateKey.Dont.share"
    }
}
with your credentials
6) In your terminal, Run command: npm run start:dev
5) Now, server is running on http://localhost:5000
```

## Author

* **Ebrahim Mansour** 
