function validateName(name) {
  return name.length <= 50 && /^[A-Za-z\s]{1,50}$/.test(name);
}

function validateEmail(email) {
  return email.length <= 50 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function validatePhone(phone) {
  return /^\+\d{1,4}\d{10,15}$/.test(phone);
}

function validatePasswordLength(password) {
  return password.length >= 6;
}

function getNumberDuration(duration) {
  const durationMap = {
    monthPercent: 1,
    threeMonthPercent: 3,
    sixMonthPercent: 6,
    oneYearPercent: 12,
    twoYearPercent: 24,
  };

  return durationMap[duration];
}
function  getDeliveryCharge (weight, length, width, height){
  const w = parseFloat(weight);
  const l = parseFloat(length);
  const b = parseFloat(width);
  const h = parseFloat(height);

  let charge = 100;

  const weightExtra = Math.max(0, Math.ceil((w - 5) / 5));
  const lengthExtra = Math.max(0, Math.ceil((l - 50) / 50));
  const widthExtra = Math.max(0, Math.ceil((b - 50) / 50));
  const heightExtra = Math.max(0, Math.ceil((h - 50) / 50));

  const extraUnits = weightExtra + lengthExtra + widthExtra + heightExtra;
  charge += extraUnits * 100;

  return parseInt(charge);
};

export {
  validateName,
  validateEmail,
  validatePhone,
  validatePasswordLength,
  getNumberDuration,
  getDeliveryCharge
};
