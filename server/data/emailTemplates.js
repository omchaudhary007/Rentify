const emailTemplates = {
  otpVerification: (otp) => `
  <html>
  <body style="font-family: Arial, sans-serif; color: #333; background: #f9f9f9; padding: 20px;">
    <div style="max-width: 600px; margin: 0 auto; background: #fff; border: 1px solid #ddd; border-radius: 5px; padding: 20px;">
      <h1 style="color: #333;">Your Verification Code</h1>
      <p>Use the code below for verification:</p>
      <div style="font-size: 24px; font-weight: bold; color: #ff0000;">
        ${otp}
      </div>
      <p>If you didn’t request this code, you can ignore this email.</p>
      <div style="margin-top: 20px; font-size: 14px; color: #777;">
        Thanks,<br>The Rentify Team
      </div>
    </div>
  </body>
  </html>
`,

  welcomeEmail: (name) => `
  <html>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; padding: 20px; background-color: #f4f4f4;">
      <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 20px; border-radius: 8px; border: 1px solid #ddd;">
        <h1 style="color: #007bff;">Welcome to Rentify, ${name}!</h1>
        <p>We’re excited to have you with us. Thank you for joining Rentify!</p>
        <p>Best wishes,<br>The Rentify Team</p>
      </div>
    </body>
  </html>
`,
  deliverymanVerification: (count) => `
 <html>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; padding: 20px; background-color: #f4f4f4;">
      <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 20px; border-radius: 8px; border: 1px solid #ddd;">
        <h2 style="color: #ff9900;">Pending Deliveryman Verifications</h2>
        <p>Dear Admin,</p>
        <p>There are currently <strong>${count}</strong> deliveryman accounts verification is pending.</p>
        <p>Please log in to the admin dashboard to review and take necessary action.</p>
        <p>Thanks,<br>The Rentify Team</p>
      </div>
    </body>
  </html>
`,
};

export default emailTemplates;
