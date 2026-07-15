const crypto = require('crypto');
const userDB = require("../model/userdetails_model");

exports.generateToken = () => {
    const token = crypto.randomBytes(32).toString('hex');
    return token;
}

exports.saveResetTokenToDatabase = async (email, resetToken) => {
    const user = await userDB.findOneAndUpdate({ email: email }, { resetToken: resetToken });
    if (user) {
        console.log("Reset token saved to user's record");
    }
}

exports.saveOtpToDatabase = async (phone, otp) => {
    const user = await userDB.findOneAndUpdate({ phone: phone }, { otp: otp });
    if (user) {
        console.log("OTP is saved to user's record");
    }
}

// Uncomment and modify the following section according to your needs
// db.once('open', async () => {
//     const bcryptPass = await userUtilis.securePassword(password);
//     try {
//         const adminUser = await Admin.create({
//             email: 'admin@gmail.com',
//             password: bcryptPass
//         });
//         console.log("Admin user created");
//         process.exit(0);
//     } catch (e) {
//         console.error('Failed to create admin user', e);
//         process.exit(1);
//     }
// });
