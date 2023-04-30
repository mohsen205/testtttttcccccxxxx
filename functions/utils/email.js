const { functions, transporter } = require("./admin");

/*
Add the universal link attribute to the link after create them
<a href="https://example.com/myapp" 
   data-universal-link="https://myapp.bundle.id/">
  Open My App
</a>
*/

exports.sendEmailPassowrdHtmlBody = (email, password) => {
  return `<!DOCTYPE html>
  <html>
    <head>
      <meta charset="UTF-8" />
      <title>Bienvenue sur notre site web</title>
      <style>
        body {
          font-family: "Roboto", sans-serif;
          font-size: 16px;
          line-height: 1.5;
          color: #333;
          background-color: #f4f4f4;
        }
        .container {
          max-width: 600px;
          margin: 0 auto;
          padding: 40px 20px;
          border-radius: 10px;
          background-color: #fff;
          box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.1);
        }
        .logo {
          display: block;
          margin: 0 auto;
          width: 120px;
          height: auto;
        }
        h1 {
          margin-top: 0;
          margin-bottom: 40px;
          font-size: 24px;
          font-weight: 500;
          text-align: center;
          color: #333;
        }
        p {
          margin-bottom: 1.5em;
          font-size: 16px;
          line-height: 1.5;
          color: #555;
        }
        strong {
          font-weight: bold;
        }
        ul {
          margin-bottom: 1.5em;
          list-style: none;
          padding: 0;
        }
        li {
          margin-bottom: 0.5em;
          font-size: 16px;
          line-height: 1.5;
          color: #555;
        }
        a {
          color: #1A938C;
          text-decoration: none;
        }
        .button {
          display: inline-block;
          background-color: #1A938C;
          color: #fff;
          text-decoration: none;
          padding: 10px 20px;
          border-radius: 10px;
          margin-top: 1.5em;
          font-size: 16px;
          font-weight: 500;
          text-align: center;
          cursor: pointer;
          transition: background-color 0.2s ease-in-out;
        }
        .button:hover {
          background-color: #126662;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <img class="logo" src="http://bonsoins.net/wp-content/uploads/elementor/thumbs/logo-q2v96tim9xlupgbli12gny9zmg9jh6sifb4gm2osg0.png" alt="Bonsoins logo" />
        <h1>Bienvenue sur notre Application !</h1>
        <p>
          Merci de rejoindre notre communauté. Votre compte a été créé avec les
          informations de connexion suivantes :
        </p>
        <ul>
          <li><strong>Email :</strong> ${email}</li>
          <li><strong>Mot de passe :</strong> ${password}</li>
        </ul>
        <p>
          Vous pouvez maintenant vous connecter à notre site web et commencer à
          explorer toutes nos fonctionnalités et services.
        </p>
        <a href="https://example.com/myapp" 
            data-universal-link="https://myapp.bundle.id/" 
            class="button"> Se connecter</a>
      </div>
    </body>
  </html>
  `;
};

exports.sendEmail = async (data) => {
  const { recipient, subject, htmlBody } = data;

  const textBody = htmlBody
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, "")
    .replace(/<(?:.|\n)*?>/gm, "")
    .replace(/&nbsp;/g, " ")
    .replace(/<br\s*\/?>/g, "\n");

  const mailOptions = {
    from: "info@formationsbonsoins.com",
    to: recipient,
    subject: subject,
    text: textBody,
    html: htmlBody,
  };

  try {
    const result = await transporter.sendMail(mailOptions);
    return { message: "Email sent successfully." };
  } catch (error) {
    throw new functions.https.HttpsError(
      "internal",
      "Error sending email. Please try again later."
    );
  }
};
