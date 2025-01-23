const nodemailer = require("nodemailer");
const randomize = require("random-number");

exports.sendMail = async (req, res, next) => {
  try {
    console.log("req.body.email", req.body.email);
    // Generate a 4-digit OTP
    const otp = randomize({ min: 100000, max: 999999, integer: true });
    // console.log("🚀 ~ exports.sendMail= ~ otp:", otp);

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "fataniyakeyur50@gmail.com",
        pass: "vssz bgkq fjyg bgbf",
      },
    });

    const mailOptions = await transporter.sendMail({
      from: process.env.SMTP_USER, // sender address
      to: `${req.body.email}`, // list of receivers
      subject: "OTP ✔", // Subject line
      text: `Your OTP for account verification is: ${otp}`, // plain text body
      html: `<h1>Please confirm your OTP</h1>
    <p>Here is your OTP code: ${otp}</p>`, // html body
    });
    console.log("Email sent: %s", mailOptions.messageId);

    req.otp = otp;
    next();
  } catch (error) {
    console.error("Error sending email:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
