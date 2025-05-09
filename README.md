####
Make the following changes during deployment

1. Controllers > authController > Login
        Change access_token expiresIn = 15m
        Change fresh_token expiresIn = 1d

    do the same on refreshToken Controller
        Change access_token expiresIn = 15m
        Change fresh_token expiresIn = 1d


2. For frontend to get the Bearer token
    ![Alt Text](token.jpg)

    For protected routes, the frontend has to send authorization header Bearer

