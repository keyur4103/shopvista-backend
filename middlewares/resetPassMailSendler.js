const nodemailer = require("nodemailer");

const sendMail = async (email, subject, text) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "fataniyakeyur50@gmail.com",
        pass: "vssz bgkq fjyg bgbf",
      },
    });

    await transporter.sendMail({
      from: "fataniyakeyur50@gmail.com",
      to: email,
      subject: subject,
      text: text,
    });
  } catch (error) {
    console.log(error, "email not sent");
  }
};

module.exports = sendMail;
