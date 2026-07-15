const userDB = require("../../model/userdetails_model");
const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");
const userUtils = require('../../utils/userUtils');

exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log("log in success");

    const user = await userDB.findOne({ email });

    if (!user) {
      console.log("User not found");
      return res.render('user_login', { message: "Invalid email or password" });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);

    if (passwordMatch) {
      if (user.isBlock) {
        return res.render('user_login', { message: "Your account is blocked. Please contact support." });
      } else {
        req.session.userId = user.email;
        return res.redirect('/');
      }
    } else {
      return res.render('user_login', { message: "Invalid email or password" });
    }
  } catch (e) {
    console.log("postlogin", e.message);
    return res.render('user_login', { message: "An error occurred during login" });
  }
};

exports.getForgot = async (req, res) => {
  res.render('forgot');
}

exports.postForgot = async (req, res) => {
  try {
    const userEmail = req.body.email;

    // Check if email is provided
    if (!userEmail) {
      return res.status(400).render('forgot', { message: 'Email is required' });
    }

    // Generate reset token
    const resetToken = userUtils.generateToken();

    // Save reset token to user's record in the database
    await userDB.findOneAndUpdate(
      { email: userEmail },
      { $set: { resetToken: resetToken } }
    );

    // Create Nodemailer transporter
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'mithrafaris31@gmail.com', // Enter your Gmail address here
        pass: 'jauc ukdv divv udgq' // Enter your Gmail password here
      }
    });

    // Construct email message
    const mailOptions = {
      from: 'mithrafaris31@gmail.com',
      to: userEmail, // Set recipient's email address
      subject: 'Password Reset',
      text: `Click the following link to reset your password: http://localhost:3000/resetPassword?token=${resetToken}`
    };

    // Send email
    await transporter.sendMail(mailOptions);

    console.log('Password reset email sent successfully');
    res.render('forgot', { emailLink: true });

  } catch (error) {
    console.error('Error sending password reset email:', error.message);
    res.status(500).render('forgot', { message: 'Error sending password reset email' });
  }
}


exports.postResetPassword = async (req, res) => {
  console.log("helloooooooooo");
  const resetToken = req.query.token;
  const newPassword = req.body.newPassword;
  const confirmPassword = req.body.confirmPassword;
  console.log(req.query.token);
  console.log(req.body.newPassword);
  console.log(req.body.confirmPassword);

  // verify the token against the stored tokens
  if (resetToken) {
    try {
      const user = await userDB.findOneAndUpdate({ resetToken: resetToken });

      if (user) {
        // validate the new password and confirm password
        if (newPassword === confirmPassword) {
          // Hash the new password
          const hashedPassword = await bcrypt.hash(newPassword, 10);
          // update the user's password in the database with the hashed password
          user.password = hashedPassword;
          console.log( hashedPassword );
          user.resetToken = undefined;
          console.log( user.resetToken );
        
          await user.save(); // Saving the changes to the user object

          // redirect to login page and display success message
          return res.render('user_login', { passwordMessage: "Password reset successfully" });
        } else {
          // handle password mismatch error
          return res.render('resetPass', { message: "New password and confirm password do not match" });
        }
      } else {
        // Handle invalid or expired reset token
        return res.render('resetPass', { message: "Invalid or expired reset token" });
      }
    } catch (error) {
      console.error(error);
      return res.render('resetPass', { message: "An error occurred while resetting password" });
    }
  } else {
    // Handle missing token
    return res.render('resetPass', { message: "Invalid reset token" });
  }
};
