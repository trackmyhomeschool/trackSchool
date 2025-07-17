// utils/sendEmail.js
const { Resend } = require('resend');
require('dotenv').config();
const resend = new Resend(process.env.RESEND_API_KEY);

const sendEmail = async (to, subject, text) => {
  const { data, error } = await resend.emails.send({
    from: 'Track My Homeschool <Chanelle@trackmyhomeschool.com>', // You can use your verified domain in production
    to,
    subject,
    text,
  });
  if (error) throw new Error(error.message);
  return data;
};



module.exports = sendEmail;
