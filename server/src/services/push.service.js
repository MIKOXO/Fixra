import firebase from '../config/firebase.js';

const sendPush = async (fcmToken, title, body, data = {}) => {
  if (!firebase) {
    return { success: false, error: 'Firebase not configured' };
  }

  try {
    const message = {
      token: fcmToken,
      notification: { title, body },
      data: Object.fromEntries(Object.entries(data).map(([k, v]) => [k, String(v)])),
    };

    const response = await firebase.messaging().send(message);
    return { success: true, data: response };
  } catch (error) {
    return { success: false, error: error.message, code: error.code };
  }
};

export { sendPush };
