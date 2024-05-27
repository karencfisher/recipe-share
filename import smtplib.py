import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

# Configuration
sender = "Private Person <from@example.com>"
receiver = "A Test User <to@example.com>"

# Email content
subject = "HTML Email without Attachment"
html = """\
<html>
  <body>
    <p>Hi,<br>
    This is a <b>test</b> email without an attachment sent using <a href="https://www.python.org">Python</a>.</p>
  </body>
</html>
"""

# Create a multipart message and set headers
message = MIMEMultipart()
message["From"] = sender
message["To"] = receiver
message["Subject"] = subject

# Attach the HTML part
message.attach(MIMEText(html, "html"))

with smtplib.SMTP("sandbox.smtp.mailtrap.io", 2525) as server:
    server.starttls()
    server.login("26a65f99e3c29b", "7b4dfcd976cebb")
    server.sendmail(sender, receiver, message)

print('Sent')