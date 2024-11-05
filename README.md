# Chatbot Installation and Usage Guide

This guide provides step-by-step instructions to set up and use the chatbot system, including both the `chatbot_admin` and `chatbot` branches.

## 1. Install the Branches

Make sure to install both branches:

- **chatbot_admin**
- **chatbot**

## 2. Database Setup

The database required for this project is located in the `DB` folder within the `chatbot_admin` branch. 

## 3. Accessing the Admin Interface

To access the admin interface:

- Navigate to the index page at: [http://localhost/chatbot_admin/index_login.php](http://localhost/chatbot_admin/index_login.php)
- **Login Credentials**: Use the following credentials:
  - **Username**: `admin`
  - **Password**: `admin`

## 4. Running the Chatbot

To start the chatbot:

1. Open a terminal in the `chatbot` folder.
2. Run the command:
   ```bash
   npm run nodemon
