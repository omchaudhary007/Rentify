import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "omchaudhary0730@gmail.com",
    pass: process.env.GMAIL_PASSWORD,
  },
});

const sendmail =async (to, subject, message) => {
    try{
      const mailOptions = {
        from:'omchaudhary0730@gmail.com',
        to,
        subject,
        html: message,
      };
      const smtpResponse=await transporter.sendMail(mailOptions);
      
      // checking smtp server accepted or not
      if (smtpResponse.accepted.length > 0) {
        return { success: true, message: 'Email sended successfully.' };  
      } else {
        return { success: false, message: "Email not sended." }; 
      }
    }
    catch(error){
      return { success: false, message: error.message }; 
    }
};

export default sendmail;
