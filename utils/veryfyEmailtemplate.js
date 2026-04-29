const VerificationEmail = (username, otp) => {
  return `<!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Email Verification</title>
        <style>
            body {
            font-family: Arial, sans-serif;
           margin: 0;
            padding: 0;
            background-color: #f4f4f4;
            }

            .container {
                max-width: 600px;
                margin: 20px auto;
                background: #fff;
                padding:20px;
                border-radius: 8px;
                box-shadow: 0 4px 6px rgba(0,0,0,0.1);
            }

            .header {
                text-align: center;
                border-bottom: 1px solid #eee;
                padding-bottom: 10px;
                margin-bottom: 20px;
            }

            .heaer h1 {
                color: #4CAF50;
            }

            .content {
                text-align: center;
            }

            .content p {
            font-size: 16px;
            line-height: 1.5;
            }

            .otp {
                font-size: 20px;
                font-weight: bold;
                color: #CAF550;
                margin-top: 20px;
            }
        </style>
    </head>
    <body>
        <div className="container">
        <div className="header">
        <h1> Please ${username} Verify Your Email Address</h1>
        </div>

        <div className="content">
            <p>Thank you for registering with Spices Gold. Please use the OTP below to verify your email address:</p>
            <div className="otp">${otp}</div>
            <p>If you didn't create an account, you can safety ignore this email.</p>
        </div>

        <div className="footer">
            <p>&copy; 2024 Spicez Gold.All rights reserved.</p>
        </div>
        </div>
    </body>
    </html>`;
};

export default VerificationEmail;
