var nodemailer = require('nodemailer');

var transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'dallahconf123@gmail.com',
    pass: 'Mahrifa 13'
  }
});

var mailOptions = {
  from: 'dallahconf123@gmail.com',
  to: 'toureabdoullah2552@gmail.com',
  subject: 'Sending Email using Node.js',
  text: `hello dallah`
};

transporter.sendMail(mailOptions, function(error, info){
  if (error) {
    console.log(error);
  } else {
    console.log('Email sent: ' + info.response);
  }
});
