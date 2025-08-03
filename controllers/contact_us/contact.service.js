const sendMail = require("../../middlewares/mailer");

exports.sendContactMail = async function (req, res) {
  try {
    const { name, email, address, phone, message } = req.body;

    const htmlMessage = `
      <div style="font-family: Arial, sans-serif; background: #f9f9f9; padding: 30px;">
        <div style="max-width: 600px; margin: auto; background: #fff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.05); padding: 24px;">
          <h2 style="color: #2a7ae2; margin-bottom: 16px;">New Contact Request</h2>
          <p style="font-size: 16px; color: #333;">You have received a new contact request from your website:</p>
          <table style="width: 100%; margin: 20px 0;">
            <tr>
              <td style="font-weight: bold; color: #555;">Name:</td>
              <td>${name}</td>
            </tr>
            <tr>
              <td style="font-weight: bold; color: #555;">Email:</td>
              <td>${email}</td>
            </tr>
            <tr>
              <td style="font-weight: bold; color: #555;">Address:</td>
              <td>${address}</td>
            </tr>
            <tr>
              <td style="font-weight: bold; color: #555;">Phone:</td>
              <td>${phone}</td>
            </tr>
          </table>
          <div style="margin-top: 20px;">
            <h3 style="color: #2a7ae2;">Message</h3>
            <p style="background: #f1f7ff; padding: 16px; border-radius: 6px; color: #222;">${message}</p>
          </div>
        </div>
        <p style="text-align: center; color: #aaa; font-size: 12px; margin-top: 24px;">&copy; ${new Date().getFullYear()} Arabian Sky. All rights reserved.</p>
      </div>
    `;

    await sendMail(email, "New Contact Request", htmlMessage);

    res.status(201).json({
      message: "Mail sent successfully.",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Something went wrong. Please try again.",
      error: error.message,
    });
  }
};